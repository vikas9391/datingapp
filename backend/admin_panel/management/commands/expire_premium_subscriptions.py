# admin_panel/management/commands/expire_premium_subscriptions.py
#
# Run manually:    python manage.py expire_premium_subscriptions
# Run via cron:    0 * * * * /path/to/venv/bin/python manage.py expire_premium_subscriptions
# Run via Celery:  see notes at bottom of file

from django.core.management.base import BaseCommand
from django.utils import timezone
from admin_panel.models import PremiumSubscription


class Command(BaseCommand):
    help = (
        "Finds all PremiumSubscription records whose expires_at has passed "
        "and whose status is still 'active', then marks them expired and "
        "strips premium access from the linked UserProfile."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Print what would be expired without making any changes.',
        )

    def handle(self, *args, **options):
        dry_run: bool = options['dry_run']
        now = timezone.now()

        # Fetch all active subs that have passed their expiry
        expired_qs = PremiumSubscription.objects.filter(
            status='active',
            expires_at__lte=now,
        ).select_related('user', 'plan', 'user__profile')

        count = expired_qs.count()

        if count == 0:
            self.stdout.write(self.style.SUCCESS('✅ No subscriptions to expire.'))
            return

        if dry_run:
            self.stdout.write(
                self.style.WARNING(f'[DRY RUN] Would expire {count} subscription(s):')
            )
            for sub in expired_qs:
                self.stdout.write(
                    f'  • #{sub.pk} — {sub.user.username} | '
                    f'{sub.plan.name if sub.plan else "N/A"} | '
                    f'expired {sub.expires_at}'
                )
            return

        success = 0
        errors = 0

        for sub in expired_qs:
            try:
                sub.expire()
                success += 1
                self.stdout.write(
                    f'  ✓ Expired subscription #{sub.pk} for {sub.user.username}'
                )
            except Exception as exc:
                errors += 1
                self.stderr.write(
                    self.style.ERROR(
                        f'  ✗ Failed to expire subscription #{sub.pk} '
                        f'for {sub.user.username}: {exc}'
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\nDone. Expired: {success} | Errors: {errors} | Total: {count}'
            )
        )


# ─────────────────────────────────────────────────────────────────────────────
# CELERY BEAT (optional – uncomment in settings.py if you use Celery)
# ─────────────────────────────────────────────────────────────────────────────
#
# In celery.py / tasks.py:
#
#   from celery import shared_task
#   from django.core.management import call_command
#
#   @shared_task
#   def expire_premium_subscriptions_task():
#       call_command('expire_premium_subscriptions')
#
# In settings.py:
#
#   from celery.schedules import crontab
#   CELERY_BEAT_SCHEDULE = {
#       'expire-premium-subscriptions': {
#           'task': 'admin_panel.tasks.expire_premium_subscriptions_task',
#           'schedule': crontab(minute=0),   # every hour
#       },
#   }