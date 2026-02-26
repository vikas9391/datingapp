from typing import Dict, Any, Optional
from django.contrib.auth.models import User
from .models import UserProfile

FIELD_ALIASES = {
    "firstName": "first_name",
    "relationshipType": "relationship_type",
}

PROFILE_DIRECT_FIELDS = {
    "first_name", "firstName", "bio", "age", "gender", "location",
    "drinking", "smoking", "workout", "pets",
    "relationship_goals", "sexual_orientation", "interests",
    "communication_style", "response_pace", "distance",
    "onboarding_step", "completion_percentage",
    "verified", "premium", "account_status",
    "relationship_type",
}


class MySQLProfileManager:
    """
    Profile manager for the profiles app.
    Looks up UserProfile by user__email or user__username.
    """

    TOTAL_ONBOARDING_STEPS = 10

    @staticmethod
    def _find(email: str) -> Optional[UserProfile]:
        from django.db.models import Q
        return (
            UserProfile.objects
            .select_related("user")
            .filter(Q(user__email=email) | Q(user__username=email))
            .first()
        )

    @staticmethod
    def get_profile(email: str) -> Optional[Dict[str, Any]]:
        obj = MySQLProfileManager._find(email)
        if obj is None:
            return None
        return obj.to_dict()

    @staticmethod
    def create_profile(email: str, **profile_data) -> str:
        from django.db.models import Q

        # Resolve onboarding step
        step = profile_data.get("onboarding_step")
        if step is not None:
            try:
                step = int(step)
                step = max(0, min(MySQLProfileManager.TOTAL_ONBOARDING_STEPS, step))
                profile_data["onboarding_step"] = step
                profile_data["completion_percentage"] = round(
                    (step / MySQLProfileManager.TOTAL_ONBOARDING_STEPS) * 100, 1
                )
            except (TypeError, ValueError):
                profile_data.pop("onboarding_step", None)
                profile_data.pop("completion_percentage", None)

        # Find the Django User
        try:
            user = User.objects.get(Q(email=email) | Q(username=email))
        except User.DoesNotExist:
            raise ValueError(f"No Django user found for email: {email}")

        obj, _ = UserProfile.objects.get_or_create(user=user)

        extra_data = obj.extra_data or {}
        for key, value in profile_data.items():
            real_key = FIELD_ALIASES.get(key, key)
            if hasattr(obj, real_key) and real_key not in ("user", "created_at", "updated_at", "join_date"):
                setattr(obj, real_key, value)
            else:
                extra_data[key] = value

        obj.extra_data = extra_data
        obj.save()
        return str(obj.pk)

    @staticmethod
    def get_completion_status(email: str) -> Dict[str, Any]:
        profile = MySQLProfileManager.get_profile(email)
        if not profile:
            return {
                "step": 0,
                "completion_percentage": 0.0,
                "is_complete": False,
                "total_steps": MySQLProfileManager.TOTAL_ONBOARDING_STEPS,
            }
        step = profile.get("onboarding_step", 0)
        pct = profile.get("completion_percentage", 0.0)
        return {
            "step": step,
            "completion_percentage": pct,
            "is_complete": step >= MySQLProfileManager.TOTAL_ONBOARDING_STEPS,
            "total_steps": MySQLProfileManager.TOTAL_ONBOARDING_STEPS,
        }


# Backward-compat alias
FirebaseProfileManager = MySQLProfileManager