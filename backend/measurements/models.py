from django.db import models


class Measurement(models.Model):
    POINT_CHOICES = [
        ("living_room", "Living Room"),
        ("bedroom", "Bedroom"),
    ]

    CO_STATUS_CHOICES = [
        ("ok", "OK"),
        ("warning", "Warning"),
        ("danger", "Danger"),
    ]

    point = models.CharField(
        max_length=20,
        choices=POINT_CHOICES,
        db_index=True,
    )

    temperature = models.FloatField()
    humidity = models.FloatField()
    pressure = models.FloatField()  # hPa

    co = models.IntegerField(null=True, blank=True)  # ppm
    co_voltage = models.FloatField(null=True, blank=True)
    co_status = models.CharField(
        max_length=20,
        choices=CO_STATUS_CHOICES,
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return (
            f"{self.point} | "
            f"{self.temperature}°C | "
            f"{self.humidity}% | "
            f"{self.pressure} hPa | "
            f"{self.co} ppm | "
            f"{self.co_voltage} V ({self.co_status}) | "
            f"{self.created_at}"
        )


class Alarm(models.Model):
    POINT_CHOICES = [
        ("living_room", "Living Room"),
        ("bedroom", "Bedroom"),
    ]

    CO_STATUS_CHOICES = [
        ("ok", "OK"),
        ("warning", "Warning"),
        ("danger", "Danger"),
    ]

    point = models.CharField(
        max_length=20,
        choices=POINT_CHOICES,
        db_index=True,
    )

    temperature = models.FloatField(null=True, blank=True)
    humidity = models.FloatField(null=True, blank=True)
    co = models.IntegerField(null=True, blank=True)  # ppm
    co_voltage = models.FloatField(null=True, blank=True)
    co_status = models.CharField(
        max_length=20,
        choices=CO_STATUS_CHOICES,
        null=True,
        blank=True,
    )

    message = models.CharField(max_length=255)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return f"{self.point} | {self.message} | {self.created_at}"