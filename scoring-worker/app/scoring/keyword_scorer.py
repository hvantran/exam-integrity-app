"""
PY-04: keyword_scorer — Vietnamese partial credit scoring.
Improvements over baseline:
- Unicode normalization (unidecode) for diacritic-insensitive matching
- Substring / token matching for morphological variants
- Partial credit per keyword (not binary hit/miss)
"""
import re
import unicodedata
from typing import List


def _normalize(text: str) -> str:
    """
    Normalize Vietnamese text for matching:
    1. NFC normalization
    2. Lower-case
    3. Collapse whitespace
    """
    text = unicodedata.normalize("NFC", text)
    text = text.lower()
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _remove_diacritics(text: str) -> str:
    """Strip all combining diacritic marks (tone marks, etc.)."""
    nfd = unicodedata.normalize("NFD", text)
    return "".join(ch for ch in nfd if unicodedata.category(ch) != "Mn")


def _keyword_score(student_norm: str, student_nodiac: str, kw: str) -> float:
    """
    Return a per-keyword score in [0, 1].
    0.0  — keyword not found at all
    0.5  — found only after stripping diacritics (partial match)
    1.0  — exact normalized match
    """
    kw_norm = _normalize(kw)
    if not kw_norm:
        return 1.0

    # Full normalized match (exact or substring)
    if kw_norm in student_norm:
        return 1.0

    # Token-level match: every token in the keyword appears in student text
    kw_tokens = kw_norm.split()
    student_tokens = set(student_norm.split())
    if all(tok in student_tokens for tok in kw_tokens):
        return 1.0

    # Diacritic-insensitive fallback
    kw_nodiac = _remove_diacritics(kw_norm)
    if kw_nodiac and kw_nodiac in student_nodiac:
        return 0.5

    return 0.0


def score_keywords(student_answer: str, keywords: List[str]) -> float:
    """
    Return weighted keyword score in [0, 1].
    Each keyword contributes equally; partial credit applies.
    """
    if not keywords:
        return 1.0
    if not student_answer or not student_answer.strip():
        return 0.0

    student_norm   = _normalize(student_answer)
    student_nodiac = _remove_diacritics(student_norm)

    total = sum(_keyword_score(student_norm, student_nodiac, kw) for kw in keywords)
    return total / len(keywords)
