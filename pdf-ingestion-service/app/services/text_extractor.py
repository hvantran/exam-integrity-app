from __future__ import annotations
import pdfplumber
import io
from typing import Optional


def extract_text(pdf_bytes: bytes, fallback_ocr: bool = False) -> str:
    """
    Extract text from a text-based (or hybrid) PDF using pdfplumber.
    In hybrid mode each page is tried for text; pages with no text are
    skipped (in POC mode OCR is not applied).
    Returns a single string with pages separated by a form-feed marker.
    """
    pages_text: list[str] = []
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page_num, page in enumerate(pdf.pages, start=1):
            text = page.extract_text()
            if text and len(text.strip()) > 20:
                pages_text.append(f"[PAGE:{page_num}]\n{text.strip()}")
            else:
                # In POC we skip OCR; in production fallback_ocr triggers PaddleOCR
                if fallback_ocr:
                    pages_text.append(
                        f"[PAGE:{page_num}]\n[OCR_REQUIRED]"
                    )
    return "\n\n".join(pages_text)
