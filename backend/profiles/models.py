from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from typing import Dict, Any


class UserProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
        primary_key=True
    )

    # Step 1: Basic Info
    first_name = models.CharField(max_length=100, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=50, blank=True)
    show_gender = models.BooleanField(default=True)
    interested_in = models.JSONField(default=list, blank=True)

    # Step 2: Relationship Status
    relationship_type = models.CharField(max_length=100, blank=True)

    # Step 3: Distance
    distance = models.IntegerField(default=25)
    strict_distance = models.BooleanField(default=False)

    # Step 4: Lifestyle
    drinking = models.CharField(max_length=50, blank=True)
    smoking = models.CharField(max_length=50, blank=True)
    workout = models.CharField(max_length=50, blank=True)
    pets = models.CharField(max_length=50, blank=True)

    # Step 5: Communication
    communication_style = models.JSONField(default=list, blank=True)
    response_pace = models.CharField(max_length=100, blank=True)

    # Step 6: Interests
    interests = models.JSONField(default=list, blank=True)

    # Step 7: Location
    location = models.CharField(max_length=200, blank=True)
    use_current_location = models.BooleanField(default=False)
    latitude = models.FloatField(null=True, blank=True)  
    longitude = models.FloatField(null=True, blank=True) 
    # Step 8: Bio
    bio = models.TextField(max_length=500, blank=True)

    # Step 9: Social Accounts
    social_accounts = models.JSONField(default=dict, blank=True)

    # Onboarding tracking
    onboarding_step = models.IntegerField(default=0)
    completion_percentage = models.FloatField(default=0.0)

    # Sexual orientation / relationship goals
    sexual_orientation = models.JSONField(default=list, blank=True)
    relationship_goals = models.JSONField(default=list, blank=True)

    # Catch-all for extra onboarding fields
    extra_data = models.JSONField(default=dict, blank=True)

    # ===== ADMIN PANEL FIELDS =====
    STATUS_CHOICES = [
        ('online', 'Online'),
        ('away', 'Away'),
        ('offline', 'Offline'),
    ]

    ACCOUNT_STATUS_CHOICES = [
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('banned', 'Banned'),
        ('pending', 'Pending'),
    ]

    phone = models.CharField(max_length=20, blank=True)
    age = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='offline')
    account_status = models.CharField(max_length=20, choices=ACCOUNT_STATUS_CHOICES, default='active')
    join_date = models.DateTimeField(auto_now_add=True)
    last_active = models.DateTimeField(default=timezone.now)
    active_time = models.IntegerField(default=0)
    matches = models.IntegerField(default=0)
    messages = models.IntegerField(default=0)
    reports = models.IntegerField(default=0)
    profile_complete = models.BooleanField(default=False)
    verified = models.BooleanField(default=False)
    premium = models.BooleanField(default=False)
    # ===== END ADMIN PANEL FIELDS =====

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_complete = models.BooleanField(default=False)
    # In profiles/models.py — add to UserProfile class
    premium_plan = models.CharField(max_length=100, null=True, blank=True)
    premium_activated_at = models.DateTimeField(null=True, blank=True)
    premium_expires_at = models.DateTimeField(null=True, blank=True)
    swipes_used = models.IntegerField(default=0)


    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        return f"{self.user.username}'s Profile"

    def save(self, *args, **kwargs):
        if self.social_accounts is None:
            self.social_accounts = {}

        if self.date_of_birth:
            from datetime import date
            today = date.today()
            self.age = today.year - self.date_of_birth.year - (
                (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
            )

        self.is_complete = all([
            self.first_name,
            self.date_of_birth,
            self.gender,
            self.location,
            self.bio,
        ])

        self.profile_complete = self.is_complete
        super().save(*args, **kwargs)

    def to_dict(self) -> Dict[str, Any]:
        """Compatibility method used by MySQLProfileManager and login views."""
        data = {
            "email": self.user.email or self.user.username,
            "onboarding_step": self.onboarding_step,
            "completion_percentage": self.completion_percentage,
            "firstName": self.first_name,
            "first_name": self.first_name,
            "bio": self.bio,
            "age": self.age,
            "gender": self.gender,
            "location": self.location,
            "drinking": self.drinking,
            "smoking": self.smoking,
            "workout": self.workout,
            "pets": self.pets,
            "relationship_goals": self.relationship_goals or [],
            "sexual_orientation": self.sexual_orientation or [],
            "interests": self.interests or [],
            "communication_style": self.communication_style or [],
            "response_pace": self.response_pace,
            "distance": self.distance,
            "relationship_type": self.relationship_type,
            "relationshipType": self.relationship_type,
            "verified": self.verified,
            "premium": self.premium,
            "last_active": self.last_active.isoformat() if self.last_active else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "account_status": self.account_status,
            "swipes_used": self.swipes_used,
        }
        if self.extra_data:
            data.update(self.extra_data)
        return data