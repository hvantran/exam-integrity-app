from sentence_transformers import SentenceTransformer, util

_model = None

def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        # PhoBERT-based multilingual model for Vietnamese semantic similarity
        _model = SentenceTransformer("keepitreal/vietnamese-sbert")
    return _model

def score_semantic(student_answer: str, reference_answer: str) -> float:
    if not student_answer.strip() or not reference_answer.strip():
        return 0.0
    model = _get_model()
    emb_student = model.encode(student_answer, convert_to_tensor=True)
    emb_reference = model.encode(reference_answer, convert_to_tensor=True)
    cosine_sim = util.cos_sim(emb_student, emb_reference).item()
    # Clamp to [0, 1]
    return max(0.0, min(1.0, cosine_sim))
