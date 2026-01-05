from django.urls import path
from .views import (
    UploadMasterView, 
    UploadStudentsView,
    UploadMarksView,
    UploadHistoryView,
    DashboardStatsView,
    DashboardAlertsView, 
    DashboardTrendView,
    GPAAnalyticsView, 
    ProcessStudentView,
    StudentRecordsView,
    ResetDBView
)

urlpatterns = [
    path('upload/master', UploadMasterView.as_view(), name='upload_master'),
    path('upload/students', UploadStudentsView.as_view(), name='upload_students'),
    path('upload/marks', UploadMarksView.as_view(), name='upload_marks'),
    path('upload/history', UploadHistoryView.as_view(), name='upload_history'),
    
    path('dashboard/stats', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('dashboard/alerts', DashboardAlertsView.as_view(), name='dashboard_alerts'),
    path('dashboard/trend', DashboardTrendView.as_view(), name='dashboard_trend'),
    
    path('analytics/gpa', GPAAnalyticsView.as_view(), name='gpa_analytics'),
    path('analytics/process/<int:student_id>', ProcessStudentView.as_view(), name='process_student'),
    
    path('students/records', StudentRecordsView.as_view(), name='student_records'),
    path('reset', ResetDBView.as_view(), name='reset_db'),
]
