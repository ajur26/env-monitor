from django.db import models


class Measurement(models.Model):
    POINT_CHOICES = [
        ("living_room", "Living Room"),
        ("bedroom", "Bedroom"),
    ]

    point = models.CharField(max_length=20, choices=POINT_CHOICES)

    temperature = models.FloatField()
    humidity = models.FloatField()
    co = models.IntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.point} | {self.temperature}°C | {self.humidity}% | {self.co} ppm | {self.created_at}"