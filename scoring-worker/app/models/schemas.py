from pydantic import BaseModel
from typing import Optional

class ScoringRequest(BaseModel):
    session_id: str
    question_id: str
    student_answer: str
    rubric_json: str
    max_points: float

class ScoreBreakdown(BaseModel):
    keyword_score: float       # 0-1, weight 35%
    steps_score: float         # 0-1, weight 25%
    final_answer_score: float  # 0-1, weight 20%
    semantic_score: float      # 0-1, weight 15%
    format_score: float        # 0-1, weight 5%
    total_earned: float
    status: str

class ScoringResult(BaseModel):
    session_id: str
    question_id: str
    earned_points: float
    score_status: str
    score_breakdown_json: str
