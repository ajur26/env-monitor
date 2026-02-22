from rest_framework import generics
from .models import Measurement
from .serializers import MeasurementSerializer
from django.utils.dateparse import parse_date
from django.db.models import Avg, Min, Max
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
from rest_framework import status
from django.utils import timezone
from datetime import timedelta


class MeasurementListCreateView(generics.ListCreateAPIView):
    serializer_class = MeasurementSerializer

    def get_queryset(self):
        queryset = Measurement.objects.all().order_by("-created_at")
        date_from = self.request.query_params.get("from")
        date_to = self.request.query_params.get("to")

        from django.utils.dateparse import parse_date

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

        if token != settings.API_TOKEN:
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

        last_hour = Measurement.objects.filter(created_at__gte=one_hour_ago)
        last_24h = Measurement.objects.filter(created_at__gte=twenty_four_hours_ago)

        data = {
            "last_measurement": {
                "temperature": last_measurement.temperature if last_measurement else None,
                "humidity": last_measurement.humidity if last_measurement else None,
                "co": last_measurement.co if last_measurement else None,
                "created_at": last_measurement.created_at if last_measurement else None,
            },
            "last_hour_avg": {
                "temperature": last_hour.aggregate(Avg("temperature"))["temperature__avg"],
                "humidity": last_hour.aggregate(Avg("humidity"))["humidity__avg"],
                "co": last_hour.aggregate(Avg("co"))["co__avg"],
            },
            "last_24h_avg": {
                "temperature": last_24h.aggregate(Avg("temperature"))["temperature__avg"],
                "humidity": last_24h.aggregate(Avg("humidity"))["humidity__avg"],
                "co": last_24h.aggregate(Avg("co"))["co__avg"],
            },
        }

        return Response(data)