from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    service_name: str = "pdf-ingestion-service"
    # Set to True in production when PaddleOCR is installed
    ocr_enabled: bool = False
    kafka_bootstrap_servers: str = "localhost:9092"
    kafka_topic_exam_ingested: str = "exam.ingested"

    class Config:
        env_file = ".env"


settings = Settings()
