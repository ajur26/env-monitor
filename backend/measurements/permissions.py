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

        if request.method in SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)

        if request.user and request.user.is_authenticated:
            return True

        expected = getattr(settings, "API_TOKEN", None)

        if not expected:
            return False

        token = request.headers.get("X-API-KEY")

        if token == expected:
            return True

        auth = request.headers.get("Authorization")
        if auth and auth.startswith("Api-Key "):
            parts = auth.split("Api-Key ")
            if len(parts) == 2:
                token = parts[1]
                if token == expected:
                    return True

        self.message = "Invalid or missing API token."
        return False