from rest_framework import generics
from .models import Measurement
from .serializers import MeasurementSerializer

class MeasurementListCreateView(generics.ListCreateAPIView):
    queryset = Measurement.objects.all().order_by('-created_at')
    serializer_class = MeasurementSerializer

    def get_queryset(self):
        return (
            Measurement.objects
            .all()
            .order_by('-created_at')[:100]
        )