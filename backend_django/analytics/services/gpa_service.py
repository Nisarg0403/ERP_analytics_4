class GPAService:
    @staticmethod
    def calculate_grade_point(marks_obtained: float, total_marks: float) -> tuple[str, int]:
        percentage = (marks_obtained / total_marks) * 100
        
        if percentage >= 90: return 'O', 10
        elif percentage >= 80: return 'A+', 9
        elif percentage >= 70: return 'A', 8
        elif percentage >= 60: return 'B+', 7
        elif percentage >= 50: return 'B', 6
        elif percentage >= 45: return 'C', 5
        elif percentage >= 40: return 'P', 4
        else: return 'F', 0
