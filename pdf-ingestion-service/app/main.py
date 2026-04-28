from fastapi import FastAPI
from app.api.routes import router
from app.core.config import settings

app = FastAPI(
    title="PDF Ingestion Service",
    description=(
        "OCR, question parsing and normalisation for the Exam Integrity Platform. "
        "## Quick start (POC)\n"
        "```\n"
        "pip install -r requirements-poc.txt\n"
        "uvicorn app.main:app --reload --port 8091\n"
        "```\n"
        "Then open **http://localhost:8091/docs** and use **POST /api/ingestion/parse-preview**.\n"
        "Upload any text-based Vietnamese exam PDF to see step-by-step parsing output."
    ),
    version="1.0.0",
    contact={"name": "hvantran"},
    docs_url="/docs",
    redoc_url="/redoc",
)

app.include_router(router, prefix="/api/ingestion", tags=["Ingestion"])


@app.get("/health", tags=["Health"])
def health():
    return {
        "status": "UP",
        "service": settings.service_name,
        "ocr_enabled": settings.ocr_enabled,
    }
