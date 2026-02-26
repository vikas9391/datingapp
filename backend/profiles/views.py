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
        return Response({
            'swipes_used': profile.swipes_used,
            'swipes_remaining': max(0, FREE_SWIPE_LIMIT - profile.swipes_used),
            'limit_reached': profile.swipes_used >= FREE_SWIPE_LIMIT and not profile.premium,
        })
    except UserProfile.DoesNotExist:
        return Response({
            'swipes_used': 0,
            'swipes_remaining': FREE_SWIPE_LIMIT,
            'limit_reached': False,
        })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def increment_swipe_count(request):
    try:
        with transaction.atomic():
            profile = UserProfile.objects.select_for_update().get(user=request.user)

            # Premium users bypass the gate — still track but don't block
            if not profile.premium and profile.swipes_used >= FREE_SWIPE_LIMIT:
                return Response(
                    {'error': 'Swipe limit reached. Upgrade to Premium.'},
                    status=status.HTTP_403_FORBIDDEN,
                )

            profile.swipes_used = F('swipes_used') + 1
            profile.save(update_fields=['swipes_used'])
            profile.refresh_from_db()

            return Response({
                'swipes_used': profile.swipes_used,
                'swipes_remaining': max(0, FREE_SWIPE_LIMIT - profile.swipes_used),
                'limit_reached': (
                    profile.swipes_used >= FREE_SWIPE_LIMIT and not profile.premium
                ),
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
    """
    GET /api/profile/
    Returns the full profile for the authenticated user.
    Syncs the live match count from the Match table on every call so the
    frontend Settings page always shows an accurate number.
    """
    try:
        profile = UserProfile.objects.select_related('user').get(user=request.user)
    except UserProfile.DoesNotExist:
        return Response(
            {"detail": "Profile not found. Please complete onboarding.", "profile_exists": False},
            status=status.HTTP_404_NOT_FOUND,
        )

    # Keep UserProfile.matches in sync with the real Match table
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