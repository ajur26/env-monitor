from rest_framework import generics
from .models import Measurement
from .serializers import MeasurementSerializer
from django.utils.dateparse import parse_date
from django.db.models import Avg, Min, Max
from rest_framework.response import Response
from rest_framework.views import APIView

class MeasurementListCreateView(generics.ListCreateAPIView):
    queryset = Measurement.objects.all().order_by('-created_at')
    serializer_class = MeasurementSerializer

def get_queryset(self):
    queryset = Measurement.objects.all().order_by("-created_at")

    date_from = self.request.query_params.get("from")
    date_to = self.request.query_params.get("to")

    if date_from:
        queryset = queryset.filter(created_at_date__gte=parse_date(date_from))

    if date_to:
        queryset = queryset.filter(created_at_date__lte=parse_date(date_to))
    
    return queryset

class MeasurementStatsView(APIView):
    def get(self, request):
        queryset = Measurement.objects.all()

        stats = queryset.aggregate(
            temperature_avg=Avg("temperature"),
            temperature_min=Min("temperature"),
            temperature_max=Max("temperature"),
            humidity_avg=Avg("humidity"),
            co2_avg=Avg("co2"),
        )

        return Response(stats)