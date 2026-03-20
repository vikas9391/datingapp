from decimal import Decimal
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth import authenticate, get_user_model
from django.conf import settings
from django.shortcuts import redirect
from django.core.mail import send_mail
from django.core.cache import cache
from django.db import transaction

import hmac
import hashlib
import urllib.parse
import requests
import random
from django.db.models import Q
import string


from math import radians, sin, cos, asin, sqrt

from admin_panel.models import PremiumPlan, PromoCode, UserReport
from login.serializers import (
    CreateUserReportSerializer,
    NotificationSerializer,
)

from .models import (
    Match,
    Like,
    Payment,
    BlockedUser,
    Notification,
    Message,
    NotificationPreference,
    MySQLAuthManager as FirebaseAuthManager,
)

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from login.mysql_managers import MySQLChatManager, MySQLLikeManager as FirebaseLikeManager

from profiles.models import UserProfile
from profiles.managers import MySQLProfileManager as FirebaseProfileManager

from .razorpay_client import client
from .ws import notify_user

from django.contrib.auth.models import User

from django.db.models import Count         
from .models import Chat, ChatParticipant   

# ---------- OTP helpers ----------

def generate_otp(length: int = 6) -> str:
    return "".join(random.choice(string.digits) for _ in range(length))


def send_otp_email(email: str, otp: str) -> None:
    subject = "The Dating App: your sign-in code"
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", settings.EMAIL_HOST_USER)
    otp_digits = " ".join(list(str(otp)))

    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Sign-In Code</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Helvetica, Arial, sans-serif; background-color: #ffffff;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; width: 100%;">
            <tr>
                <td align="center" style="padding: 40px 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; margin: 0 auto;">
                        <tr>
                            <td style="padding: 0 0 30px 0; text-align: left;">
                                <h1 style="margin: 0; font-size: 28px; font-weight: 700; background: linear-gradient(90deg, #0095E0 0%, #00C98B 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                                    The Dating App
                                </h1>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 0 0 30px 0;">
                                <h2 style="margin: 0 0 20px 0; color: #000000; font-size: 24px; font-weight: 700; line-height: 1.3;">
                                    Enter this code to sign in
                                </h2>
                                <div style="margin: 30px 0; text-align: left;">
                                    <span style="display: inline-block; color: #000000; font-size: 48px; font-weight: 700; letter-spacing: 12px; padding: 20px 0;">
                                        {otp_digits}
                                    </span>
                                </div>
                                <p style="margin: 0 0 20px 0; color: #000000; font-size: 16px; line-height: 1.5;">
                                    Enter the code above on your device to sign in to The Dating App.
                                </p>
                                <p style="margin: 0 0 20px 0; color: #000000; font-size: 16px; line-height: 1.5;">
                                    This code will expire in <strong>5 minutes</strong>.
                                </p>
                                <p style="margin: 0 0 20px 0; color: #737373; font-size: 14px; line-height: 1.5;">
                                    If you didn't send this request, you can ignore this email or review your recent device activity.
                                </p>
                                <p style="margin: 0; color: #737373; font-size: 14px; line-height: 1.5;">
                                    To help security, please don't share this code with anyone.
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px 0 40px 0;">
                                <p style="margin: 0; color: #000000; font-size: 16px; font-weight: 600;">
                                    The Dating App team
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px 0 0 0; border-top: 1px solid #e6e6e6;">
                                <p style="margin: 0 0 15px 0; color: #737373; font-size: 13px; line-height: 1.6;">
                                    <a href="#" style="color: #0095E0; text-decoration: none;">Help Centre</a> |
                                    <a href="#" style="color: #0095E0; text-decoration: none;">Terms of Use</a> |
                                    <a href="#" style="color: #0095E0; text-decoration: none;">Privacy</a>
                                </p>
                                <p style="margin: 0; color: #737373; font-size: 11px; line-height: 1.5;">
                                    This message was emailed to {email} by The Dating App.
                                </p>
                                <p style="margin: 10px 0 0 0; color: #737373; font-size: 11px; line-height: 1.5;">
                                    Made with ❤️ in Hyderabad
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

    plain_message = f"""
The Dating App

Enter this code to sign in

{otp_digits}

Enter the code above on your device to sign in to The Dating App.

This code will expire in 5 minutes.

If you didn't send this request, you can ignore this email or review your recent device activity.

To help security, please don't share this code with anyone.

The Dating App team

---
Help Centre | Terms of Use | Privacy

This message was emailed to {email} by The Dating App.
Made with ❤️ in Hyderabad
    """.strip()

    send_mail(
        subject=subject,
        message=plain_message,
        from_email=from_email,
        recipient_list=[email],
        html_message=html_message,
    )
    cache.set(f"login_otp_{email}", otp, timeout=300)


def send_password_reset_email(email: str, otp: str) -> None:
    subject = "Reset Your Password - The Dating App"
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", settings.EMAIL_HOST_USER)
    otp_digits = " ".join(list(str(otp)))

    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Helvetica, Arial, sans-serif; background-color: #ffffff;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; width: 100%;">
            <tr>
                <td align="center" style="padding: 40px 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; margin: 0 auto;">
                        <tr>
                            <td style="padding: 0 0 30px 0; text-align: left;">
                                <h1 style="margin: 0; font-size: 28px; font-weight: 700; background: linear-gradient(90deg, #0095E0 0%, #00C98B 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                                    The Dating App
                                </h1>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 0 0 30px 0;">
                                <h2 style="margin: 0 0 20px 0; color: #000000; font-size: 24px; font-weight: 700; line-height: 1.3;">
                                    Reset your password
                                </h2>
                                <p style="margin: 0 0 20px 0; color: #000000; font-size: 16px; line-height: 1.5;">
                                    We received a request to reset your password. Enter this code to continue:
                                </p>
                                <div style="margin: 30px 0; text-align: left;">
                                    <span style="display: inline-block; color: #000000; font-size: 48px; font-weight: 700; letter-spacing: 12px; padding: 20px 0;">
                                        {otp_digits}
                                    </span>
                                </div>
                                <p style="margin: 0 0 20px 0; color: #000000; font-size: 16px; line-height: 1.5;">
                                    This code will expire in <strong>5 minutes</strong>.
                                </p>
                                <p style="margin: 0 0 20px 0; color: #737373; font-size: 14px; line-height: 1.5;">
                                    If you didn't request a password reset, you can safely ignore this email.
                                </p>
                                <p style="margin: 0; color: #737373; font-size: 14px; line-height: 1.5;">
                                    For security, please don't share this code with anyone.
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px 0 40px 0;">
                                <p style="margin: 0; color: #000000; font-size: 16px; font-weight: 600;">
                                    The Dating App team
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px 0 0 0; border-top: 1px solid #e6e6e6;">
                                <p style="margin: 0 0 15px 0; color: #737373; font-size: 13px; line-height: 1.6;">
                                    <a href="#" style="color: #0095E0; text-decoration: none;">Help Centre</a> |
                                    <a href="#" style="color: #0095E0; text-decoration: none;">Terms of Use</a> |
                                    <a href="#" style="color: #0095E0; text-decoration: none;">Privacy</a>
                                </p>
                                <p style="margin: 0; color: #737373; font-size: 11px; line-height: 1.5;">
                                    This message was emailed to {email} by The Dating App.
                                </p>
                                <p style="margin: 10px 0 0 0; color: #737373; font-size: 11px; line-height: 1.5;">
                                    Made with ❤️ in Hyderabad
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

    plain_message = f"""
The Dating App

Reset your password

We received a request to reset your password. Enter this code to continue:

{otp_digits}

This code will expire in 5 minutes.

If you didn't request a password reset, you can safely ignore this email.

For security, please don't share this code with anyone.

The Dating App team
    """.strip()

    send_mail(
        subject=subject,
        message=plain_message,
        from_email=from_email,
        recipient_list=[email],
        html_message=html_message,
    )


def is_blocked(sender: str, receiver: str) -> bool:
    return BlockedUser.objects.filter(blocker=receiver, blocked=sender).exists()


# ---------- Password Reset Views ----------

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"detail": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            User.objects.get(username=email)
        except User.DoesNotExist:
            # Generic response to prevent email enumeration
            return Response(
                {"message": "If this email exists, a password reset code has been sent"},
                status=status.HTTP_200_OK,
            )

        otp = generate_otp()
        send_password_reset_email(email, otp)
        cache.set(f"reset_otp_{email}", otp, timeout=300)

        return Response({"message": "Password reset code sent to your email"}, status=status.HTTP_200_OK)


class VerifyResetOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")

        if not email or not otp:
            return Response({"detail": "Email and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)

        saved_otp = cache.get(f"reset_otp_{email}")
        if not saved_otp:
            return Response({"detail": "OTP expired or not found"}, status=status.HTTP_400_BAD_REQUEST)
        if str(saved_otp) != str(otp):
            return Response({"detail": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

        reset_token = generate_otp(length=32)
        cache.set(f"reset_token_{email}", reset_token, timeout=600)

        return Response(
            {"message": "OTP verified", "reset_token": reset_token, "email": email},
            status=status.HTTP_200_OK,
        )


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        reset_token = request.data.get("reset_token")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        if not all([email, reset_token, new_password, confirm_password]):
            return Response({"detail": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)
        if new_password != confirm_password:
            return Response({"detail": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)
        if len(new_password) < 8:
            return Response({"detail": "Password must be at least 8 characters"}, status=status.HTTP_400_BAD_REQUEST)

        saved_token = cache.get(f"reset_token_{email}")
        if not saved_token or saved_token != reset_token:
            return Response({"detail": "Invalid or expired reset token"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(username=email)
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        user.set_password(new_password)
        user.save()
        cache.delete(f"reset_token_{email}")
        cache.delete(f"reset_otp_{email}")

        return Response(
            {"message": "Password reset successful. You can now login with your new password."},
            status=status.HTTP_200_OK,
        )


# ---------- Auth Views ----------

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        from django.utils import timezone

        username        = request.data.get("username")
        password        = request.data.get("password")
        agreed_to_terms = request.data.get("agreed_to_terms", False)
        age_confirmed   = request.data.get("age_confirmed", False)

        if not username or not password:
            return Response({"detail": "Username and password required"}, status=status.HTTP_400_BAD_REQUEST)

        # Enforce consent — must agree before account is created
        if not agreed_to_terms:
            return Response({"detail": "You must agree to the Terms of Service and Privacy Policy"}, status=status.HTTP_400_BAD_REQUEST)
        if not age_confirmed:
            return Response({"detail": "You must confirm that you are 18 years or older"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"detail": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, password=password)

        FirebaseAuthManager.create_or_update_user(
            email=username,
            auth_provider="email",
            django_user_id=str(user.pk),
            is_verified=False,
            agreed_to_terms=True,
            age_confirmed=True,
            consent_at=timezone.now(),
        )

        return Response(
            {
                "message": "User created successfully",
                "user_id": user.pk,
                "username": user.username,
                "is_verified": False,
            },
            status=status.HTTP_201_CREATED,
        )

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response({"detail": "Username and password required"}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)
        if not user:
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        if user.is_staff:
            return Response({"detail": "Staff users must use admin login endpoint"}, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)
        email = user.username
        auth_user = FirebaseAuthManager.get_user_by_email(email)
        profile = FirebaseProfileManager.get_profile(email)
        is_verified = auth_user.get("is_verified", False) if auth_user else False

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.pk,
                    "email": email,
                    "is_verified": is_verified,
                    "firebase_user": auth_user or {},
                    "profile": profile or {},
                },
            },
            status=status.HTTP_200_OK,
        )


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        base_url = "https://accounts.google.com/o/oauth2/v2/auth"
        params = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": settings.GOOGLE_CALLBACK_URL,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "consent",
        }
        url = f"{base_url}?{urllib.parse.urlencode(params)}"
        return Response({"auth_url": url}, status=status.HTTP_200_OK)


class GoogleCallbackView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        code = request.GET.get("code")
        if not code:
            return redirect(f"{settings.FRONTEND_URL}/login?error=oauth_no_code")

        token_res = requests.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_CALLBACK_URL,
                "grant_type": "authorization_code",
            },
        )
        token_json = token_res.json()
        google_access_token = token_json.get("access_token")
        if not google_access_token:
            return redirect(f"{settings.FRONTEND_URL}/login?error=oauth_no_tokens")

        userinfo = requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {google_access_token}"},
        ).json()
        email = userinfo.get("email")
        name = userinfo.get("name")
        google_user_id = userinfo.get("sub")

        if not email:
            return redirect(f"{settings.FRONTEND_URL}/login?error=oauth_no_email")

        user, created = User.objects.get_or_create(
            username=email,
            defaults={
                "email": email,
                "first_name": name.split()[0] if name else "",
                "last_name": " ".join(name.split()[1:]) if name else "",
            },
        )

        FirebaseAuthManager.create_or_update_user(
            email=email,
            auth_provider="google",
            django_user_id=str(user.pk),
            google_id=google_user_id,
            name=name,
            is_verified=True,
        )

        refresh = RefreshToken.for_user(user)
        redirect_url = (
            f"{settings.FRONTEND_HOME_URL}"
            f"?access_token={urllib.parse.quote(str(refresh.access_token))}"
            f"&refresh_token={urllib.parse.quote(str(refresh))}"
            f"&email={urllib.parse.quote(email)}"
            f"&name={urllib.parse.quote(name or '')}"
            f"&google_id={urllib.parse.quote(google_user_id or '')}"
            f"&is_new_user={created}"
        )
        return redirect(redirect_url)


class AuthStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        email = request.user.username
        profile = FirebaseProfileManager.get_profile(email)
        auth_user = FirebaseAuthManager.get_user_by_email(email)

        return Response(
            {
                "email": email,
                "profile_exists": bool(profile),
                "has_profile": bool(profile),
                "is_verified": auth_user.get("is_verified", False) if auth_user else False,
                "firebase_user": auth_user or {},
                "profile": profile or {},
            },
            status=status.HTTP_200_OK,
        )


# ---------- OTP Email Verification ----------

class SendLoginOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        if not username:
            return Response({"detail": "Username (email) required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        auth_user = FirebaseAuthManager.get_user_by_email(username)
        if auth_user and auth_user.get("is_verified", False):
            return Response({"detail": "Email already verified. Use normal login."}, status=status.HTTP_400_BAD_REQUEST)

        otp = generate_otp()
        send_otp_email(username, otp)
        return Response({"message": "OTP sent to email"}, status=status.HTTP_200_OK)


class VerifyEmailOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        otp = request.data.get("otp")

        if not username or not otp:
            return Response({"detail": "Username (email) and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)

        cache_key = f"login_otp_{username}"
        saved_otp = cache.get(cache_key)

        if not saved_otp:
            return Response({"detail": "OTP expired or not found"}, status=status.HTTP_400_BAD_REQUEST)
        if str(saved_otp) != str(otp):
            return Response({"detail": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

        cache.delete(cache_key)
        FirebaseAuthManager.create_or_update_user(email=username, auth_provider="email", is_verified=True)

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response(
            {"message": "Email verified successfully", "user_id": user.pk, "is_verified": True},
            status=status.HTTP_200_OK,
        )


class VerifyLoginOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        otp = request.data.get("otp")

        if not username or not otp:
            return Response({"detail": "Username (email) and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)

        cache_key = f"login_otp_{username}"
        saved_otp = cache.get(cache_key)

        if not saved_otp:
            return Response({"detail": "OTP expired or not found"}, status=status.HTTP_400_BAD_REQUEST)
        if str(saved_otp) != str(otp):
            return Response({"detail": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

        cache.delete(cache_key)

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        auth_user = FirebaseAuthManager.get_user_by_email(username)
        if auth_user and auth_user.get("is_verified", False):
            return Response({"detail": "Email already verified. Use normal login."}, status=status.HTTP_400_BAD_REQUEST)

        FirebaseAuthManager.create_or_update_user(email=username, auth_provider="email", is_verified=True)

        refresh = RefreshToken.for_user(user)
        profile = FirebaseProfileManager.get_profile(username)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.pk,
                    "email": username,
                    "is_verified": True,
                    "firebase_user": auth_user or {},
                    "profile": profile or {},
                },
            },
            status=status.HTTP_200_OK,
        )


# ---------- Matching helpers ----------

def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return R * 2 * asin(sqrt(a))


def list_overlap(a, b):
    a, b = a or [], b or []
    if not a or not b:
        return 0.0
    sa, sb = set(a), set(b)
    return len(sa & sb) / len(sa | sb)


def categorical_exact(a, b):
    return 1.0 if a and b and a == b else 0.0


def distance_similarity_km(distance_km, hard_limit_km):
    if not hard_limit_km or hard_limit_km <= 0:
        return 0.0
    return max(0.0, 1.0 - distance_km / hard_limit_km)


WEIGHTS = {
    "sexual_orientation": 0.30,
    "relationship_goals": 0.25,
    "communication": 0.15,
    "lifestyle": 0.15,
    "interests": 0.10,
    "distance_soft": 0.05,
}


def normalize_gender(label):
    if not label:
        return None
    label = label.lower().strip()
    if label in ("male", "man", "m"):
        return "man"
    if label in ("female", "woman", "f"):
        return "woman"
    return None


def serialize_profile(profile: UserProfile) -> dict:
    return {
        "id": profile.user.pk,
        "email": profile.user.email,
        "username": profile.user.username,
        "first_name": profile.first_name,
        "age": profile.age,
        "gender": profile.gender,
        "distance": profile.distance,
        "lifestyle": {
            "drinking": profile.drinking,
            "smoking": profile.smoking,
            "workout": profile.workout,
            "pets": profile.pets,
        },
        "communication": {
            "style": profile.communication_style,
            "response_pace": profile.response_pace,
        },
        "interests": profile.interests,
        "location": profile.location,
        "bio": profile.bio,
        "verified": profile.verified,
        "premium": profile.premium,
        "last_active": profile.last_active,
        "sexual_orientation": profile.sexual_orientation if hasattr(profile, "sexual_orientation") else [],
        "relationship_goals": profile.relationship_goals if hasattr(profile, "relationship_goals") else [],
        "preferred_connect": profile.communication_style or [],
        "response_pace": profile.response_pace,
        "drinking": profile.drinking,
        "smoking": profile.smoking,
        "workout": profile.workout,
        "pets": profile.pets,
        "max_distance_km": profile.distance,
    }


def profile_similarity(u, v, distance_km, max_dist_km):
    s_orientation = list_overlap(u.get("sexual_orientation"), v.get("sexual_orientation"))
    s_goals = list_overlap(u.get("relationship_goals"), v.get("relationship_goals"))

    s_comm_pref = list_overlap(u.get("preferred_connect"), v.get("preferred_connect"))
    s_comm_pace = categorical_exact(u.get("response_pace"), v.get("response_pace"))
    s_comm = 0.7 * s_comm_pref + 0.3 * s_comm_pace

    s_lifestyle = (
        0.25 * categorical_exact(u.get("drinking"), v.get("drinking")) +
        0.25 * categorical_exact(u.get("smoking"), v.get("smoking")) +
        0.25 * categorical_exact(u.get("workout"), v.get("workout")) +
        0.25 * categorical_exact(u.get("pets"), v.get("pets"))
    )

    s_interests = list_overlap(u.get("interests"), v.get("interests"))

    if distance_km is None or max_dist_km is None:
        s_dist = 0.0
        dist_weight = 0.0
    else:
        s_dist = distance_similarity_km(distance_km, max_dist_km)
        dist_weight = WEIGHTS["distance_soft"]

    base = (
        WEIGHTS["sexual_orientation"] * s_orientation +
        WEIGHTS["relationship_goals"] * s_goals +
        WEIGHTS["communication"] * s_comm +
        WEIGHTS["lifestyle"] * s_lifestyle +
        WEIGHTS["interests"] * s_interests
    )
    return base + dist_weight * s_dist


# ---------- Matching / Chat Views ----------

class MatchRecommendationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        email = (request.user.email or request.user.username).lower()

        try:
            me_profile = UserProfile.objects.select_related("user").get(
                Q(user__email=email) | Q(user__username=email)
            )
        except UserProfile.DoesNotExist:
            return Response({"detail": "Profile not found"}, status=404)

        # Build exclusion sets
        matched_qs = Match.objects.filter(
            Q(user_a=email) | Q(user_b=email), status="active"
        ).values_list("user_a", "user_b")

        matched_emails = set()
        for a, b in matched_qs:
            matched_emails.add(a.lower())
            matched_emails.add(b.lower())
        matched_emails.discard(email)

        liked_emails = set(
            Like.objects.filter(from_email=email).values_list("to_email", flat=True)
        )
        blocked_emails = set(
            BlockedUser.objects.filter(blocker=email).values_list("blocked", flat=True)
        )

        others_qs = (
            UserProfile.objects
            .select_related("user")
            .filter(account_status="active")
            .exclude(user=me_profile.user)
            .exclude(Q(user__email__in=matched_emails) | Q(user__username__in=matched_emails))
            .exclude(Q(user__email__in=liked_emails) | Q(user__username__in=liked_emails))
            .exclude(Q(user__email__in=blocked_emails) | Q(user__username__in=blocked_emails))
        )

        # Normalize a gender/orientation string to a canonical set
        def normalize(values):
            if not values:
                return set()
            result = set()
            for v in values:
                v = v.lower().strip()
                if v in ("male", "man", "men"):
                    result.update({"man", "male", "men"})
                elif v in ("female", "woman", "women"):
                    result.update({"woman", "female", "women"})
                else:
                    result.add(v)
            return result

        my_interested_in = normalize(me_profile.interested_in)

        me_data = serialize_profile(me_profile)
        results = []

        for other_profile in others_qs:
            # Gender compatibility check
            if my_interested_in:
                other_gender_normalized = normalize([other_profile.gender])
                if not my_interested_in.intersection(other_gender_normalized):
                    continue

            # Mutual interest check (does the other person also want my gender?)
            other_interested_in = normalize(other_profile.interested_in)
            if other_interested_in:
                my_gender_normalized = normalize([me_profile.gender])
                if not other_interested_in.intersection(my_gender_normalized):
                    continue

            other_data = serialize_profile(other_profile)
            similarity = profile_similarity(me_data, other_data, None, None)
            results.append({
                "similarity": round(similarity * 100, 1),
                "profile": other_data,
            })

        results.sort(key=lambda x: x["similarity"], reverse=True)
        return Response(results)    

class LikeProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from .models import NotificationPreference
        from django.utils import timezone as tz

        from_email = (request.user.email or request.user.username).lower()
        to_email   = request.data.get("to_email", "").lower()

        if not to_email:
            return Response(
                {"error": "to_email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ── Enforce monthly connection limit ──────────────────────────────
        try:
            sender_profile = UserProfile.objects.get(user=request.user)

            is_premium = (
                sender_profile.premium
                and hasattr(sender_profile, 'premium_expires_at')
                and sender_profile.premium_expires_at
                and sender_profile.premium_expires_at > tz.now()
            )

            if is_premium:
                try:
                    plan = PremiumPlan.objects.get(name=sender_profile.premium_plan)

                    if plan.monthly_connection_limit is not None:
                        month_start = tz.now().replace(
                            day=1, hour=0, minute=0, second=0, microsecond=0
                        )
                        monthly_likes = Like.objects.filter(
                            from_email=from_email,
                            created_at__gte=month_start
                        ).count()

                        if monthly_likes >= plan.monthly_connection_limit:
                            return Response(
                                {
                                    'error': f'Monthly connection limit of {plan.monthly_connection_limit} reached for your {plan.name} plan.',
                                    'likes_this_month': monthly_likes,
                                    'limit': plan.monthly_connection_limit,
                                },
                                status=status.HTTP_403_FORBIDDEN,
                            )
                    # monthly_connection_limit is None = unlimited, fall through

                except PremiumPlan.DoesNotExist:
                    pass  # Plan not found — allow the like

            # Free users have no connection limit (only swipe limit applies)

        except UserProfile.DoesNotExist:
            pass  # No profile found — allow the like, don't block

        # ── Existing like logic (unchanged from your original) ────────────
        result: dict = FirebaseLikeManager.send_like(
            from_email=from_email, to_email=to_email
        )

        if result.get("status") == "matched":
            match_data: dict = result["match"]
            match_id  = match_data["match_id"]
            chat_id   = match_data["chat_id"]

            with transaction.atomic():
                match_obj = Match.objects.get(pk=match_id)

                to_create = []
                for email in (from_email, to_email):
                    prefs = NotificationPreference.for_user(email)
                    if prefs.notif_matches:
                        to_create.append(
                            Notification(
                                user=email,
                                type="MATCH_CREATED",
                                match=match_obj,
                                chat_id=chat_id,
                            )
                        )
                if to_create:
                    Notification.objects.bulk_create(to_create)

            notify_user(from_email, {
                "type": "MATCH_CREATED",
                "match_id": match_id,
                "chat_id": chat_id,
                "from_email": to_email,
            })
            notify_user(to_email, {
                "type": "MATCH_CREATED",
                "match_id": match_id,
                "chat_id": chat_id,
                "from_email": from_email,
            })

            return Response(
                {"status": "matched", "match_id": match_id, "chat_id": chat_id},
                status=status.HTTP_200_OK,
            )

        # ── Like only (no match yet) ───────────────────────────────────────
        recipient_prefs = NotificationPreference.for_user(to_email)
        if recipient_prefs.notif_likes:
            Notification.objects.create(
                user=to_email,
                type="LIKE_RECEIVED",
                from_email=from_email,
                match=None,
                chat_id=None,
            )
            notify_user(to_email, {
                "type": "LIKE_RECEIVED",
                "from_email": from_email,
            })

        return Response(result, status=status.HTTP_200_OK)
            
class MatchedChatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        my_email = request.user.username.lower()

        matches = Match.objects.filter(
            Q(user_a=my_email) | Q(user_b=my_email)
        ).select_related("chat")

        chats = []
        for match in matches:
            other_email = match.user_b if match.user_a == my_email else match.user_a

            is_blocked_by_me = BlockedUser.objects.filter(blocker=my_email, blocked=other_email).exists()
            is_blocked_me = BlockedUser.objects.filter(blocker=other_email, blocked=my_email).exists()

            profile = FirebaseProfileManager.get_profile(other_email) or {}
            chat_id = match.chat.pk if match.chat else None

            last_message = None
            unread_count = 0
            if chat_id:
                last_msg_obj = Message.objects.filter(chat_id=chat_id).order_by("-created_at").first()
                if last_msg_obj:
                    last_message = last_msg_obj.content

                unread_count = Message.objects.filter(
                    chat_id=chat_id,
                    is_read=False,
                ).exclude(sender=my_email).count()

            chats.append({
                "chat_id": chat_id,
                "match_id": match.pk,
                "status": match.status,
                "created_at": match.created_at.isoformat(),
                "user_email": my_email,
                "email": other_email,
                "first_name": profile.get("firstName") or profile.get("first_name"),
                "blocked_by_me": is_blocked_by_me,
                "blocked_me": is_blocked_me,
                "last_message": last_message,
                "unread_count": unread_count,
            })

        return Response(chats, status=status.HTTP_200_OK)

class ChatMessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, chat_id):
        user_email = request.user.username.lower()

        chat = MySQLChatManager.get_chat(chat_id)
        if not chat:
            return Response({"detail": "Chat not found"}, status=status.HTTP_404_NOT_FOUND)
        if user_email not in chat["participants"]:
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        messages = MySQLChatManager.get_messages(chat_id)
        return Response(messages, status=status.HTTP_200_OK)


# ---- ONLY THE FIXED METHOD - replace SendChatMessageView in your views.py ----

class SendChatMessageView(APIView):
    """
    REST fallback for sending messages (used when WebSocket is unavailable).
    Broadcasts via channel layer so the ChatConsumer forwards it to clients.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, chat_id):
        from .models import NotificationPreference   # local import

        sender  = (request.user.email or request.user.username).lower()
        content = request.data.get("content", "").strip()

        if not content:
            return Response(
                {"detail": "Message content cannot be empty"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        chat = MySQLChatManager.get_chat(chat_id)
        if not chat or sender not in [p.lower() for p in chat["participants"]]:
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        receiver = next(e for e in chat["participants"] if e.lower() != sender)

        if BlockedUser.objects.filter(
            Q(blocker=receiver, blocked=sender) | Q(blocker=sender, blocked=receiver)
        ).exists():
            return Response(
                {"detail": "You cannot send messages to this user", "blocked": True},
                status=status.HTTP_403_FORBIDDEN,
            )

        MySQLChatManager.add_message(
            chat_id=chat_id,
            sender=sender,
            receiver=receiver,
            content=content,
        )

        # ── Create in-app notification only if receiver allows messages ─────
        receiver_prefs = NotificationPreference.for_user(receiver)
        if receiver_prefs.notif_messages:
            # Find the match for this chat to attach to the notification
            match_obj = Match.objects.filter(chat_id=chat_id).first()
            Notification.objects.create(
                user=receiver,
                type="NEW_MESSAGE",
                match=match_obj,
                chat_id=int(chat_id),
                from_email=sender,
            )

        # Always broadcast via WebSocket (client handles UI silencing)
        channel_layer = get_channel_layer()
        if channel_layer is not None:
            async_to_sync(channel_layer.group_send)(
                f"chat_{chat_id}",
                {
                    "type": "chat_message",
                    "payload": {
                        "type": "message",
                        "sender": sender,
                        "receiver": receiver,
                        "content": content,
                    },
                },
            )

        return Response({"status": "sent"}, status=status.HTTP_201_CREATED)
    

class BlockUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        blocker = request.user.username.lower()
        blocked = request.data.get("email")
        if not blocked:
            return Response({"detail": "Blocked email required"}, status=status.HTTP_400_BAD_REQUEST)

        BlockedUser.objects.get_or_create(blocker=blocker, blocked=blocked.lower())
        return Response({"status": "blocked"}, status=status.HTTP_200_OK)


class UnblockUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        blocker = request.user.username.lower()
        blocked = request.data.get("email")
        BlockedUser.objects.filter(blocker=blocker, blocked=blocked.lower()).delete()
        return Response({"status": "unblocked"}, status=status.HTTP_200_OK)


class MarkChatReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chat_id):
        user_email = request.user.username.lower()

        chat = MySQLChatManager.get_chat(chat_id)
        if not chat or user_email not in chat["participants"]:
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        MySQLChatManager.mark_read(chat_id=chat_id, receiver_email=user_email)
        return Response({"status": "ok"}, status=status.HTTP_200_OK)


class CreateUserReportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateUserReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        chat_id = serializer.validated_data["chat_id"]
        reason = serializer.validated_data["reason"]
        description = serializer.validated_data.get("description", "")

        match = Match.objects.filter(chat_id=chat_id).first()
        if not match:
            return Response(
                {"error": "Invalid chat"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user_email = request.user.email or request.user.username
        if user_email == match.user_a:
            reported_email = match.user_b
        elif user_email == match.user_b:
            reported_email = match.user_a
        else:
            return Response(
                {"error": "You are not part of this chat"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            reported_user = User.objects.get(
                Q(email=reported_email) | Q(username=reported_email)
            )
        except User.DoesNotExist:
            return Response(
                {"error": "Reported user not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if reported_user == request.user:
            return Response(
                {"error": "You cannot report yourself"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Silently succeed if a pending report already exists
        # so the user always sees the success screen
        existing = UserReport.objects.filter(
            reporter=request.user,
            reported_user=reported_user,
            status="pending"
        ).exists()

        if not existing:
            UserReport.objects.create(
                reporter=request.user,
                reported_user=reported_user,
                reason=reason,
                description=description or f"Reported for: {reason}",
            )

        return Response(
            {"message": "Report submitted successfully"},
            status=status.HTTP_201_CREATED
        )
    
    
class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get("plan_id")
        promo_code = request.data.get("promo_code")

        if not plan_id:
            return Response({"error": "plan_id required"}, status=400)

        plan = PremiumPlan.objects.filter(plan_id=plan_id, active=True).first()
        if not plan:
            return Response({"error": "Invalid plan"}, status=400)

        amount = Decimal(plan.price)

        if promo_code:
            promo = PromoCode.objects.filter(code=promo_code, active=True).first()
            if promo:
                amount = promo.apply_discount(amount)

        order: dict = client.order.create({  # type: ignore[attr-defined]
            "amount": int(amount * 100),
            "currency": "INR",
            "payment_capture": 1,
        })

        return Response({
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": "INR",
            "razorpay_key": settings.RAZORPAY_KEY_ID,
            "plan_name": plan.name,
        })

class VerifyPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        order_id = data.get("razorpay_order_id")
        payment_id = data.get("razorpay_payment_id")
        signature = data.get("razorpay_signature")

        body = f"{order_id}|{payment_id}"
        expected_signature = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            body.encode(),
            hashlib.sha256,
        ).hexdigest()

        if expected_signature != signature:
            return Response({"error": "Invalid signature"}, status=400)

        try:
            profile = UserProfile.objects.get(user=request.user)
            profile.premium = True
            profile.save(update_fields=["premium"])
        except UserProfile.DoesNotExist:
            pass

        Payment.objects.create(
            user=request.user,
            plan=PremiumPlan.objects.get(plan_id=request.data.get("plan_id", "")),
            razorpay_order_id=order_id,
            razorpay_payment_id=payment_id,
            amount=0,
            status="SUCCESS",
        )

        return Response({"status": "success"})


# ---------- Notification Views ----------

class NotificationListView(APIView):
    """
    GET /api/notifications/
    Returns all unread Notification rows for the authenticated user,
    enriched with match-partner info via NotificationSerializer.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        email = (request.user.email or request.user.username).lower()

        notifications = (
            Notification.objects
            .filter(user=email, is_read=False)
            .select_related("match")
            .order_by("-created_at")
        )

        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserNotificationsView(APIView):
    """
    GET /api/notifications/all/
    Returns ALL notifications (read + unread) for the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        email = (request.user.email or request.user.username).lower()

        notifications = (
            Notification.objects
            .filter(user=email)
            .select_related("match")
            .order_by("-created_at")
        )

        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class NotificationPreferencesView(APIView):
    """
    GET  /api/notifications/preferences/
         Returns the current user's notification preference flags.

    PATCH /api/notifications/preferences/
          Body (any subset): { "matches": bool, "likes": bool,
                               "messages": bool, "email": bool }
          Saves the new values and returns the full updated object.
    """
    permission_classes = [IsAuthenticated]

    def _get_email(self, request) -> str:
        return (request.user.email or request.user.username).lower()

    def get(self, request):
        from .models import NotificationPreference
        email = self._get_email(request)
        prefs = NotificationPreference.for_user(email)
        return Response(self._serialize(prefs), status=status.HTTP_200_OK)

    def patch(self, request):
        from .models import NotificationPreference
        email = self._get_email(request)
        prefs = NotificationPreference.for_user(email)

        # Map frontend keys → model fields
        field_map = {
            "matches":  "notif_matches",
            "likes":    "notif_likes",
            "messages": "notif_messages",
            "email":    "notif_email",
        }
        updated_fields = []
        for frontend_key, model_field in field_map.items():
            if frontend_key in request.data:
                value = request.data[frontend_key]
                if not isinstance(value, bool):
                    return Response(
                        {"detail": f"'{frontend_key}' must be a boolean"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                setattr(prefs, model_field, value)
                updated_fields.append(model_field)

        if updated_fields:
            updated_fields.append("updated_at")
            prefs.save(update_fields=updated_fields)

        return Response(self._serialize(prefs), status=status.HTTP_200_OK)

    @staticmethod
    def _serialize(prefs) -> dict:
        return {
            "matches":  prefs.notif_matches,
            "likes":    prefs.notif_likes,
            "messages": prefs.notif_messages,
            "email":    prefs.notif_email,
        }

class MarkNotificationReadView(APIView):
    """
    POST /api/notifications/read/
    Body: { "notification_id": <int> }
    Marks a single notification as read (only if it belongs to the requester).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        notification_id = request.data.get("notification_id")
        if not notification_id:
            return Response({"detail": "notification_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        email = (request.user.email or request.user.username).lower()

        updated = Notification.objects.filter(
            pk=notification_id,
            user=email,
        ).update(is_read=True)

        if not updated:
            return Response(
                {"detail": "Notification not found or does not belong to you"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response({"status": "ok"}, status=status.HTTP_200_OK)


class MarkAllNotificationsReadView(APIView):
    """
    POST /api/notifications/read-all/
    Marks every unread notification for the authenticated user as read.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        email = (request.user.email or request.user.username).lower()

        Notification.objects.filter(user=email, is_read=False).update(is_read=True)

        return Response({"status": "all_read"}, status=status.HTTP_200_OK)


class UnreadNotificationCountView(APIView):
    """
    GET /api/notifications/unread-count/
    Returns the number of unread notifications for the badge counter.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        email = (request.user.email or request.user.username).lower()

        count = Notification.objects.filter(user=email, is_read=False).count()

        return Response({"unread_count": count}, status=status.HTTP_200_OK)
class NearbyUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        lat = request.data.get('latitude')
        lng = request.data.get('longitude')
        radius_km = float(request.data.get('radius_km', 50))

        if lat is None or lng is None:
            return Response({'error': 'latitude and longitude required'}, status=400)

        lat, lng = float(lat), float(lng)

        # Save this user's coordinates
        try:
            my_profile = UserProfile.objects.get(user=request.user)
            my_profile.latitude = lat
            my_profile.longitude = lng
            my_profile.save(update_fields=['latitude', 'longitude'])
        except UserProfile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=404)

        # Find all other users who have coordinates stored
        others = UserProfile.objects.exclude(user=request.user).filter(
            latitude__isnull=False,
            longitude__isnull=False,
            account_status='active',
        ).exclude(
            user__username=request.user.username
        )

        nearby = []
        for profile in others:
            dist = haversine_km(lat, lng, profile.latitude, profile.longitude)
            if dist <= radius_km:
                nearby.append({
                    'distance_km': round(dist, 1),
                    'first_name': profile.first_name,
                    # Use pravatar based on user id as a consistent placeholder
                    # Replace with real photo URL when you add photo uploads
                    'avatar': f'https://i.pravatar.cc/100?u={profile.user.pk}',
                })

        nearby.sort(key=lambda x: x['distance_km'])

        return Response({
            'count': len(nearby),
            'users': nearby[:8],  # Return max 8 for avatars
        })

class UnreadChatCountView(APIView):
    """
    GET /api/chats/unread-count/
    Returns the number of chats that have at least one unread message
    sent by the other person. Single query — no N+1.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        my_email = (request.user.email or request.user.username).lower()

        # Get all active chat IDs this user is part of (excluding blocked)
        blocked_by_me = set(
            BlockedUser.objects.filter(blocker=my_email).values_list("blocked", flat=True)
        )
        blocked_me = set(
            BlockedUser.objects.filter(blocked=my_email).values_list("blocker", flat=True)
        )
        blocked_emails = blocked_by_me | blocked_me

        my_matches = Match.objects.filter(
            Q(user_a=my_email) | Q(user_b=my_email)
        ).exclude(
            Q(user_a__in=blocked_emails) | Q(user_b__in=blocked_emails)
        ).values_list("chat_id", flat=True)

        chat_ids = [cid for cid in my_matches if cid is not None]

        if not chat_ids:
            return Response({"unread_count": 0}, status=status.HTTP_200_OK)
        
        unread_chat_count = (
            Message.objects.filter(
                chat_id__in=chat_ids,
                is_read=False,
            )
            .exclude(sender=my_email)          # only messages from the other person
            .values("chat_id")                 # group by chat
            .distinct()
            .count()
        )

        return Response({"unread_count": unread_chat_count}, status=status.HTTP_200_OK)

"""
ADD THESE VIEWS to login/views.py
(paste at the bottom, before the end of the file)
"""

# ─────────────────────────────────────────────────────────────────────────────
# Privacy Preferences (show online status)
# ─────────────────────────────────────────────────────────────────────────────

class PrivacyPreferencesView(APIView):
    """
    GET  /api/privacy/preferences/
         Returns the current user's privacy preference flags.

    PATCH /api/privacy/preferences/
          Body (any subset): { "show_online": bool }
          Saves and returns the full updated object.
    """
    permission_classes = [IsAuthenticated]

    def _get_email(self, request) -> str:
        return (request.user.email or request.user.username).lower()

    def get(self, request):
        from .models import PrivacyPreference
        email = self._get_email(request)
        prefs = PrivacyPreference.for_user(email)
        return Response(self._serialize(prefs), status=status.HTTP_200_OK)

    def patch(self, request):
        from .models import PrivacyPreference
        email = self._get_email(request)
        prefs = PrivacyPreference.for_user(email)

        field_map = {
            "show_online": "show_online",
        }
        updated_fields = []
        for frontend_key, model_field in field_map.items():
            if frontend_key in request.data:
                value = request.data[frontend_key]
                if not isinstance(value, bool):
                    return Response(
                        {"detail": f"'{frontend_key}' must be a boolean"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                setattr(prefs, model_field, value)
                updated_fields.append(model_field)

        if updated_fields:
            updated_fields.append("updated_at")
            prefs.save(update_fields=updated_fields)

        return Response(self._serialize(prefs), status=status.HTTP_200_OK)

    @staticmethod
    def _serialize(prefs) -> dict:
        return {
            "show_online": prefs.show_online,
        }


# ─────────────────────────────────────────────────────────────────────────────
# Blocked Users (list + unblock)
# ─────────────────────────────────────────────────────────────────────────────

class BlockedUsersListView(APIView):
    """
    GET /api/users/blocked/
    Returns a list of users blocked by the authenticated user,
    enriched with first_name from their profile.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        blocker = (request.user.email or request.user.username).lower()

        blocked_qs = BlockedUser.objects.filter(blocker=blocker).order_by("-created_at")

        result = []
        for row in blocked_qs:
            profile = FirebaseProfileManager.get_profile(row.blocked) or {}
            result.append({
                "email": row.blocked,
                "first_name": profile.get("firstName") or profile.get("first_name") or row.blocked,
                "blocked_at": row.created_at.isoformat(),
            })

        return Response(result, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────────────────────
# Data Export / Account Deletion
# ─────────────────────────────────────────────────────────────────────────────

class RequestDataExportView(APIView):
    """
    POST /api/privacy/export/
    Generates a JSON payload of everything we store for the user
    and returns it directly (small dataset — no async job needed).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        email = (user.email or user.username).lower()

        # Profile data
        profile = FirebaseProfileManager.get_profile(email) or {}

        # Match history
        matches = list(
            Match.objects.filter(
                Q(user_a=email) | Q(user_b=email)
            ).values("user_a", "user_b", "status", "created_at")
        )
        for m in matches:
            if m.get("created_at"):
                m["created_at"] = m["created_at"].isoformat()

        # Message history (last 200)
        from django.db.models import Q as DQ
        messages = list(
            Message.objects.filter(
                DQ(sender=email) | DQ(receiver=email)
            ).order_by("-created_at")[:200]
            .values("sender", "receiver", "content", "created_at", "is_read")
        )
        for m in messages:
            if m.get("created_at"):
                m["created_at"] = m["created_at"].isoformat()

        # Blocked users
        blocked = list(
            BlockedUser.objects.filter(blocker=email).values("blocked", "created_at")
        )
        for b in blocked:
            if b.get("created_at"):
                b["created_at"] = b["created_at"].isoformat()

        export = {
            "account": {
                "email": email,
                "username": user.username,
                "date_joined": user.date_joined.isoformat() if user.date_joined else None,
            },
            "profile": profile,
            "matches": matches,
            "messages": messages,
            "blocked_users": blocked,
        }

        return Response(export, status=status.HTTP_200_OK)


class DeleteAccountView(APIView):
    """
    DELETE /api/privacy/delete-account/
    Permanently deletes the authenticated user's account and all related data.
    The client must send { "confirm": "DELETE" } in the body.
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        confirm = request.data.get("confirm")
        if confirm != "DELETE":
            return Response(
                {"detail": "Send { \"confirm\": \"DELETE\" } to proceed"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user
        email = (user.email or user.username).lower()

        with transaction.atomic():
            # Remove matches and chats
            user_matches = Match.objects.filter(
                Q(user_a=email) | Q(user_b=email)
            )
            chat_ids = list(user_matches.values_list("chat_id", flat=True))
            Message.objects.filter(chat_id__in=chat_ids).delete()
            ChatParticipant.objects.filter(email=email).delete()
            user_matches.delete()

            # Notifications
            Notification.objects.filter(Q(user=email) | Q(from_email=email)).delete()

            # Likes, blocks
            Like.objects.filter(Q(from_email=email) | Q(to_email=email)).delete()
            BlockedUser.objects.filter(Q(blocker=email) | Q(blocked=email)).delete()

            # Auth record
            from .models import UserAuth
            UserAuth.objects.filter(email=email).delete()

            # Profile & Django user
            try:
                from profiles.models import UserProfile
                UserProfile.objects.filter(user=user).delete()
            except Exception:
                pass

            user.delete()

        return Response({"status": "account_deleted"}, status=status.HTTP_200_OK)
    
class ContactSupportView(APIView):
    """
    POST /api/contact/
    Accepts a contact form submission and sends an email to the support team.
    No authentication required so anyone (including logged-out users) can reach support.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        name    = request.data.get("name", "").strip()
        email   = request.data.get("email", "").strip()
        subject = request.data.get("subject", "General Inquiry").strip()
        message = request.data.get("message", "").strip()

        if not name or not email or not message:
            return Response(
                {"detail": "name, email, and message are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Rate-limit: max 3 submissions per email per hour
        rate_key = f"contact_form_{email}"
        count = cache.get(rate_key, 0)
        if count >= 3:
            return Response(
                {"detail": "Too many submissions. Please wait before trying again."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )
        cache.set(rate_key, count + 1, timeout=3600)

        from_email = getattr(settings, "DEFAULT_FROM_EMAIL", settings.EMAIL_HOST_USER)
        support_email = getattr(settings, "SUPPORT_EMAIL", from_email)

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Helvetica, Arial, sans-serif; background: #f9f9f9; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e6e6e6;">
            <h2 style="margin: 0 0 24px; color: #111;">New Contact Form Submission</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #555; font-size: 14px; width: 100px;"><strong>Name</strong></td>
                <td style="padding: 8px 0; color: #111; font-size: 14px;">{name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #555; font-size: 14px;"><strong>Email</strong></td>
                <td style="padding: 8px 0; color: #111; font-size: 14px;"><a href="mailto:{email}" style="color: #0095E0;">{email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #555; font-size: 14px;"><strong>Subject</strong></td>
                <td style="padding: 8px 0; color: #111; font-size: 14px;">{subject}</td>
              </tr>
            </table>
            <hr style="border: none; border-top: 1px solid #e6e6e6; margin: 24px 0;" />
            <h3 style="margin: 0 0 12px; color: #111; font-size: 15px;">Message</h3>
            <p style="color: #444; font-size: 15px; line-height: 1.6; white-space: pre-wrap; margin: 0;">{message}</p>
            <hr style="border: none; border-top: 1px solid #e6e6e6; margin: 24px 0;" />
            <p style="color: #999; font-size: 12px; margin: 0;">Sent via The Dating App contact form</p>
          </div>
        </body>
        </html>
        """

        plain_body = (
            f"Name: {name}\nEmail: {email}\nSubject: {subject}\n\nMessage:\n{message}"
        )

        try:
            send_mail(
                subject=f"[Support] {subject} — from {name}",
                message=plain_body,
                from_email=from_email,
                recipient_list=[support_email],
                html_message=html_body,
            )
        except Exception as exc:
            # Log but don't expose the error to the client
            import logging
            logging.getLogger(__name__).error("Contact form email failed: %s", exc)
            return Response(
                {"detail": "Failed to send message. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {"message": "Your message has been received. We'll get back to you within 24 hours."},
            status=status.HTTP_200_OK,
        )