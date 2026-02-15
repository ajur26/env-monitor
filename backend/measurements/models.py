from django.db import models

class Measurement(models.Model):
    temperature = models.FloatField()
    humidity = models.FloatField()
    co2 = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.temperature}°C | {self.humidity}% | {self.created_at}"
    