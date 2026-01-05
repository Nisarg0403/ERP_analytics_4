from django.db import models

class Student(models.Model):
    roll_number = models.CharField(max_length=20, unique=True, db_index=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(null=True, blank=True)
    course = models.CharField(max_length=50, null=True, blank=True)
    semester = models.IntegerField(default=1)

    class Meta:
        db_table = "students"

class AcademicRecord(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="academic_records")
    subject_name = models.CharField(max_length=100)
    marks_obtained = models.FloatField()
    total_marks = models.FloatField()
    grade = models.CharField(max_length=5, null=True, blank=True)
    grade_point = models.IntegerField(null=True, blank=True)
    attendance_percentage = models.FloatField(null=True, blank=True)
    semester = models.IntegerField()
    subject_credits = models.IntegerField(default=4)

    class Meta:
        db_table = "academic_records"
        unique_together = ('student', 'subject_name', 'semester')

class SemesterPerformance(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="semester_performances")
    semester = models.IntegerField()
    sgpa = models.FloatField(null=True, blank=True)
    cgpa = models.FloatField(null=True, blank=True)
    attendance_percentage = models.FloatField(null=True, blank=True)

    class Meta:
        db_table = "semester_performance"
        unique_together = ('student', 'semester')

class Prediction(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="predictions")
    risk_score = models.FloatField()
    predicted_grade = models.CharField(max_length=5, null=True, blank=True)
    average_marks = models.FloatField(null=True, blank=True)
    sentiment_score = models.FloatField(null=True, blank=True)
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "predictions"

class FeedbackLog(models.Model):
    student_id_val = models.IntegerField(null=True, blank=True) # Loose coupling or FK? SQLAlchemy had student_id. Let's stick to simple field if specific FK missing
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "feedback_logs"
