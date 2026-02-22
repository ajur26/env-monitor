from rest_framework import generics
from .models import Measurement
from .serializers import MeasurementSerializer
from django.utils.dateparse import parse_date
from django.db.models import Avg, Min, Max
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
from rest_framework import status

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
        queryset = Measurement.objects.all()

        stats = queryset.aggregate(
            temperature_avg=Avg("temperature"),
            temperature_min=Min("temperature"),
            temperature_max=Max("temperature"),
            humidity_avg=Avg("humidity"),
            co_avg=Avg("co"),
        )

        return Response(stats)