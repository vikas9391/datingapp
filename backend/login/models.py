from django.conf import settings
from admin_panel.models import PremiumPlan
from django.db import models
from typing import Dict, Any, Optional


class Like(models.Model):
    from_email = models.EmailField()
    to_email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("from_email", "to_email")


class Chat(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    last_message = models.TextField(null=True, blank=True)
    last_message_at = models.DateTimeField(null=True, blank=True)


class ChatParticipant(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    email = models.EmailField()

    class Meta:
        unique_together = ("chat", "email")


class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    sender = models.EmailField()
    receiver = models.EmailField()
    content = models.TextField()
    type = models.CharField(max_length=20, default="text")
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)


class Match(models.Model):
    user_a = models.EmailField()
    user_b = models.EmailField()
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, default="active")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user_a", "user_b")


class BlockedUser(models.Model):
    blocker = models.EmailField(db_index=True)
    blocked = models.EmailField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("blocker", "blocked")


class Payment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    plan = models.ForeignKey(PremiumPlan, on_delete=models.PROTECT)
    razorpay_order_id = models.CharField(max_length=100)
    razorpay_payment_id = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    status = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)


class Notification(models.Model):
    """
    Stores per-user notifications.
    - `user`       : email of the recipient
    - `type`       : e.g. "MATCH_CREATED", "NEW_MESSAGE", "LIKE_RECEIVED"
    - `match`      : FK to Match (nullable – not all notifications relate to a match)
    - `chat_id`    : raw int FK to Chat (kept loose to avoid circular import issues)
    - `from_email` : email of the person who triggered the notification (used for LIKE_RECEIVED)
    - `is_read`    : marks whether the user has seen this notification
    """

    NOTIFICATION_TYPES = [
        ("MATCH_CREATED", "Match Created"),
        ("NEW_MESSAGE", "New Message"),
        ("LIKE_RECEIVED", "Like Received"),
    ]

    user = models.EmailField(db_index=True)          # receiver's email
    type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    match = models.ForeignKey(
        Match,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    chat_id = models.IntegerField(null=True, blank=True)
    from_email = models.EmailField(null=True, blank=True)  # who triggered this notification
    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Notification({self.type} → {self.user}, read={self.is_read})"


# ---------------------------------------------------------------------------
# MySQL-backed auth manager
# ---------------------------------------------------------------------------


class UserAuth(models.Model):
    """Stores auth state per email."""

    email = models.EmailField(unique=True, db_index=True)
    auth_provider = models.CharField(max_length=50, default="email")
    django_user_id = models.CharField(max_length=50, blank=True, null=True)
    google_id = models.CharField(max_length=200, blank=True, null=True)
    name = models.CharField(max_length=200, blank=True, null=True)
    is_verified = models.BooleanField(default=False)

    # Consent fields
    agreed_to_terms = models.BooleanField(default=False)
    age_confirmed   = models.BooleanField(default=False)
    consent_at      = models.DateTimeField(null=True, blank=True)  # timestamp of agreement

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "email": self.email,
            "auth_provider": self.auth_provider,
            "django_user_id": self.django_user_id,
            "google_id": self.google_id,
            "name": self.name,
            "is_verified": self.is_verified,
            "agreed_to_terms": self.agreed_to_terms,
            "age_confirmed": self.age_confirmed,
            "consent_at": self.consent_at.isoformat() if self.consent_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class MySQLAuthManager:
    """Drop-in replacement for FirebaseAuthManager."""

    @staticmethod
    def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
        try:
            obj = UserAuth.objects.get(email=email)
            return obj.to_dict()
        except UserAuth.DoesNotExist:
            return None

    @staticmethod
    def create_or_update_user(email: str, auth_provider: str, **extra) -> str:
        defaults = {"auth_provider": auth_provider}
        if "is_verified" not in extra:
            extra["is_verified"] = False

        allowed = {"django_user_id", "google_id", "name", "is_verified",
                   "agreed_to_terms", "age_confirmed", "consent_at"}
        for key in allowed:
            if key in extra:
                defaults[key] = extra[key]
        defaults["auth_provider"] = auth_provider

        obj, _ = UserAuth.objects.update_or_create(email=email, defaults=defaults)
        return str(obj.pk)

class NotificationPreference(models.Model):
    """
    Stores per-user notification opt-in/opt-out preferences.
    One row per user (email). Created on first save; defaults to all ON.
    """
    email = models.EmailField(unique=True, db_index=True)

    # Push / in-app toggles
    notif_matches  = models.BooleanField(default=True)   # new matches
    notif_likes    = models.BooleanField(default=True)   # profile likes
    notif_messages = models.BooleanField(default=True)   # new messages
    notif_email    = models.BooleanField(default=False)  # email digests

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "notification_preferences"

    def __str__(self):
        return f"NotifPrefs({self.email})"

    @classmethod
    def for_user(cls, email: str) -> "NotificationPreference":
        """Get-or-create preferences for a user (never raises)."""
        obj, _ = cls.objects.get_or_create(email=email.lower())
        return obj

class PrivacyPreference(models.Model):
    """
    Stores per-user privacy settings.
    One row per user (email). Created on first access; defaults to show_online=True.
    """
    email = models.EmailField(unique=True, db_index=True)

    show_online = models.BooleanField(default=True)   # show online status to others

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "privacy_preferences"

    def __str__(self):
        return f"PrivacyPrefs({self.email})"

    @classmethod
    def for_user(cls, email: str) -> "PrivacyPreference":
        """Get-or-create preferences for a user (never raises)."""
        obj, _ = cls.objects.get_or_create(email=email.lower())
        return obj
    
# Alias for backward compatibility
FirebaseAuthManager = MySQLAuthManager