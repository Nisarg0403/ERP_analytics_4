import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression, LinearRegression
# from sklearn.model_selection import train_test_split # Not used yet
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
import os

# Ensure NLTK data is available
try:
    nltk.data.find('vader_lexicon')
except LookupError:
    nltk.download('vader_lexicon', quiet=True)

class MLService:
    # ---------------------------------------------------------
    # Risk Configuration (Thresholds)
    # ---------------------------------------------------------
    RISK_CONFIG = {
        "attendance_threshold": 70.0,
        "marks_threshold": 50.0,
        "subject_critical_marks": 40.0,
        "subject_critical_attendance": 60.0,
        "subject_warning_marks": 50.0,
        "subject_warning_attendance": 65.0
    }

    def __init__(self):
        # Placeholders for future Phase-2 (ML)
        self.risk_model = LogisticRegression()
        self.performance_model = LinearRegression()
        self.sia = SentimentIntensityAnalyzer()
        self.is_trained = False

    # ---------------------------------------------------------
    # Phase-1: Heuristic Rule-Based Risk Engine (Two-Layer Model)
    # ---------------------------------------------------------

    def attendance_risk(self, avg_attendance: float) -> float:
        """Risk from low attendance (Global). Stricter tuning."""
        threshold = 75.0 # Warning starts at 75%
        if avg_attendance >= threshold:
            return 0.0
        return min(100.0, ((threshold - avg_attendance) / threshold) * 250)

    def performance_risk(self, avg_marks: float) -> float:
        """Risk from low marks (Global)."""
        threshold = 60.0 # Warning starts at 60%
        if avg_marks >= threshold:
            return 0.0
        return min(100.0, ((threshold - avg_marks) / threshold) * 200)

    def trend_risk(self, marks_list: list) -> float:
        """Risk from declining trend"""
        if len(marks_list) < 2:
            return 0
        previous_avg = sum(marks_list[:-1]) / (len(marks_list) - 1)
        if marks_list[-1] < previous_avg:
             diff = previous_avg - marks_list[-1]
             return min(100, diff * 5)
        return 0

    def overall_risk(self, att_risk, perf_risk, trend_risk) -> float:
        w_avg = (0.4 * att_risk + 0.5 * perf_risk + 0.1 * trend_risk)
        max_factor = max(att_risk, perf_risk)
        if max_factor > 70:
            return max(w_avg, max_factor * 0.9)
        return w_avg

    def risk_level(self, score: float) -> str:
        if score <= 20: return "Low"
        elif score <= 40: return "Medium"
        elif score <= 70: return "High"
        else: return "Critical"

    def evaluate_student_risk(self, avg_attendance: float, avg_marks: float, marks_list: list) -> dict:
        ar = self.attendance_risk(avg_attendance)
        pr = self.performance_risk(avg_marks)
        tr = self.trend_risk(marks_list)
        score = self.overall_risk(ar, pr, tr)
        
        return {
            "avg_attendance": round(avg_attendance, 2),
            "avg_marks": round(avg_marks, 2),
            "risk_score": round(score / 100.0, 2), # 0-1 Normalized
            "risk_level": self.risk_level(score),
            "contributors": {
                "attendance": round(ar, 2),
                "performance": round(pr, 2),
                "trend": round(tr, 2)
            }
        }

    def evaluate_subject_risk(self, marks: float, attendance: float) -> str:
        if marks < 40 and attendance < 60: return "Critical"
        elif marks < 40 or attendance < 75: return "Warning"
        else: return "Normal"

    def predict_performance(self, attendance: float, internal_marks: float) -> float:
        return (attendance * 0.3) + (internal_marks * 0.7)

    def analyze_sentiment(self, text: str) -> dict:
        scores = self.sia.polarity_scores(text)
        compound = scores['compound']
        sentiment = "Positive" if compound >= 0.05 else "Negative" if compound <= -0.05 else "Neutral"
        return {"score": compound, "sentiment": sentiment, "breakdown": scores}

ml_engine = MLService()
