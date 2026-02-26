"""
URL configuration for config project.
"""

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


def api_root(request):
    return JsonResponse({
        "name": "ENV-MONITOR API",
        "version": "1.0",
        "status": "running",
        "authentication": "JWT (Bearer token)",
        "endpoints": {
            "login": "/api/token/",
            "refresh": "/api/token/refresh/",
            "measurements": "/api/measurements/",
            "stats": "/api/measurements/stats/",
            "admin": "/admin/"
        }
    })


urlpatterns = [
    path("", api_root),

    path("admin/", admin.site.urls),

    # JWT
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Measurements app
    path("api/measurements/", include("measurements.urls")),
]