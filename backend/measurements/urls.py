from django.urls import path
from .views import MeasurementListCreateView, MeasurementStatsView, RecentMeasurementsView

from django.urls import path, include

urlpatterns = [
    path('', MeasurementListCreateView.as_view(), name='measurement-list-create'),
    path("",MeasurementListCreateView.as_view()),
    path("stats/", MeasurementStatsView.as_view()),
    path("recent/", RecentMeasurementsView.as_view())
    ]