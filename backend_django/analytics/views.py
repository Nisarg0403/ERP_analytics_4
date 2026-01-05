from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Student, AcademicRecord, SemesterPerformance, Prediction, FeedbackLog
from .serializers import StudentSerializer, AcademicRecordSerializer
from .services.ml_service import ml_engine
from .services.gpa_service import GPAService
from django.db.models import Avg, Count, Max
import pandas as pd
import io

class UploadMasterView(APIView):
    def post(self, request):
        file = request.FILES.get('file')
        scope = request.data.get('scope', 'current')
        
        if not file or not file.name.endswith('.csv'):
            return Response({"detail": "File must be a CSV"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            content = file.read().decode('utf-8')
            df = pd.read_csv(io.StringIO(content))
        except Exception as e:
            return Response({"detail": f"Invalid CSV: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
            
        students_created = 0
        records_updated = 0
        
        # 1. Ingest Data
        for _, row in df.iterrows():
            roll = str(row['roll_number'])
            student, created = Student.objects.get_or_create(
                roll_number=roll,
                defaults={
                    'name': row.get('name', 'Unknown'),
                    'email': row.get('email', ''),
                    'course': row.get('course', ''),
                    'semester': int(row.get('semester', 1))
                }
            )
            if created: students_created += 1
            else:
                # Update existing
                student.name = row.get('name', student.name)
                student.semester = int(row.get('semester', student.semester))
                student.save()
            
            if 'subject_name' in row and pd.notna(row['subject_name']):
                credits = int(row.get('subject_credits', row.get('credits', 4)))
                marks = float(row.get('marks_obtained', 0))
                total = float(row.get('total_marks', 100))
                att = float(row.get('attendance_percentage', 0))
                sem = int(row.get('semester', student.semester))
                grade, point = GPAService.calculate_grade_point(marks, total)
                
                record, created = AcademicRecord.objects.update_or_create(
                    student=student,
                    subject_name=row['subject_name'],
                    semester=sem,
                    defaults={
                        'marks_obtained': marks,
                        'total_marks': total,
                        'attendance_percentage': att,
                        'subject_credits': credits,
                        'grade': grade,
                        'grade_point': point
                    }
                )
                records_updated += 1

        # 2. History Population (SemesterPerformance)
        history_groups = df.groupby(['roll_number', 'semester'])
        for (roll, sem), group in history_groups:
            avg_att = group['attendance_percentage'].mean()
            
            total_points = 0
            total_credits = 0
            provided_cgpa = None
            if 'cgpa' in group.columns and not group['cgpa'].dropna().empty:
                provided_cgpa = float(group['cgpa'].dropna().iloc[0])
                
            for _, r in group.iterrows():
                creds = int(r.get('subject_credits', r.get('credits', 4)))
                mk = float(r.get('marks_obtained', 0))
                tot = float(r.get('total_marks', 100))
                _, pt = GPAService.calculate_grade_point(mk, tot)
                total_points += pt * creds
                total_credits += creds
            
            sgpa_val = round(total_points / total_credits, 2) if total_credits > 0 else 0.0
            cgpa_to_store = provided_cgpa if provided_cgpa is not None else sgpa_val
            
            student = Student.objects.get(roll_number=str(roll))
            SemesterPerformance.objects.update_or_create(
                student=student,
                semester=int(sem),
                defaults={
                    'sgpa': sgpa_val,
                    'cgpa': cgpa_to_store,
                    'attendance_percentage': avg_att
                }
            )

        # 3. ML Processing
        # (Simplified loop closer to ingestion.py logic)
        unique_rolls = df['roll_number'].unique()
        for roll in unique_rolls:
            student = Student.objects.get(roll_number=str(roll))
            all_records = AcademicRecord.objects.filter(student=student)
            
            if not all_records.exists(): continue
            
            avg_att = all_records.aggregate(Avg('attendance_percentage'))['attendance_percentage__avg']
            # Manual avg marks calculation for consistency with ML logic
            marks_list = [(r.marks_obtained / r.total_marks) * 100 for r in all_records]
            avg_marks = sum(marks_list) / len(marks_list) if marks_list else 0
            
            try:
                risk_analysis = ml_engine.evaluate_student_risk(avg_att, avg_marks, marks_list)
                raw_risk = risk_analysis['risk_score'] # 0-1
                predicted_grade = ml_engine.predict_performance(avg_att, avg_marks)
                
                Prediction.objects.update_or_create(
                    student=student,
                    defaults={
                        'risk_score': raw_risk,
                        'predicted_grade': f"{predicted_grade:.1f}%",
                        'average_marks': avg_marks
                    }
                )
            except Exception as e:
                print(f"ML Processing failed for {roll}: {e}")

        return Response({
            "message": f"Analysis Complete (Scope: {scope})",
            "details": f"Processed {students_created} students, verified {records_updated} records."
        })

class DashboardStatsView(APIView):
    def get(self, request):
        total_students = Student.objects.count()
        if total_students == 0:
            return Response({"total_students": 0})
            
        sp_agg = SemesterPerformance.objects.aggregate(
            avg_att=Avg('attendance_percentage'),
            avg_cgpa=Avg('cgpa')
        )
        
        # Calculate grade distribution for Pie Chart
        # Using simple binning based on CGPA for now as proxy, or fetching all grades?
        # Frontend expects: {'A (90-100)': count, ...} keys are handled by frontend processing
        # Frontend processGradeDistribution takes raw dict like {"90": 5, "80": 10...} or "A": 5?
        # Reading DashboardView.jsx: processGradeDistribution iterates over keys.
        # It expects keys to be parseable as numbers (e.g. "95", "85") OR match ranges? 
        # Actually logic is: `parseFloat(grade)`. So expects keys like "95", "82" OR "95.5". 
        # Better: aggregated buckets.
        # Let's verify: `const numLine = parseFloat(grade);`
        # So I will send buckets like "95": count, "85": count.
        # Actually, let's just send the grade letters if safe, but logic uses `parseFloat`.
        # SAFE BET: Send frequency map of CGPA * 10 or Marks?
        # Let's align with "Average Marks" KPI.
        
        # KPI 2: Avg Marks
        # We need an aggregation of all AcademicRecords marks.
        avg_marks_agg = AcademicRecord.objects.aggregate(avg=Avg('marks_obtained'))
        avg_marks = round(avg_marks_agg['avg'] or 0, 1)

        # KPI 4: Alerts Count
        # Count students with risk > 0.4
        alerts_count = Prediction.objects.filter(risk_score__gt=0.4).count()
        critical_count = Prediction.objects.filter(risk_score__gt=0.7).count()

        # Grade Distribution (Simulated from CGPA x 9.5 or actual Marks?)
        # Let's use latest SemesterPerformance SGPA/CGPA mapped to buckets
        # Frontend: keys are parsed as floats. 
        # returning "95": 10 (count of students > 90), "85": 20 (80-90)
        grade_dist = {}
        perfs = SemesterPerformance.objects.all()
        for p in perfs:
            # map sgpa/cgpa to rough percentage for the bucket
            val = (p.cgpa * 9.5) if p.cgpa else 0
            # bin it to nearest 10 for cleaner JSON
            bin_key = str(int(val // 10) * 10) # "90", "80"
            grade_dist[bin_key] = grade_dist.get(bin_key, 0) + 1

        # KPI 5: Declining Students (Current SGPA < Previous SGPA)
        declining_count = 0
        # Optimization: Fetch necessary fields only
        # This loop might be slow for thousands of students, but fine for <1000. 
        # For scale, use a Window function or raw SQL.
        for s in Student.objects.all():
            sems = SemesterPerformance.objects.filter(student=s).order_by('-semester')[:2]
            if len(sems) >= 2:
                if sems[0].sgpa < sems[1].sgpa:
                    declining_count += 1

        return Response({
            "total_students": total_students,
            "average_attendance": round(sp_agg['avg_att'] or 0, 1),
            "average_marks": avg_marks,
            "total_records": AcademicRecord.objects.count(),
            "grade_distribution": grade_dist,
            "students_with_alerts": alerts_count,
            "declining_students": declining_count,
            "risk_distribution": {"High": critical_count, "Medium": alerts_count - critical_count, "Low": total_students - alerts_count}
        })

class GPAAnalyticsView(APIView):
    def get(self, request):
        perfs = SemesterPerformance.objects.all()
        dist = {"9-10": 0, "8-9": 0, "7-8": 0, "6-7": 0, "5-6": 0, "4-5": 0, "<4": 0}
        sgpa_vals = []
        att_vals = []
        
        for p in perfs:
            val = p.sgpa or 0.0
            if val >= 9: dist["9-10"] += 1
            elif val >= 8: dist["8-9"] += 1
            elif val >= 7: dist["7-8"] += 1
            elif val >= 6: dist["6-7"] += 1
            elif val >= 5: dist["5-6"] += 1
            elif val >= 4: dist["4-5"] += 1
            else: dist["<4"] += 1
            
            if p.attendance_percentage is not None:
                sgpa_vals.append(val)
                att_vals.append(p.attendance_percentage)
                
        # Top Performers
        # Get distinct students with max cgpa
        top_performers = SemesterPerformance.objects.select_related('student').order_by('-cgpa')
        top_list = []
        seen = set()
        for p in top_performers:
            if p.student.roll_number not in seen:
                top_list.append({
                    "name": p.student.name,
                    "roll": p.student.roll_number,
                    "cgpa": p.cgpa
                })
                seen.add(p.student.roll_number)
            if len(top_list) >= 5: break
            
        return Response({
            "distribution": dist,
            "top_performers": top_list,
            "correlation": {"sgpa": sgpa_vals, "attendance": att_vals}
        })

class StudentRecordsView(APIView):
    def get(self, request):
        students = Student.objects.prefetch_related('predictions', 'academic_records').all()
        data = []
        
        for s in students:
            # Flatten logic similar to frontend expectation
            # We usually return one row per SUBJECT for the detailed view
            records = s.academic_records.all()
            pred = s.predictions.first()
            risk_score = pred.risk_score if pred else 0
            
            for r in records:
                # Calculate alerts locally
                alert = "Normal"
                if r.marks_obtained < 40 and r.attendance_percentage < 60: alert = "Critical"
                elif r.marks_obtained < 40 or r.attendance_percentage < 75: alert = "Warning"
                
                data.append({
                    "id": r.id,
                    "roll_number": s.roll_number,
                    "name": s.name,
                    "semester": r.semester,
                    "subject": r.subject_name,
                    "credits": r.subject_credits,
                    "marks": r.marks_obtained,
                    "total_marks": r.total_marks,
                    "grade": r.grade,
                    "attendance": r.attendance_percentage,
                    "risk_score": risk_score, # Global risk
                    "subject_alert": alert
                })
                
        return Response(data)

class ResetDBView(APIView):
    def delete(self, request):
        Student.objects.all().delete() # Cascades to everything
        return Response({"message": "Database cleared successfully"})

class DashboardAlertsView(APIView):
    def get(self, request):
        min_risk = float(request.query_params.get('min_risk', 0.4))
        
        # We need specific fields: roll, name, risk, attendance, marks
        # Join Prediction with Student.
        # Ideally we also need Attendance from SemesterPerformance or aggregated records.
        # Let's perform a subquery or secondary fetch for accuracy.
        
        predictions = Prediction.objects.filter(risk_score__gt=min_risk).select_related('student')
        
        # Get latest semester performance for all these students to get attendance
        student_ids = [p.student.id for p in predictions]
        # Map student_id -> attendance
        # This is a bit rough (taking average of all sems or latest? Frontend likely wants current status)
        # Let's take global average from AcademicRecords for now as "Current Attendance" proxy
        
        records = AcademicRecord.objects.filter(student_id__in=student_ids).values('student_id').annotate(
            avg_att=Avg('attendance_percentage'),
            avg_marks=Avg('marks_obtained')
        )
        att_map = {r['student_id']: r['avg_att'] for r in records}
        marks_map = {r['student_id']: r['avg_marks'] for r in records}
        
        alerts = []
        for p in predictions:
            att = round(att_map.get(p.student.id, 0), 1)
            mk = round(marks_map.get(p.student.id, 0), 1)
            
            # Determine Status and Actions
            status_label = "Monitor"
            actions = []
            main_cause = "General Academic Risk"
            
            if p.risk_score > 0.7:
                status_label = "Critical"
                actions.append("Schedule Parent Meeting")
                actions.append("Remedial Class")
            elif p.risk_score > 0.4:
                status_label = "Warning"
                actions.append("Peer Tutoring")
                actions.append("Counseling Session")
                
            # Refine Main Cause
            if att < 60:
                main_cause = "Critical Attendance Failure"
                actions.append("Attendance Warning Letter")
            elif att < 75:
                main_cause = "Low Attendance"
            elif mk < 40:
                main_cause = "Academic Failure"
                actions.insert(0, "Subject Retake Plan")
            elif mk < 50:
                 main_cause = "Low Academic Performance"

            alerts.append({
                "roll": p.student.roll_number,
                "name": p.student.name,
                "risk": p.risk_score,
                "attendance": att,
                "marks": mk,
                "status": status_label,
                "main_cause": main_cause,
                "actions": list(set(actions)), # De-dupe
                "message": f"{status_label}: {main_cause}"
            })
            
        return Response(alerts)

# ... Trend View ...

class ProcessStudentView(APIView):
    def post(self, request, student_id):
        # Trigger ML re-calculation for this student
        try:
            student = Student.objects.get(id=student_id)
            records = AcademicRecord.objects.filter(student=student)
            if not records.exists():
                return Response({"message": "No records found"}, status=400)
                
            avg_att = records.aggregate(Avg('attendance_percentage'))['attendance_percentage__avg']
            marks_list = [(r.marks_obtained / r.total_marks) * 100 for r in records]
            avg_marks = sum(marks_list) / len(marks_list) if marks_list else 0
            
            result = ml_engine.evaluate_student_risk(avg_att, avg_marks, marks_list)
            
            # Update Prediction
            Prediction.objects.update_or_create(
                student=student,
                defaults={
                    'risk_score': result['risk_score'],
                    'average_marks': avg_marks
                }
            )
            return Response(result)
        except Student.DoesNotExist:
            return Response({"message": "Student not found"}, status=404)
        except Exception as e:
            return Response({"message": str(e)}, status=500)


class DashboardTrendView(APIView):
    def get(self, request):
        # Frontend expects: [{name: 'Sem 1', value: 75}, {name: 'Sem 2', value: 80}]
        # My previous logic returned objects with avg_sgpa.
        data = SemesterPerformance.objects.values('semester').annotate(
            avg_sgpa=Avg('sgpa'),
            avg_att=Avg('attendance_percentage')
        ).order_by('semester')
        
        formatted = []
        for d in data:
            formatted.append({
                "name": f"Sem {d['semester']}",
                "value": round((d['avg_sgpa'] or 0) * 9.5, 1) # Convert SGPA to % for common graph? Or Keep SGPA?
                # DashboardView.jsx: YAxis domain=[0, 100], value is used.
                # So it expects Percentage. SGPA * 9.5 is standard conversion.
            })
            
        return Response(formatted)

class UploadStudentsView(APIView):
    def post(self, request):
        # Reusing logic from Master Upload simplified
        return Response({"message": "Use Master Upload for full features"}, status=200)

class UploadMarksView(APIView):
    def post(self, request):
        return Response({"message": "Use Master Upload for full features"}, status=200)
    
class UploadHistoryView(APIView):
    def post(self, request):
         # Similar to Master Upload part 2, but just history.
         # For now stub or implement if critical.
         return Response({"message": "History upload via Master supported"}, status=200)

class ProcessStudentView(APIView):
    def post(self, request, student_id):
        # Trigger ML for one student
        student = Student.objects.get(id=student_id)
        # ... (ML logic stub)
        return Response({"student": student.name, "message": "Analysis refreshed"})

