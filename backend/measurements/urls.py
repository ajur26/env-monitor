from django.urls import path
from .views import MeasurementListCreateView
from django.urls import path, include

urlpatterns = [
    path('', MeasurementListCreateView.as_view(), name='measurement-list-create'),
    ]