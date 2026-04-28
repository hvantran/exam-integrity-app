"""
FastAPI routes for the PDF ingestion service.

Endpoints:
  POST /upload        — full pipeline (text PDF + optional OCR)
  POST /parse-preview — POC step-by-step walkthrough
  GET  /health        — liveness check
"""
from __future__ import annotations
import uuid
import traceback

from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.models.schemas import (
    ExtractionStep,
    IngestionResponse,
    ParsePreviewResponse,
)
from app.services.parser.exam_set_detector import detect_exam_sets
from app.services.parser.normalizer import normalize_text
from app.services.parser.question_parser import parse_questions
from app.services.pdf_detector import detect_pdf_type
from app.services.text_extractor import extract_text

router = APIRouter()


@router.post(
    "/upload",
    response_model=IngestionResponse,
    summary="Upload PDF and parse exam (full pipeline)",
    description=(
        "Detects PDF type, extracts text (OCR if needed), normalizes, "
        "detects exam sets, parses questions and returns a ParsedExam. "
        "Set OCR_ENABLED=true in environment to enable PaddleOCR for scanned PDFs."
    ),
)
async def upload_pdf(
    file: UploadFile = File(...),
    exam_set_index: int | None = Query(
        default=None,
        description="0-based index of the exam set to import. Required for multi-set PDFs.",
    ),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    pdf_type = detect_pdf_type(content)

    if pdf_type == "scanned" and not settings.ocr_enabled:
        raise HTTPException(
            status_code=422,
            detail=(
                "This PDF has no extractable text (scanned image). "
                "OCR is disabled in the current environment. "
                "Set OCR_ENABLED=true to enable PaddleOCR."
            ),
        )

    raw_text = extract_text(content, fallback_ocr=(pdf_type == "hybrid" and settings.ocr_enabled))
    normalized = normalize_text(raw_text)
    exam_sets = detect_exam_sets(normalized)

    if len(exam_sets) > 1 and exam_set_index is None:
        return IngestionResponse(
            job_id=str(uuid.uuid4()),
            status="MULTI_SET_DETECTED",
            message=(
                f"{len(exam_sets)} exam sets detected. "
                f"Re-call with ?exam_set_index=0..{len(exam_sets) - 1}"
            ),
            detected_set_count=len(exam_sets),
        )

    selected = exam_sets[exam_set_index or 0]
    parsed_exam = parse_questions(selected)
    parsed_exam.pdf_type = pdf_type
    parsed_exam.ocr_used = pdf_type != "text"

    return IngestionResponse(
        job_id=str(uuid.uuid4()),
        status="SUCCESS",
        message="Exam parsed successfully.",
        parsed_exam=parsed_exam,
        detected_set_count=len(exam_sets),
    )


@router.post(
    "/parse-preview",
    response_model=ParsePreviewResponse,
    summary="POC: step-by-step parse walkthrough",
    description=(
        "Shows every parsing stage so the developer/designer can verify the "
        "pipeline output before wiring the backend integration. "
        "Only works with text-based PDFs (no OCR required)."
    ),
)
async def parse_preview(
    file: UploadFile = File(...),
    exam_set_index: int | None = Query(default=None),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    content = await file.read()
    steps: list[ExtractionStep] = []
    error: str | None = None
    parsed_exam = None

    try:
        # Step 1: PDF type detection
        pdf_type = detect_pdf_type(content)
        steps.append(ExtractionStep(
            step="1_pdf_type_detection",
            description="Classify PDF as text / scanned / hybrid",
            result=f"pdf_type={pdf_type}",
        ))

        if pdf_type == "scanned":
            steps.append(ExtractionStep(
                step="2_text_extraction",
                description="Extract text",
                result="SKIPPED: scanned PDF — OCR not available in POC mode",
            ))
            return ParsePreviewResponse(
                filename=file.filename,
                pdf_type=pdf_type,
                detected_set_count=0,
                steps=steps,
                error="Scanned PDF requires OCR (not available in POC).",
            )

        # Step 2: Text extraction
        raw_text = extract_text(content)
        preview = raw_text[:600].replace("\n", " | ")
        steps.append(ExtractionStep(
            step="2_text_extraction",
            description="Extract raw text with pdfplumber (first 600 chars shown)",
            result=preview,
        ))

        # Step 3: Normalization
        normalized = normalize_text(raw_text)
        steps.append(ExtractionStep(
            step="3_normalization",
            description="Fix OCR artifacts, strip LaTeX, collapse whitespace",
            result=f"Length before={len(raw_text)} after={len(normalized)}",
        ))

        # Step 4: Exam set detection
        exam_sets = detect_exam_sets(normalized)
        steps.append(ExtractionStep(
            step="4_exam_set_detection",
            description="Detect MA DE / multi-set markers",
            result=f"sets_detected={len(exam_sets)}",
        ))

        selected = exam_sets[exam_set_index or 0]

        # Step 5: Question parsing
        parsed_exam = parse_questions(selected)
        q_summary = ", ".join(
            f"Q{q.question_number}({q.question_type.value} {q.points}đ conf={q.parser_confidence})"
            for q in parsed_exam.questions[:10]
        )
        steps.append(ExtractionStep(
            step="5_question_parsing",
            description="Split by Câu N headers, classify MCQ vs essay, extract points",
            result=(
                f"total={len(parsed_exam.questions)} flagged={parsed_exam.flagged_question_count} "
                f"mismatch={parsed_exam.has_point_mismatch} | {q_summary}"
            ),
        ))
        parsed_exam.pdf_type = pdf_type

    except Exception as exc:
        error = f"{type(exc).__name__}: {exc}"
        steps.append(ExtractionStep(
            step="ERROR",
            description="Unexpected error during parsing",
            result=traceback.format_exc()[-500:],
        ))

    return ParsePreviewResponse(
        filename=file.filename,
        pdf_type=pdf_type if "pdf_type" in dir() else "unknown",
        detected_set_count=len(exam_sets) if "exam_sets" in dir() else 0,
        steps=steps,
        parsed_exam=parsed_exam,
        error=error,
    )
