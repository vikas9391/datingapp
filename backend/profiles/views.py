from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.db import transaction
from django.db.models import F, Q
from .models import UserProfile
from .serializers import UserProfileSerializer
from .managers import MySQLProfileManager as FirebaseProfileManager
from admin_panel.models import PremiumPlan 
from django.utils import timezone


FREE_SWIPE_LIMIT = 3

# ── helpers ────────────────────────────────────────────────────────────────────

def _sync_matches_count(profile: UserProfile) -> int:
    """
    Recompute the live match count from the Match table and keep
    UserProfile.matches in sync so the admin panel stays accurate.
    Returns the fresh count.
    """
    try:
        from login.models import Match
        email = (profile.user.email or profile.user.username or "").lower()
        count = Match.objects.filter(
            Q(user_a=email) | Q(user_b=email),
            status="active",
        ).count()
        if profile.matches != count:
            UserProfile.objects.filter(pk=profile.pk).update(matches=count)
            profile.matches = count
        return count
    except Exception:
        return profile.matches or 0


# ── swipe endpoints ────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_swipe_count(request):
    try:
        profile = UserProfile.objects.get(user=request.user)

        # ── Auto-reset if last swipe was on a previous calendar day ──────
        now = timezone.now()
        last_reset = profile.swipes_reset_at  # field must exist on model
        if last_reset is None or last_reset.date() < now.date():
            profile.swipes_used = 0
            profile.swipes_reset_at = now
            profile.save(update_fields=['swipes_used', 'swipes_reset_at'])

        is_premium = (
            profile.premium
            and profile.premium_expires_at
            and profile.premium_expires_at > now
        )

        effective_limit = None
        if is_premium:
            try:
                plan = PremiumPlan.objects.get(name=profile.premium_plan)
                effective_limit = plan.daily_swipe_limit
            except PremiumPlan.DoesNotExist:
                pass
        else:
            effective_limit = FREE_SWIPE_LIMIT

        swipes_used = profile.swipes_used or 0

        return Response({
            'swipes_used': swipes_used,
            'swipes_remaining': (
                max(0, effective_limit - swipes_used)
                if effective_limit is not None
                else None
            ),
            'limit_reached': (
                effective_limit is not None and swipes_used >= effective_limit
            ),
            'is_premium': is_premium,
            'daily_limit': effective_limit,
        })
    except UserProfile.DoesNotExist:
        return Response({
            'swipes_used': 0,
            'swipes_remaining': FREE_SWIPE_LIMIT,
            'limit_reached': False,
            'is_premium': False,
            'daily_limit': FREE_SWIPE_LIMIT,
        })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def increment_swipe_count(request):
    try:
        with transaction.atomic():
            profile = UserProfile.objects.select_for_update().get(user=request.user)

            is_premium = (
                profile.premium
                and hasattr(profile, 'premium_expires_at')
                and profile.premium_expires_at
                and profile.premium_expires_at > timezone.now()
            )

            swipes_used = profile.swipes_used or 0

            if is_premium:
                # ── Premium: check plan's daily_swipe_limit ───────────────
                try:
                    plan = PremiumPlan.objects.get(name=profile.premium_plan)

                    if plan.daily_swipe_limit is not None:
                        if swipes_used >= plan.daily_swipe_limit:
                            return Response(
                                {
                                    'error': f'Daily swipe limit of {plan.daily_swipe_limit} reached for your {plan.name} plan.',
                                    'swipes_used': swipes_used,
                                    'limit': plan.daily_swipe_limit,
                                },
                                status=status.HTTP_403_FORBIDDEN,
                            )
                    # daily_swipe_limit is None = unlimited, fall through

                except PremiumPlan.DoesNotExist:
                    pass  # Plan not found — allow the swipe

            else:
                # ── Free user: hard cap at FREE_SWIPE_LIMIT ───────────────
                if swipes_used >= FREE_SWIPE_LIMIT:
                    return Response(
                        {
                            'error': 'Swipe limit reached. Upgrade to Premium.',
                            'swipes_used': swipes_used,
                            'limit': FREE_SWIPE_LIMIT,
                        },
                        status=status.HTTP_403_FORBIDDEN,
                    )

            # ── Record the swipe ──────────────────────────────────────────
            profile.swipes_used = F('swipes_used') + 1
            profile.save(update_fields=['swipes_used'])
            profile.refresh_from_db()

            new_count = profile.swipes_used or 0

            effective_limit = FREE_SWIPE_LIMIT if not is_premium else (
                PremiumPlan.objects.filter(name=profile.premium_plan)
                .values_list('daily_swipe_limit', flat=True)
                .first()
            )

            return Response({
                'swipes_used': new_count,
                'swipes_remaining': (
                    max(0, effective_limit - new_count)
                    if effective_limit is not None
                    else None
                ),
                'limit_reached': (
                    effective_limit is not None and new_count >= effective_limit
                ),
                'is_premium': is_premium,
                'daily_limit': effective_limit,
            })

    except UserProfile.DoesNotExist:
        return Response(
            {'error': 'Profile not found'},
            status=status.HTTP_404_NOT_FOUND,
        )
# ── primary profile CRUD ───────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    try:
        profile = UserProfile.objects.select_related('user').get(user=request.user)
    except UserProfile.DoesNotExist:
        return Response(
            {"detail": "Profile not found. Please complete onboarding.", "profile_exists": False},
            status=status.HTTP_404_NOT_FOUND,
        )

    # ── Auto-expire premium if subscription has lapsed ────────────────────
    if (
        profile.premium
        and profile.premium_expires_at
        and profile.premium_expires_at <= timezone.now()
    ):
        profile.premium = False
        profile.save(update_fields=["premium", "updated_at"])

    _sync_matches_count(profile)

    serializer = UserProfileSerializer(profile)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def create_or_update_profile(request):
    data = request.data.copy()
    if 'socialAccounts' in data:
        data['social_accounts'] = data.pop('socialAccounts')

    # Recalculate completion_percentage if onboarding_step is provided
    step = data.get('onboarding_step')
    if step is not None:
        try:
            step = int(step)
            step = max(0, min(10, step))
            data['onboarding_step'] = step
            data['completion_percentage'] = round(step / 10 * 100, 1)
        except (TypeError, ValueError):
            pass

    try:
        profile = UserProfile.objects.get(user=request.user)
        partial = request.method == 'PATCH'
        serializer = UserProfileSerializer(profile, data=data, partial=partial)
    except UserProfile.DoesNotExist:
        serializer = UserProfileSerializer(data=data)

    if serializer.is_valid():
        saved_profile = serializer.save(user=request.user)
        response_data = UserProfileSerializer(saved_profile).data
        return Response(
            {"message": "Profile saved successfully", "profile": response_data},
            status=status.HTTP_200_OK,
        )

    return Response(
        {"detail": "Invalid data", "errors": serializer.errors},
        status=status.HTTP_400_BAD_REQUEST,
    )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_profile(request):
    try:
        profile = UserProfile.objects.get(user=request.user)
        profile.delete()
        return Response(
            {"message": "Profile deleted successfully"},
            status=status.HTTP_204_NO_CONTENT,
        )
    except UserProfile.DoesNotExist:
        return Response(
            {"detail": "Profile not found"},
            status=status.HTTP_404_NOT_FOUND,
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_status(request):
    try:
        profile = UserProfile.objects.select_related('user').get(user=request.user)
        _sync_matches_count(profile)
        return Response({
            "profile_exists": True,
            "profile_complete": profile.is_complete,
            "profile": UserProfileSerializer(profile).data,
        })
    except UserProfile.DoesNotExist:
        return Response({
            "profile_exists": False,
            "profile_complete": False,
            "profile": None,
        })


# ── class-based views ─────────────────────────────────────────────────────────

class ProfileView(APIView):
    """
    Onboarding-style profile save used by the login app flow.
    POST /api/profile/onboarding/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        email = request.user.username
        data = dict(request.data)

        try:
            step = int(data.get("onboarding_step", 0))
        except (TypeError, ValueError):
            step = 0

        TOTAL_STEPS = 10
        step = max(0, min(TOTAL_STEPS, step))
        completion_percentage = round(step / TOTAL_STEPS * 100, 1) if step > 0 else 0

        data["onboarding_step"] = step
        data["completion_percentage"] = completion_percentage

        FirebaseProfileManager.create_profile(email, **data)
        updated_profile = FirebaseProfileManager.get_profile(email) or {}

        return Response(
            {
                "message": "Profile saved",
                "step": step,
                "completion_percentage": completion_percentage,
                "profile": updated_profile,
            },
            status=status.HTTP_200_OK,
        )


class ProfileDetailView(APIView):
    """
    Public profile lookup by email.
    GET /api/profile/detail/<email>/
    """
    permission_classes = [AllowAny]

    def get(self, request, email):
        profile = FirebaseProfileManager.get_profile(email)
        if profile:
            return Response(profile, status=status.HTTP_200_OK)
        return Response(
            {"error": "Profile not found"},
            status=status.HTTP_404_NOT_FOUND,
        )