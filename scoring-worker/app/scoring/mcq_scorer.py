from typing import Optional

def score_mcq(student_answer: Optional[str], correct_answer: str, max_points: float) -> tuple[float, str]:
    if not student_answer or not student_answer.strip():
        return 0.0, "INCORRECT"
    # Multiple answer guard: if comma-separated -> flag
    if "," in student_answer or len(student_answer.strip().split()) > 1:
        return 0.0, "MULTIPLE_ANSWERS_FLAG"
    if student_answer.strip().upper() == correct_answer.strip().upper():
        return max_points, "CORRECT"
    return 0.0, "INCORRECT"
