from datetime import timedelta

from django.conf import settings
from django.db.models import Avg
from django.utils import timezone
from django.utils.dateparse import parse_date

from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .models import Measurement, Alarm
from .permissions import IsUserOrDeviceApiKey
from .serializers import MeasurementSerializer, AlarmSerializer


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
    permission_classes = [IsUserOrDeviceApiKey]

    def get_queryset(self):
        queryset = Measurement.objects.all().order_by("-created_at")

        point = self.request.query_params.get("point")
        date_from = self.request.query_params.get("from")
        date_to = self.request.query_params.get("to")

        if point:
            queryset = queryset.filter(point=point)

        if date_from:
            parsed_from = parse_date(date_from)
            if parsed_from:
                queryset = queryset.filter(created_at__date__gte=parsed_from)

        if date_to:
            parsed_to = parse_date(date_to)
            if parsed_to:
                queryset = queryset.filter(created_at__date__lte=parsed_to)

        return queryset


class MeasurementStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        point = request.query_params.get("point")

        now = timezone.now()
        one_hour_ago = now - timedelta(hours=1)
        twenty_four_hours_ago = now - timedelta(hours=24)

        queryset = Measurement.objects.all()

        if point:
            queryset = queryset.filter(point=point)

        last_measurement = queryset.order_by("-created_at").first()

        last_hour_qs = queryset.filter(created_at__gte=one_hour_ago)
        last_24h_qs = queryset.filter(created_at__gte=twenty_four_hours_ago)

        thresholds = getattr(
            settings,
            "CO_THRESHOLDS",
            {"ok_max": 30, "warning_max": 70}
        )

        last_co = last_measurement.co if last_measurement else None
        status_str = co_status(last_co, thresholds)

        last_hour_avg = last_hour_qs.aggregate(
            temperature=Avg("temperature"),
            humidity=Avg("humidity"),
            co=Avg("co")
        )

        last_24h_avg = last_24h_qs.aggregate(
            temperature=Avg("temperature"),
            humidity=Avg("humidity"),
            co=Avg("co")
        )

        data = {
            "co_status": status_str,
            "co_thresholds": thresholds,
            "last_measurement": {
                "temperature": last_measurement.temperature if last_measurement else None,
                "humidity": last_measurement.humidity if last_measurement else None,
                "co": last_co,
                "created_at": last_measurement.created_at if last_measurement else None,
            },
            "last_hour_avg": last_hour_avg,
            "last_24h_avg": last_24h_avg,
        }

        return Response(data)


class RecentMeasurementsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        period = request.query_params.get("period", "1h")
        point = request.query_params.get("point")

        now = timezone.now()

        if period == "24h":
            since = now - timedelta(hours=24)
        else:
            since = now - timedelta(hours=1)

        queryset = Measurement.objects.filter(created_at__gte=since)

        if point:
            queryset = queryset.filter(point=point)

        queryset = queryset.order_by("created_at")

        serializer = MeasurementSerializer(queryset, many=True)
        return Response(serializer.data)


class LatestMeasurementsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        living_room = (
            Measurement.objects
            .filter(point="living_room")
            .order_by("-created_at")
            .first()
        )

        bedroom = (
            Measurement.objects
            .filter(point="bedroom")
            .order_by("-created_at")
            .first()
        )

        data = {
            "living_room": {
                "temperature": living_room.temperature if living_room else None,
                "humidity": living_room.humidity if living_room else None,
                "co": living_room.co if living_room else None,
                "created_at": living_room.created_at if living_room else None,
            },
            "bedroom": {
                "temperature": bedroom.temperature if bedroom else None,
                "humidity": bedroom.humidity if bedroom else None,
                "co": bedroom.co if bedroom else None,
                "created_at": bedroom.created_at if bedroom else None,
            },
        }

        return Response(data)


class AlarmListView(generics.ListAPIView):
    queryset = Alarm.objects.all().order_by("-created_at")
    serializer_class = AlarmSerializer
    permission_classes = [IsAuthenticated]
