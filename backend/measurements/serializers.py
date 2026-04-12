from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from django.conf import settings

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

    def validate_pressure(self, value):
        if value < 800 or value > 1200:
            raise serializers.ValidationError("Pressure out of realistic range.")
        return value

    def validate_co(self, value):
        if value is not None and (value < 0 or value > 10000):
            raise serializers.ValidationError("CO must be between 0 and 10000 ppm.")
        return value

    def create(self, validated_data):
        co_value = validated_data.get("co")

        # ustaw co_status
        if co_value is not None:
            if co_value > settings.CO_THRESHOLDS["warning_max"]:
                validated_data["co_status"] = "danger"
            elif co_value > settings.CO_THRESHOLDS["ok_max"]:
                validated_data["co_status"] = "warning"
            else:
                validated_data["co_status"] = "ok"

        measurement = Measurement.objects.create(**validated_data)

        point = validated_data.get("point")

        if co_value is not None:
            thresholds_warning = settings.CO_THRESHOLDS["ok_max"]
            thresholds_danger = settings.CO_THRESHOLDS["warning_max"]

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
                        co_voltage=validated_data.get("co_voltage"),
                        co_status=validated_data.get("co_status"),
                        message=message,
                    )

        return measurement


class AlarmSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alarm
        fields = "__all__"