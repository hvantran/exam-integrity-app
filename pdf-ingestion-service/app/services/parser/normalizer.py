"""
Text normalizer for Vietnamese exam PDFs.
Handles common OCR artifacts and LaTeX remnants.
"""
import re

# Strip [PAGE:N] markers inserted by text_extractor
_PAGE_MARKER = re.compile(r"\[PAGE:\d+\]")

# Collapse excessive blank lines
_MULTI_BLANK = re.compile(r"\n{3,}")

# Normalize whitespace inside lines
_MULTI_SPACE = re.compile(r"[\t ]{2,}")

# Common OCR digit/letter confusions in Vietnamese
_OCR_FIXES = [
    (re.compile(r"(?<=[\d])O(?=[\d])"), "0"),   # digit O -> 0 between digits
    (re.compile(r"(?<=[\d])l(?=[\d])"), "1"),   # lowercase l -> 1 between digits
    (re.compile(r"\bI(?=[\d])"), "1"),            # capital I -> 1 before digit
]

# LaTeX command removal
_LATEX = re.compile(r"\\[a-zA-Z]+\b")

# URLs — http(s)://, www., and bare domain-like tokens
_URL = re.compile(
    r"https?://[^\s|,;\"')\]>]+"
    r"|www\.[a-zA-Z0-9\-]+(?:\.[a-zA-Z]{2,})+(?:/[^\s|,;\"')\]>]*)?"
    r"|[a-zA-Z0-9\-]+(?:\.[a-zA-Z]{2,}){1,3}/[^\s|,;\"')\]>]*",
    re.IGNORECASE,
)

# Contact / footer lines that contain email addresses or common footer keywords.
# Match the whole line so it can be dropped entirely.
_CONTACT_LINE = re.compile(
    r"^[^\n]*"
    r"(?:"
    r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"   # email
    r"|[Tt]rang\s+ch[uủ]"                                    # "Trang chủ"
    r"|[Tt]h[uư]\s+vi[eệ]n\s+t[aà]i\s+li[eệ]u"            # "Thư viện tài liệu"
    r"|[Kk]ho\s*[Dd]e\s*[Tt]hi"                              # "Kho De Thi"
    r")"
    r"[^\n]*$",
    re.MULTILINE,
)

# Separator characters left after URL/contact removal (|, –, —)
_LEFTOVER_SEP = re.compile(r"(?:^|\s)[|–—]+(?:\s|$)")


def normalize_text(raw: str) -> str:
    text = _PAGE_MARKER.sub("", raw)
    text = _LATEX.sub("", text)
    # Remove contact/footer lines first (they may contain URLs too)
    text = _CONTACT_LINE.sub("", text)
    # Remove remaining bare URLs
    text = _URL.sub("", text)
    # Clean up separator characters left on lines after removal
    text = _LEFTOVER_SEP.sub(" ", text)
    for pattern, replacement in _OCR_FIXES:
        text = pattern.sub(replacement, text)
    text = _MULTI_SPACE.sub(" ", text)
    text = _MULTI_BLANK.sub("\n\n", text)
    return text.strip()
