"""
Vietnamese exam question parser.

Handles the most common Vietnamese exam formats:

  Cau 1 (0,5 diem): Noi dung cau hoi
  A. Option A    B. Option B    C. Option C    D. Option D

  Cau 5 (2 diem):
  Bai toan tu luan dai...
"""
from __future__ import annotations
import re
from typing import List, Optional, Tuple

from app.models.schemas import ParsedExam, ParsedQuestion, QuestionType

# ---------------------------------------------------------------------------
# Compiled patterns
# ---------------------------------------------------------------------------

# Question header — "Cau 1:", "Cau 1 (0,5 diem):", "Câu 1:", "Bai 1:"
_Q_HEADER = re.compile(
    r"(?:^|\n)"
    r"\s*(?:[Cc][aâ][un]|[Bb][aà]i)\s+(\d+)"
    r"(?:"
    r"  \s*[:(]\s*([0-9]+[,.]?[0-9]*)\s*"
    r"  (?:[Dd]i[eể]m|diem|[Dd]i[eể]m|\bdd?\b|pts?)?\s*\)?"
    r")?"
    r"\s*[.:]?\s*",
    re.MULTILINE | re.VERBOSE,
)

# Inline point value anywhere in a question block: "(0,5 diem)" "(1 diem)" "(2d)"
_INLINE_PTS = re.compile(
    r"\(\s*([0-9]+[,.]?[0-9]*)\s*(?:[Dd]i[eể]m|diem|\bdd?\b|pts?)?\s*\)",
    re.IGNORECASE,
)

# Document-level total points
_DOC_TOTAL = re.compile(
    r"(?:t[oô]ng\s*(?:s[oô]\s*)?(?:[Dd]i[eể]m|diem)"
    r"|[Dd]i[eể]m\s+t[oô]i\s+[Dd][aá])"
    r"[:\s]+([0-9]+(?:[,.]?[0-9]+)?)",
    re.IGNORECASE,
)

# Duration
_DOC_DURATION = re.compile(
    r"th[oờ]i\s+gian[^:\n]*:[^\n]*?([0-9]+)\s*(?:ph[uú]t|phut|min)",
    re.IGNORECASE,
)

# Title: DE / ĐỀ / De KIEM TRA / THI (handles ASCII and Vietnamese diacritics)
_DOC_TITLE = re.compile(
    r"(?:^|\\n)([DdĐđ][Ee]\\s+(?:[Kk][Ii][Ee][Mm]\\s+[Tt][Rr][Aa]|[Tt][Hh][Ii])[^\\n]*)",
)

# Section separators
_SECTION = re.compile(
    r"(?:^|\n)\s*(?:[IVX]+|\d+)[.)\s]+(?:[Pp][Hh][Aâ][Nn]|[Pp][Hh][Aa][Nn])\s+([^\n]+)",
)

_ESSAY_KEYWORDS = re.compile(
    r"(?:[Tt][Ii]nh|[Gg]i[Aa][Ii]|[Vv]i[Ee]t|[Cc]hung|[Gg]i[Aa]i\s+th|"
    r"[Dd]i[Ee]n\s+v|[Ss][Aa][Pp]\s+x|[Kk][Ee]\s+l|[Dd][Aa][Tt]\s+t)",
)

LONG_ESSAY_CHARS = 200


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def parse_questions(text: str) -> ParsedExam:
    title = _extract_title(text)
    total_pts = _extract_total_points(text)
    duration = _extract_duration(text)
    section_map = _build_section_map(text)

    blocks = _split_into_question_blocks(text)

    questions: List[ParsedQuestion] = []
    doc_warnings: List[str] = []
    detected_sum = 0.0
    flagged = 0

    for q_num, block_text, inline_pts in blocks:
        pq, warn = _parse_block(q_num, block_text, inline_pts, section_map)
        questions.append(pq)
        doc_warnings.extend(warn)
        if pq.points is not None:
            detected_sum += pq.points
        if pq.parser_confidence < 0.85:
            flagged += 1

    if not questions:
        doc_warnings.append(
            "[PARSE WARNING] No questions detected. Check PDF format "
            "(expected 'Cau N:' or 'Câu N:' headers)."
        )

    has_mismatch = total_pts is not None and abs(detected_sum - total_pts) > 0.05
    if has_mismatch:
        doc_warnings.append(
            f"[POINT MISMATCH] Header total={total_pts}, "
            f"detected sum={detected_sum:.2f}"
        )

    return ParsedExam(
        title=title or "Parsed Exam",
        total_points=total_pts if total_pts is not None else detected_sum,
        detected_points_sum=round(detected_sum, 2),
        duration_seconds=duration * 60 if duration else 2700,
        questions=questions,
        has_point_mismatch=has_mismatch,
        data_warnings=doc_warnings,
        flagged_question_count=flagged,
    )


# ---------------------------------------------------------------------------
# MCQ helpers
# ---------------------------------------------------------------------------

def _extract_mcq_options(block_text: str) -> Optional[List[str]]:
    """
    Detect and extract A/B/C/D options from a question block.
    Handles both single-line and multi-line option layouts:

      Single-line:  A. 380  B. 381  C. 378  D. 377
      Single-line (missing delimiter on last option): A. 380  B. 381  C. 4860 D 4960
      Multi-line:
        A. Option A
        B. Option B
    """
    # Multi-line: each option starts on its own line (with . or ) delimiter)
    multi = re.findall(r"^\s*([A-D])[.)]\s*(.+?)\s*$", block_text, re.MULTILINE)
    if len(multi) >= 2:
        return [f"{letter}. {content.strip()}" for letter, content in multi]

    # Single-line: "A. ... B. ... C. ... D. ..."
    # Find the first line that has at least A. and B. (with any delimiter: . ) / space)
    for line in block_text.splitlines():
        if re.search(r"A[.)/ ].+B[.)/ ]", line):
            # Split by " X." or " X)" or " X/" or " X " (space-only) where X is A-D.
            # The space-only split (?=[A-D]\s) is gated on being preceded by whitespace
            # and followed by a capital letter A-D then non-alpha content (digit or space).
            parts = re.split(r"(?<=\s)(?=[A-D][.)/ ])|(?<=\s)(?=[A-D](?=\s+\S))", line)
            opts = []
            for part in parts:
                m = re.match(r"([A-D])[.)/ ]\s*(.+)", part.strip())
                if not m:
                    # space-only delimiter: letter followed directly by content
                    m = re.match(r"([A-D])\s+(.+)", part.strip())
                if m:
                    opts.append(f"{m.group(1)}. {m.group(2).strip()}")
            if len(opts) >= 2:
                return _split_merged_options(opts)

    return None


def _split_merged_options(opts: List[str]) -> List[str]:
    """
    Fix merged options such as "C. 4860 D 4960" where D was not split because
    it had no punctuation delimiter.  Walk through each option text and check
    whether it ends with an embedded next-letter label.

    E.g.  opts = ["A. 4660", "B. 4760", "C. 4860 D 4960"]
          →     ["A. 4660", "B. 4760", "C. 4860", "D. 4960"]
    """
    result: List[str] = []
    expected_letters = list("ABCD")
    for opt in opts:
        if not opt or len(opt) < 2:
            result.append(opt)
            continue
        letter = opt[0]
        # Determine which letter should come next
        idx = expected_letters.index(letter) if letter in expected_letters else -1
        if idx == -1 or idx + 1 >= len(expected_letters):
            result.append(opt)
            continue
        next_letter = expected_letters[idx + 1]
        # Look for " D text" (or next_letter without delimiter) inside this option text
        # Require the embedded label to be preceded by whitespace and followed by
        # a non-whitespace character so we don't split mid-word.
        m = re.search(
            rf"\s+{re.escape(next_letter)}[.)/ ]\s*\S|\s+{re.escape(next_letter)}\s+\S",
            opt[2:],  # skip the "X. " prefix itself
        )
        if m:
            split_pos = 2 + m.start()  # offset back into full opt string
            content_before = opt[2:2 + m.start()].strip()
            tail = opt[2 + m.start():].strip()
            # tail is like "D 4960" or "D. 4960"
            m2 = re.match(rf"({re.escape(next_letter)})[.)/ ]\s*(.+)|({re.escape(next_letter)})\s+(.+)", tail)
            if m2:
                result.append(f"{letter}. {content_before}")
                found_letter = m2.group(1) or m2.group(3)
                found_content = (m2.group(2) or m2.group(4) or "").strip()
                result.append(f"{found_letter}. {found_content}")
                continue
        result.append(opt)
    return result


def _extract_stem(block_text: str, options: Optional[List[str]]) -> str:
    """Return just the question stem (text before the first MCQ option)."""
    if not options:
        return block_text.strip()

    # Find where the first option letter appears
    first_opt_letter = options[0][0]  # e.g. "A"
    # Pattern: standalone option marker at line start or after whitespace
    opt_start = re.search(
        rf"(?:^|\n|\s)\s*{re.escape(first_opt_letter)}[.)]",
        block_text,
        re.MULTILINE,
    )
    if opt_start:
        stem = block_text[: opt_start.start()].strip()
        return stem if stem else block_text.strip()

    return block_text.strip()


# ---------------------------------------------------------------------------
# Document-level helpers
# ---------------------------------------------------------------------------

def _extract_title(text: str) -> Optional[str]:
    m = _DOC_TITLE.search(text)
    return m.group(1).strip() if m else None


def _extract_total_points(text: str) -> Optional[float]:
    m = _DOC_TOTAL.search(text)
    return float(m.group(1).replace(",", ".")) if m else None


def _extract_duration(text: str) -> Optional[int]:
    m = _DOC_DURATION.search(text)
    return int(m.group(1)) if m else None


def _build_section_map(text: str) -> dict[int, str]:
    """Map question numbers to their section name (TRAC NGHIEM / TU LUAN)."""
    sections: List[Tuple[int, str]] = []
    for m in _SECTION.finditer(text):
        after = text[m.end():]
        qm = _Q_HEADER.search(after)
        if qm:
            try:
                sections.append((int(qm.group(1)), m.group(1).strip().upper()))
            except (ValueError, IndexError):
                pass
    result: dict[int, str] = {}
    for i, (q_start, name) in enumerate(sections):
        q_end = sections[i + 1][0] if i + 1 < len(sections) else 9999
        for q in range(q_start, q_end):
            result[q] = name
    return result


def _split_into_question_blocks(
    text: str,
) -> List[Tuple[int, str, Optional[float]]]:
    matches = list(_Q_HEADER.finditer(text))
    if not matches:
        return []

    blocks: List[Tuple[int, str, Optional[float]]] = []
    for i, m in enumerate(matches):
        try:
            q_num = int(m.group(1))
        except (ValueError, TypeError):
            continue

        inline_pts_str = m.group(2) if m.lastindex and m.lastindex >= 2 else None
        inline_pts = (
            float(inline_pts_str.replace(",", ".")) if inline_pts_str else None
        )

        block_start = m.end()
        block_end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        block_text = text[block_start:block_end].strip()
        blocks.append((q_num, block_text, inline_pts))

    return blocks


# ---------------------------------------------------------------------------
# Block parser
# ---------------------------------------------------------------------------

def _parse_block(
    q_num: int,
    block_text: str,
    inline_pts: Optional[float],
    section_map: dict[int, str],
) -> Tuple[ParsedQuestion, List[str]]:
    warnings: List[str] = []
    confidence = 1.0

    # ── point value ──────────────────────────────────────────────────────
    points = inline_pts
    if points is None:
        pts_m = _INLINE_PTS.search(block_text)
        if pts_m:
            points = float(pts_m.group(1).replace(",", "."))
    if points is None:
        warnings.append(f"[Q{q_num}] Point value not found")
        confidence -= 0.20

    # ── MCQ detection ────────────────────────────────────────────────────
    options = _extract_mcq_options(block_text)
    is_mcq = options is not None and len(options) >= 2

    if is_mcq:
        q_type = QuestionType.MCQ
        if len(options) < 4:
            warnings.append(f"[Q{q_num}] Only {len(options)} MCQ options detected (expected 4)")
            confidence -= 0.15
    else:
        section = section_map.get(q_num, "")
        in_essay_section = any(k in section for k in ("LU", "LUAN", "LUAN"))
        has_essay_kw = bool(_ESSAY_KEYWORDS.search(block_text))
        if in_essay_section or has_essay_kw or len(block_text) > LONG_ESSAY_CHARS:
            q_type = (
                QuestionType.ESSAY_LONG
                if len(block_text) > LONG_ESSAY_CHARS
                else QuestionType.ESSAY_SHORT
            )
        else:
            q_type = QuestionType.ESSAY_SHORT
            confidence -= 0.10
        options = None

    # ── stem extraction ───────────────────────────────────────────────────
    stem = _extract_stem(block_text, options)
    # Strip point declarations from stem
    stem = _INLINE_PTS.sub("", stem).strip()
    stem = re.sub(r"\s{2,}", " ", stem)

    if not stem:
        warnings.append(f"[Q{q_num}] Empty question stem after cleanup")
        confidence -= 0.30

    return ParsedQuestion(
        question_number=q_num,
        content=stem or block_text[:200],
        raw_text=block_text,
        question_type=q_type,
        points=points,
        options=options,
        parser_confidence=max(round(confidence, 2), 0.0),
        warnings=warnings,
    ), warnings
