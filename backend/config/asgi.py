# config/asgi.py
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')  # ← MUST be first

import django
django.setup()  # ← add this

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from login.routing import websocket_urlpatterns
from login.middleware import JWTAuthMiddlewareStack

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JWTAuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})