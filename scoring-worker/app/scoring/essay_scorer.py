import json
from app.models.schemas import ScoringRequest, ScoringResult, ScoreBreakdown
from app.scoring.keyword_scorer import score_keywords
from app.scoring.semantic_scorer import score_semantic
from app.scoring.aggregator import aggregate

def score_essay(request: ScoringRequest) -> ScoringResult:
    rubric = json.loads(request.rubric_json) if request.rubric_json else {}
    keywords = rubric.get("keywords", [])
    reference_answer = rubric.get("reference_answer", "")
    expected_steps = rubric.get("steps", [])

    keyword_sc  = score_keywords(request.student_answer, keywords)
    semantic_sc = score_semantic(request.student_answer, reference_answer) if reference_answer else 0.5
    steps_sc    = _score_steps(request.student_answer, expected_steps)
    final_sc    = _score_final_answer(request.student_answer, rubric)
    format_sc   = _score_format(request.student_answer, rubric)

    breakdown: ScoreBreakdown = aggregate(
        keyword_score=keyword_sc,
        steps_score=steps_sc,
        final_answer_score=final_sc,
        semantic_score=semantic_sc,
        format_score=format_sc,
        max_points=request.max_points,
    )

    return ScoringResult(
        session_id=request.session_id,
        question_id=request.question_id,
        earned_points=breakdown.total_earned,
        score_status=breakdown.status,
        score_breakdown_json=breakdown.model_dump_json(),
    )

def _score_steps(answer: str, expected_steps: list) -> float:
    if not expected_steps:
        return 0.5
    hits = sum(1 for step in expected_steps if any(kw in answer.lower() for kw in step.get("keywords", [])))
    return hits / len(expected_steps)

def _score_final_answer(answer: str, rubric: dict) -> float:
    correct = rubric.get("correct_final_answer", "")
    if not correct:
        return 0.5
    return 1.0 if correct.lower() in answer.lower() else 0.0

def _score_format(answer: str, rubric: dict) -> float:
    format_rules = rubric.get("format_requirements", [])
    if not format_rules:
        return 1.0
    hits = sum(1 for rule in format_rules if rule.lower() in answer.lower())
    return hits / len(format_rules)
