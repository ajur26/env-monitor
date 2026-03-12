from django.urls import path
from .views import (
    MeasurementListCreateView,
    MeasurementStatsView,
    RecentMeasurementsView,
    LatestMeasurementsView,
    AlarmListView
)

urlpatterns = [
    path("", MeasurementListCreateView.as_view(), name="measurement-list-create"),
    path("stats/", MeasurementStatsView.as_view(), name="measurement-stats"),
    path("recent/", RecentMeasurementsView.as_view(), name="recent-measurements"),
    path("latest/", LatestMeasurementsView.as_view(), name="latest-measurements"),
    path("alarms/", AlarmListView.as_view(), name="alarms"),
]