import pdfplumber
import io

TEXT_COVERAGE_THRESHOLD = 0.80


def detect_pdf_type(pdf_bytes: bytes) -> str:
    """Classify PDF as 'text', 'scanned', or 'hybrid'."""
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        total = len(pdf.pages)
        if total == 0:
            return "text"
        text_pages = sum(
            1 for page in pdf.pages
            if page.extract_text() and len(page.extract_text().strip()) > 20
        )
    coverage = text_pages / total
    if coverage >= TEXT_COVERAGE_THRESHOLD:
        return "text"
    if coverage == 0:
        return "scanned"
    return "hybrid"
