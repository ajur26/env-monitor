from django.db import models

class Measurement(models.Model):
    temperature = models.FloatField()
    humidity = models.FloatField()
    co = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

def __str__(self):
    return f"{self.temperature}°C | {self.humidity}% | {self.co} ppm | {self.created_at}"
    