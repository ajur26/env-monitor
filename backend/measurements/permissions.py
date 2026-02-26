from django.conf import settings
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsUserOrDeviceApiKey(BasePermission):
    """
    - GET/HEAD/OPTIONS: wymaga zalogowanego usera (JWT)
    - POST: pozwala urządzeniu przez X-API-KEY albo userowi przez JWT
    """

    message = "Authentication credentials were not provided."

    def has_permission(self, request, view):
        # Dla metod bezpiecznych wymagamy JWT (user)
        if request.method in SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)

        # Dla POST dopuszczam:
        # - usera zalogowanego (JWT)
        if request.user and request.user.is_authenticated:
            return True

        # - albo urządzenie po X-API-KEY
        token = request.headers.get("X-API-KEY")
        expected = getattr(settings, "API_TOKEN", None)

        if expected and token == expected:
            return True

        self.message = "Invalid or missing API token."
        return False