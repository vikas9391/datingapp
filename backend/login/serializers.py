from rest_framework import serializers
from .models import Match, Message, Notification
from admin_panel.models import UserReport
from django.contrib.auth.models import User
from django.db.models import Q


class MatchSerializer(serializers.ModelSerializer):
    partner = serializers.SerializerMethodField()

    class Meta:
        model = Match
        fields = ["id", "partner", "created_at"]

    def get_partner(self, obj):
        request = self.context.get("request")
        if not request:
            return None

        my_email = request.user.email or request.user.username
        partner_email = obj.user_b if obj.user_a == my_email else obj.user_a

        try:
            partner_user = User.objects.get(
                Q(email=partner_email) | Q(username=partner_email)
            )
        except User.DoesNotExist:
            return {"email": partner_email}

        first_name = None
        bio = None

        if hasattr(partner_user, "profile"):
            profile = partner_user.profile
            first_name = profile.first_name
            bio = profile.bio
        else:
            from profiles.managers import MySQLProfileManager
            profile_data = MySQLProfileManager.get_profile(partner_email) or {}
            first_name = profile_data.get("firstName") or profile_data.get("first_name")
            bio = profile_data.get("bio")

        return {
            "id": partner_user.pk,
            "email": partner_email,
            "name": first_name,
            "bio": bio,
        }


class MessageSerializer(serializers.ModelSerializer):
    is_me = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ["id", "content", "created_at", "is_me", "is_read"]

    def get_is_me(self, obj):
        request = self.context.get("request")
        if not request or not request.user:
            return False
        my_email = request.user.email or request.user.username
        return obj.sender == my_email


class CreateUserReportSerializer(serializers.Serializer):
    chat_id = serializers.IntegerField()
    reason = serializers.CharField()
    description = serializers.CharField(required=False, allow_blank=True, default="")


class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializes a Notification row for the frontend.

    Extra computed fields:
    - `match_id`       : convenience alias for match.pk
    - `other_user`     : email of the person who triggered the notification
    - `other_user_name`: display name of that person
    """

    match_id = serializers.SerializerMethodField()
    other_user = serializers.SerializerMethodField()
    other_user_name = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            "id",
            "type",
            "match_id",
            "chat_id",
            "other_user",
            "other_user_name",
            "is_read",
            "created_at",
        ]

    def get_match_id(self, obj) -> int | None:
        return obj.match_id  # FK id, no extra query

    def get_other_user(self, obj) -> str | None:
        """
        For LIKE_RECEIVED: use the stored from_email directly.
        For MATCH_CREATED / others: derive from the linked Match.
        """
        if obj.type == "LIKE_RECEIVED":
            return obj.from_email  # set when the like notification is created

        if not obj.match:
            return None

        recipient = obj.user
        match = obj.match
        return match.user_b if match.user_a == recipient else match.user_a

    def get_other_user_name(self, obj) -> str | None:
        """
        Resolve a display name for the other user.
        Falls back to the email prefix if profile data is unavailable.
        """
        other_email = self.get_other_user(obj)
        if not other_email:
            return None

        try:
            from profiles.managers import MySQLProfileManager
            profile = MySQLProfileManager.get_profile(other_email) or {}
            name = profile.get("first_name") or profile.get("firstName")
            if name:
                return name
        except Exception:
            pass

        return other_email.split("@")[0]