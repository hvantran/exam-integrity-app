from fastapi import FastAPI
from app.workers.kafka_consumer import start_consumer
import asyncio

app = FastAPI(
    title="Scoring Worker",
    description="Consumes scoring.request from Kafka, runs essay scoring, publishes scoring.result.",
    version="1.0.0",
)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(start_consumer())

@app.get("/health")
def health():
    return {"status": "UP", "service": "scoring-worker"}
