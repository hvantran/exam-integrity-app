from app.models.schemas import ScoreBreakdown

# Scoring weights per component (must sum to 1.0)
WEIGHTS = {
    "keyword":      0.35,
    "steps":        0.25,
    "final_answer": 0.20,
    "semantic":     0.15,
    "format":       0.05,
}

def aggregate(
    keyword_score: float,
    steps_score: float,
    final_answer_score: float,
    semantic_score: float,
    format_score: float,
    max_points: float,
) -> ScoreBreakdown:
    weighted = (
        keyword_score      * WEIGHTS["keyword"] +
        steps_score        * WEIGHTS["steps"] +
        final_answer_score * WEIGHTS["final_answer"] +
        semantic_score     * WEIGHTS["semantic"] +
        format_score       * WEIGHTS["format"]
    )
    earned = round(max_points * weighted, 2)

    if weighted >= 0.9:
        status = "CORRECT"
    elif weighted >= 0.5:
        status = "PARTIAL"
    else:
        status = "INCORRECT"

    return ScoreBreakdown(
        keyword_score=keyword_score,
        steps_score=steps_score,
        final_answer_score=final_answer_score,
        semantic_score=semantic_score,
        format_score=format_score,
        total_earned=earned,
        status=status,
    )
