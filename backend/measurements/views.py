from datetime import timedelta

from django.conf import settings
from django.utils import timezone
from django.utils.dateparse import parse_date
from django.db.models import Avg

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Measurement
from .serializers import MeasurementSerializer


def co_status(value, thresholds):
    if value is None:
        return "unknown"
    if value <= thresholds["ok_max"]:
        return "ok"
    if value <= thresholds["warning_max"]:
        return "warning"
    return "danger"


class MeasurementListCreateView(generics.ListCreateAPIView):
    serializer_class = MeasurementSerializer

    def get_queryset(self):
        queryset = Measurement.objects.all().order_by("-created_at")

        date_from = self.request.query_params.get("from")
        date_to = self.request.query_params.get("to")

        if date_from:
            parsed_from = parse_date(date_from)
            if parsed_from:
                queryset = queryset.filter(created_at__date__gte=parsed_from)

        if date_to:
            parsed_to = parse_date(date_to)
            if parsed_to:
                queryset = queryset.filter(created_at__date__lte=parsed_to)

        return queryset

    def create(self, request, *args, **kwargs):
        token = request.headers.get("X-API-KEY")
        expected = getattr(settings, "API_TOKEN", None)

        if token != expected:
            return Response(
                {"detail": "Invalid or missing API token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        return super().create(request, *args, **kwargs)


class MeasurementStatsView(APIView):
    def get(self, request):
        now = timezone.now()
        one_hour_ago = now - timedelta(hours=1)
        twenty_four_hours_ago = now - timedelta(hours=24)

        last_measurement = Measurement.objects.order_by("-created_at").first()

        last_hour_qs = Measurement.objects.filter(created_at__gte=one_hour_ago)
        last_24h_qs = Measurement.objects.filter(created_at__gte=twenty_four_hours_ago)

        thresholds = getattr(settings, "CO_THRESHOLDS", {"ok_max": 30, "warning_max": 70})
        last_co = last_measurement.co if last_measurement else None
        status_str = co_status(last_co, thresholds)

        data = {
            "co_status": status_str,
            "co_thresholds": thresholds,
            "last_measurement": {
                "temperature": last_measurement.temperature if last_measurement else None,
                "humidity": last_measurement.humidity if last_measurement else None,
                "co": last_co,
                "created_at": last_measurement.created_at if last_measurement else None,
            },
            "last_hour_avg": {
                "temperature": last_hour_qs.aggregate(Avg("temperature"))["temperature__avg"],
                "humidity": last_hour_qs.aggregate(Avg("humidity"))["humidity__avg"],
                "co": last_hour_qs.aggregate(Avg("co"))["co__avg"],
            },
            "last_24h_avg": {
                "temperature": last_24h_qs.aggregate(Avg("temperature"))["temperature__avg"],
                "humidity": last_24h_qs.aggregate(Avg("humidity"))["humidity__avg"],
                "co": last_24h_qs.aggregate(Avg("co"))["co__avg"],
            },
        }

        return Response(data)


class RecentMeasurementsView(APIView):
    def get(self, request):
        period = request.query_params.get("period", "1h")
        now = timezone.now()

        if period == "24h":
            since = now - timedelta(hours=24)
        else:
            since = now - timedelta(hours=1)

        queryset = (
            Measurement.objects
            .filter(created_at__gte=since)
            .order_by("created_at")
        )

        serializer = MeasurementSerializer(queryset, many=True)
        return Response(serializer.data)