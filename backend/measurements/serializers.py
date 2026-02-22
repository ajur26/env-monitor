from rest_framework import serializers
from .models import Measurement

class MeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Measurement
        fields = '__all__'

    def validate_temperature(self, value):
        if value < -50 or value > 100:
            raise serializers.ValidationError("Temperature out of realistic range.")
        return value
        
    def validate_humidity(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Humidity must be between 0 and 100.")
        return value