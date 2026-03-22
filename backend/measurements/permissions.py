from django.conf import settings
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsUserOrDeviceApiKey(BasePermission):
    """
    - GET/HEAD/OPTIONS: wymaga zalogowanego usera (JWT)
    - POST:
        - user (JWT) LUB
        - urządzenie (X-API-KEY lub Authorization: Api-Key ...)
    """

    message = "Authentication credentials were not provided."

    def has_permission(self, request, view):
        # SAFE → tylko user
        if request.method in SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)

        # POST → user OK
        if request.user and request.user.is_authenticated:
            return True

        expected = getattr(settings, "API_TOKEN", None)

        # 🔥 1. X-API-KEY (główna metoda dla ESP)
        token = request.headers.get("X-API-KEY")

        if expected and token == expected:
            return True

        # 🔥 2. Authorization fallback (opcjonalne)
        auth = request.headers.get("Authorization")
        if auth and auth.startswith("Api-Key "):
            token = auth.split("Api-Key ")[1]
            if token == expected:
                return True

        self.message = "Invalid or missing API token."
        return False