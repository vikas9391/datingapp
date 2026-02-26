import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.cache import cache
from django.db.models import Q

from login.mysql_managers import MySQLChatManager, MySQLMatchManager
from login.models import BlockedUser

# -------------------------------
# Helpers
# -------------------------------

ONLINE_USERS_KEY = "online_users"


@database_sync_to_async
def is_blocked_either_direction(sender: str, receiver: str) -> bool:
    """
    Returns True if EITHER party has blocked the other.
    - sender blocked receiver  → sender shouldn't be able to message
    - receiver blocked sender  → receiver has blocked them, still prevent message delivery
    """
    return BlockedUser.objects.filter(
        Q(blocker=sender, blocked=receiver) |
        Q(blocker=receiver, blocked=sender)
    ).exists()


def get_user_email(user) -> str:
    username = getattr(user, "username", "") or ""
    email_field = getattr(user, "email", "") or ""
    return (username or email_field).lower()


def email_to_group(email: str) -> str:
    return "user_" + email.lower().replace("@", "_at_")


@database_sync_to_async
def get_chat(chat_id: int):
    return MySQLChatManager.get_chat(chat_id)


def get_online_users() -> set:
    return cache.get(ONLINE_USERS_KEY, set())


def add_online_user(email: str):
    users = get_online_users()
    users.add(email)
    cache.set(ONLINE_USERS_KEY, users)


def remove_online_user(email: str):
    users = get_online_users()
    users.discard(email)
    cache.set(ONLINE_USERS_KEY, users)


# ===============================
# NOTIFICATION CONSUMER
# ===============================

class NotificationConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        user = self.scope.get("user")

        if not user or user.is_anonymous:
            await self.close(code=4401)
            return

        self.user_email = get_user_email(user)
        self.group_name = email_to_group(self.user_email)

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        add_online_user(self.user_email)
        await self.send_existing_presence()
        await self.broadcast_presence(is_online=True)

    async def disconnect(self, close_code):
        if hasattr(self, "user_email"):
            remove_online_user(self.user_email)
            await self.broadcast_presence(is_online=False)

        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def broadcast_presence(self, is_online: bool):
        matched_emails = await database_sync_to_async(
            MySQLMatchManager.get_user_matches
        )(self.user_email)

        for email in matched_emails:
            await self.channel_layer.group_send(
                email_to_group(email),
                {
                    "type": "presence_event",
                    "payload": {
                        "type": "presence",
                        "user_email": self.user_email,
                        "is_online": is_online,
                    }
                }
            )

    async def send_existing_presence(self):
        online_users = get_online_users()
        matched_emails = await database_sync_to_async(
            MySQLMatchManager.get_user_matches
        )(self.user_email)

        for email in matched_emails:
            if email in online_users:
                await self.send(text_data=json.dumps({
                    "type": "presence",
                    "user_email": email,
                    "is_online": True,
                }))

    async def presence_event(self, event):
        await self.send(text_data=json.dumps(event["payload"]))

    async def notification_event(self, event):
        await self.send(text_data=json.dumps(event["payload"]))

    # ── ✅ NEW: receives NEW_MESSAGE forwarded from ChatConsumer
    async def new_message_event(self, event):
        await self.send(text_data=json.dumps(event["payload"]))


# ===============================
# CHAT CONSUMER
# ===============================

class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        user = self.scope.get("user")

        if not user or user.is_anonymous:
            await self.close(code=4401)
            return

        chat_id = self.scope["url_route"]["kwargs"].get("chat_id")
        if not chat_id:
            await self.close(code=4400)
            return

        self.user = user
        self.user_email = get_user_email(user)
        self.chat_id = int(chat_id)
        self.room_group_name = f"chat_{self.chat_id}"

        chat = await get_chat(self.chat_id)
        if not chat:
            await self.close(code=4404)
            return

        participants = [p.lower() for p in chat.get("participants", [])]
        if self.user_email not in participants:
            await self.close(code=4403)
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        event_type = data.get("type")

        if event_type == "typing":
            await self.handle_typing(data)
        elif event_type == "message":
            await self.handle_message(data)

    async def handle_message(self, data):
        content = (data.get("content") or "").strip()

        # ✅ FIX 1: Drop empty messages before any processing
        if not content:
            return

        sender = self.user_email
        chat = await get_chat(self.chat_id)
        if not chat:
            return

        participants = [p.lower() for p in chat["participants"]]
        try:
            receiver = next(e for e in participants if e != sender)
        except StopIteration:
            return

        # ✅ FIX 2: Check block in BOTH directions
        # If sender blocked receiver OR receiver blocked sender → reject
        if await is_blocked_either_direction(sender, receiver):
            await self.send(text_data=json.dumps({
                "type": "error",
                "code": "blocked",
                "message": "You cannot send messages to this user.",
            }))
            return

        # ✅ FIX 3: Capture saved message ID and timestamp to echo back to sender
        saved = await self.save_message_and_return(self.chat_id, sender, receiver, content)

        # Broadcast to the chat group (both participants)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "payload": {
                    "type": "message",
                    "id": saved["id"],
                    "sender": sender,
                    "receiver": receiver,
                    "content": content,
                    "created_at": saved["created_at"],
                },
            }
        )

        # ✅ FIX 4: Forward NEW_MESSAGE to receiver's notification channel
        # This is what makes TopBar show a toast when the user is on another page
        await self.channel_layer.group_send(
            email_to_group(receiver),
            {
                "type": "new_message_event",
                "payload": {
                    "type": "NEW_MESSAGE",
                    "sender": sender,
                    "sender_name": sender.split("@")[0],
                    "chat_id": self.chat_id,
                    "content": content,
                },
            }
        )

    async def handle_typing(self, data):
        sender = self.user_email
        chat = await get_chat(self.chat_id)
        if not chat:
            return

        participants = [p.lower() for p in chat["participants"]]
        try:
            receiver = next(e for e in participants if e != sender)
        except StopIteration:
            return

        # Don't broadcast typing if blocked in either direction
        if await is_blocked_either_direction(sender, receiver):
            return

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "typing_event",
                "payload": {
                    "type": "typing",
                    "user_email": sender,
                    "is_typing": data.get("is_typing", False),
                }
            }
        )

    async def chat_message(self, event):
        """Deliver a chat message payload to this WebSocket connection."""
        await self.send(text_data=json.dumps(event["payload"]))

    async def typing_event(self, event):
        """Don't echo typing back to the sender."""
        if event["payload"]["user_email"] != self.user_email:
            await self.send(text_data=json.dumps(event["payload"]))

    # ── DB helper ──────────────────────────────────────────────────────────

    @database_sync_to_async
    def save_message_and_return(self, chat_id: int, sender: str, receiver: str, content: str) -> dict:
        """
        Saves a message via MySQLChatManager and returns its DB id + created_at
        so the frontend can replace the optimistic temp message with the real one.
        """
        from login.models import Message, Chat
        from django.utils import timezone

        chat_obj = Chat.objects.get(pk=chat_id)
        msg = Message.objects.create(
            chat=chat_obj,
            sender=sender,
            receiver=receiver,
            content=content,
            type="text",
            is_read=False,
        )

        # Keep Chat.last_message in sync
        chat_obj.last_message = content
        chat_obj.last_message_at = timezone.now()
        chat_obj.save(update_fields=["last_message", "last_message_at"])

        return {
            "id": msg.pk,
            "created_at": msg.created_at.isoformat(),
        }