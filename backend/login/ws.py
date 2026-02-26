from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

channel_layer = get_channel_layer()


def email_to_group(email: str) -> str:
    """
    Canonical group name for a user's notification channel.
    Must match the same function in consumers.py exactly.
    e.g. "alice@test.com" → "user_alice_at_test.com"
    
    NOTE: We do NOT replace dots so the group name stays simple.
    Dots are valid in Django Channels group names.
    """
    return "user_" + email.lower().replace("@", "_at_")


def notify_user(email: str, payload: dict):
    """
    Push a real-time event to a specific user's notification WebSocket group.
    Used after match creation, etc.
    """
    group = email_to_group(email)
    async_to_sync(channel_layer.group_send)(
        group,
        {
            "type": "notification_event",
            "payload": payload,
        }
    )