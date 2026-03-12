from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta

from .models import Measurement, Alarm


class MeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Measurement
        fields = "__all__"
        read_only_fields = ["id", "created_at"]

    def validate_temperature(self, value):
        if value < -50 or value > 100:
            raise serializers.ValidationError("Temperature out of realistic range.")
        return value

    def validate_humidity(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Humidity must be between 0 and 100.")
        return value

    def validate_co(self, value):
        if value is not None:
            if value < 0 or value > 10000:
                raise serializers.ValidationError("CO must be between 0 and 10000 ppm.")
        return value

    def create(self, validated_data):
        measurement = Measurement.objects.create(**validated_data)

        co_value = validated_data.get("co")
        point = validated_data.get("point")

        if co_value is not None:

            thresholds_warning = 30
            thresholds_danger = 70

            message = None

            if co_value > thresholds_danger:
                message = "CO danger level exceeded"
            elif co_value > thresholds_warning:
                message = "CO warning level exceeded"

            if message:
                one_minute_ago = timezone.now() - timedelta(minutes=1)

                recent_alarm_exists = Alarm.objects.filter(
                    point=point,
                    created_at__gte=one_minute_ago
                ).exists()

                if not recent_alarm_exists:
                    Alarm.objects.create(
                        point=point,
                        temperature=validated_data.get("temperature"),
                        humidity=validated_data.get("humidity"),
                        co=co_value,
                        message=message,
                    )

        return measurement