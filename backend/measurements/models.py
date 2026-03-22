from django.db import models


class Measurement(models.Model):
    POINT_CHOICES = [
        ("living_room", "Living Room"),
        ("bedroom", "Bedroom"),
    ]

    point = models.CharField(max_length=20, choices=POINT_CHOICES)

    temperature = models.FloatField()
    humidity = models.FloatField()
    pressure = models.FloatField()  # hPa

    co_voltage = models.FloatField(null=True, blank=True)
    co_status = models.CharField(max_length=20, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (
            f"{self.point} | "
            f"{self.temperature}°C | "
            f"{self.humidity}% | "
            f"{self.pressure} hPa | "
            f"{self.co_voltage} V ({self.co_status}) | "
            f"{self.created_at}"
        )


class Alarm(models.Model):
    POINT_CHOICES = [
        ("living_room", "Living Room"),
        ("bedroom", "Bedroom"),
    ]

    point = models.CharField(max_length=20, choices=POINT_CHOICES)

    temperature = models.FloatField(null=True, blank=True)
    humidity = models.FloatField(null=True, blank=True)
    co_voltage = models.FloatField(null=True, blank=True)
    co_status = models.CharField(max_length=20, null=True, blank=True)

    message = models.CharField(max_length=255)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.point} | {self.message} | {self.created_at}"