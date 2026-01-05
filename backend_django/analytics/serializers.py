from rest_framework import serializers
from .models import Student, AcademicRecord, SemesterPerformance, Prediction, FeedbackLog

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

class AcademicRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicRecord
        fields = '__all__'

class SemesterPerformanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = SemesterPerformance
        fields = '__all__'

class PredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prediction
        fields = '__all__'

# Custom Serializer for Dashboard Stats to match strict JSON shape
class DashboardStatsSerializer(serializers.Serializer):
    total_students = serializers.IntegerField()
    average_attendance = serializers.FloatField()
    avg_cgpa = serializers.FloatField()
    risk_distribution = serializers.DictField()
