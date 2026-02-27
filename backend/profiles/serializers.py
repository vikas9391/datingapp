from rest_framework import serializers
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    join_date = serializers.SerializerMethodField()

    # Live match count computed from the Match table, not the stored integer
    matches_count = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            'username',
            'email',
            'first_name',
            'date_of_birth',
            'gender',
            'show_gender',
            'interested_in',
            'relationship_type',
            'distance',
            'strict_distance',
            'drinking',
            'smoking',
            'workout',
            'pets',
            'communication_style',
            'response_pace',
            'interests',
            'location',
            'use_current_location',
            'latitude',
            'longitude',
            'bio',
            'social_accounts',
            # Onboarding fields
            'sexual_orientation',
            'relationship_goals',
            'onboarding_step',
            'completion_percentage',
            # Admin panel fields
            'is_complete',
            'created_at',
            'updated_at',
            'phone',
            'age',
            'status',
            'account_status',
            'join_date',
            'last_active',
            'active_time',
            'matches',        # stored integer (legacy / admin use)
            'matches_count',  # live count from Match table (used by frontend)
            'messages',
            'reports',
            'profile_complete',
            'verified',
            'premium',
            'premium_plan',           # ← ADDED
            'premium_activated_at',   # ← ADDED
            'premium_expires_at',     # ← ADDED
            'swipes_used',
        ]
        read_only_fields = [
            'created_at',
            'updated_at',
            'is_complete',
            'age',
            'profile_complete',
            'join_date',
            'last_active',
            'completion_percentage',
            'matches_count',
            'premium_plan',           # ← ADDED
            'premium_activated_at',   # ← ADDED
            'premium_expires_at',     # ← ADDED
        ]

    # ── computed fields ────────────────────────────────────────────────────────

    def get_join_date(self, obj):
        """Return the Django user's date_joined so the frontend can show it."""
        return obj.user.date_joined.isoformat() if obj.user.date_joined else None

    def get_matches_count(self, obj):
        try:
            from login.models import Match
            from django.db.models import Q
            email = (obj.user.email or obj.user.username or "").lower()
            return Match.objects.filter(
                Q(user_a=email) | Q(user_b=email),
                status="active",
            ).count()
        except Exception:
            return obj.matches or 0

    # ── validators ────────────────────────────────────────────────────────────

    def validate_gender(self, value):
        valid_genders = ['Man', 'Woman']
        if value and value not in valid_genders:
            raise serializers.ValidationError(
                f"Gender must be one of: {', '.join(valid_genders)}"
            )
        return value

    def validate_relationship_type(self, value):
        valid_types = ['Single', 'Committed', 'Broken up recently', 'Divorced', 'Widowed']
        if value and value not in valid_types:
            raise serializers.ValidationError(
                f"Relationship type must be one of: {', '.join(valid_types)}"
            )
        return value

    def validate_interested_in(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("interested_in must be a list")
        valid_options = ['Men', 'Women', 'Everyone']
        invalid_options = [item for item in value if item not in valid_options]
        if invalid_options:
            raise serializers.ValidationError(
                f"Invalid options: {', '.join(invalid_options)}. "
                f"Valid options are: {', '.join(valid_options)}"
            )
        return value

    def validate_interests(self, value):
        if len(value) > 10:
            raise serializers.ValidationError("Maximum 10 interests allowed")
        return value

    def validate_sexual_orientation(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("sexual_orientation must be a list")
        return value

    def validate_relationship_goals(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("relationship_goals must be a list")
        return value

    def validate_onboarding_step(self, value):
        if value < 0 or value > 10:
            raise serializers.ValidationError("onboarding_step must be between 0 and 10")
        return value

    def validate_social_accounts(self, value):
        if value is None:
            return {}
        if not isinstance(value, dict):
            raise serializers.ValidationError("Social accounts must be a dictionary")
        allowed_keys = ['instagram', 'whatsapp', 'snapchat', 'twitter', 'linkedin']
        invalid_keys = set(value.keys()) - set(allowed_keys)
        if invalid_keys:
            raise serializers.ValidationError(
                f"Invalid social account types: {invalid_keys}"
            )
        for key, val in value.items():
            if not isinstance(val, str):
                raise serializers.ValidationError(f"{key} must be a string")
        return value

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if representation.get('social_accounts') is None:
            representation['social_accounts'] = {}
        if representation.get('sexual_orientation') is None:
            representation['sexual_orientation'] = []
        if representation.get('relationship_goals') is None:
            representation['relationship_goals'] = []
        return representation