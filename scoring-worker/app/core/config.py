from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    service_name: str = "scoring-worker"
    kafka_bootstrap_servers: str = "localhost:9092"
    kafka_topic_scoring_request: str = "scoring.request"
    kafka_topic_scoring_result: str = "scoring.result"
    phobert_model: str = "vinai/phobert-base-v2"

    class Config:
        env_file = ".env"

settings = Settings()
