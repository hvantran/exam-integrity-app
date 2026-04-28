from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class QuestionType(str, Enum):
    MCQ = "MCQ"
    ESSAY_SHORT = "ESSAY_SHORT"
    ESSAY_LONG = "ESSAY_LONG"


class BoundingBox(BaseModel):
    page_number: int
    x1: float
    y1: float
    x2: float
    y2: float


class ParsedQuestion(BaseModel):
    question_number: int
    content: str
    raw_text: Optional[str] = None
    question_type: QuestionType
    points: Optional[float] = None
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None
    sub_questions: Optional[List[str]] = None
    is_truncated: bool = False
    ocr_confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    parser_confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    page_number: Optional[int] = None
    bounding_box: Optional[BoundingBox] = None
    warnings: List[str] = Field(default_factory=list)


class ParsedExam(BaseModel):
    title: str
    total_points: float
    detected_points_sum: float
    duration_seconds: int = 2700
    questions: List[ParsedQuestion]
    has_point_mismatch: bool = False
    exam_set_index: Optional[int] = None
    pdf_type: str = "text"
    ocr_used: bool = False
    document_ocr_confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    data_warnings: List[str] = Field(default_factory=list)
    flagged_question_count: int = 0


class IngestionResponse(BaseModel):
    job_id: str
    status: str
    message: str
    parsed_exam: Optional[ParsedExam] = None
    detected_set_count: Optional[int] = None


# ── POC: step-by-step preview response ────────────────────────────────────
class ExtractionStep(BaseModel):
    step: str
    description: str
    result: str


class ParsePreviewResponse(BaseModel):
    filename: str
    pdf_type: str
    detected_set_count: int
    steps: List[ExtractionStep]
    parsed_exam: Optional[ParsedExam] = None
    error: Optional[str] = None
