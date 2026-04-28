"""
Detects multiple exam sets in a single PDF.
Vietnamese PDFs often contain MA DE 101 / MA DE 102 / MA DE 201 etc.
"""
import re
from typing import List

_SET_MARKERS = re.compile(
    r"(?:(?:[Mm][Aa]|MA)\s*(?:[Dd][Ee]|DE)\s*[\d]{2,4})"
    r"|(?:[Dd][eEÊê]\s+(?:s[oO]|SO)\s*\d+)"
    r"|(?:[Dd][eEÊê]\s*[IVX]{1,4}\b)",
)


def detect_exam_sets(text: str) -> List[str]:
    """
    Split text by MA DE / De so / De I markers.
    Returns a list of text chunks (one per set).
    If no markers found, returns [text].
    """
    positions = [m.start() for m in _SET_MARKERS.finditer(text)]
    if len(positions) < 2:
        return [text]

    chunks: List[str] = []
    for i, pos in enumerate(positions):
        end = positions[i + 1] if i + 1 < len(positions) else len(text)
        chunk = text[pos:end].strip()
        if chunk and len(chunk) > 100:
            chunks.append(chunk)
    return chunks if chunks else [text]
