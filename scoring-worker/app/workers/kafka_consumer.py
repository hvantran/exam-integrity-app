import json
import asyncio
from confluent_kafka import Consumer, Producer, KafkaError
from app.scoring.essay_scorer import score_essay
from app.models.schemas import ScoringRequest, ScoringResult
from app.core.config import settings

CONSUMER_CONFIG = {
    "bootstrap.servers": settings.kafka_bootstrap_servers,
    "group.id": "scoring-worker",
    "auto.offset.reset": "earliest",
}

PRODUCER_CONFIG = {
    "bootstrap.servers": settings.kafka_bootstrap_servers,
}


def _delivery_report(err, msg):
    if err:
        print(f"[Producer] delivery failed: {err}")


async def start_consumer():
    consumer = Consumer(CONSUMER_CONFIG)
    producer = Producer(PRODUCER_CONFIG)
    consumer.subscribe([settings.kafka_topic_scoring_request])
    print(f"Scoring worker listening on {settings.kafka_topic_scoring_request}")
    try:
        while True:
            msg = consumer.poll(1.0)
            if msg is None:
                producer.poll(0)
                await asyncio.sleep(0.1)
                continue
            if msg.error():
                if msg.error().code() != KafkaError._PARTITION_EOF:
                    print(f"Kafka error: {msg.error()}")
                continue

            payload = json.loads(msg.value().decode("utf-8"))
            request = ScoringRequest(**payload)
            result: ScoringResult = score_essay(request)

            # PY-07: Publish result to scoring.result topic
            result_payload = json.dumps(result.dict()).encode("utf-8")
            producer.produce(
                topic=settings.kafka_topic_scoring_result,
                key=result.session_id,
                value=result_payload,
                callback=_delivery_report,
            )
            producer.poll(0)
            print(f"Published scoring.result session={result.session_id} q={result.question_id} pts={result.earned_points}")
    finally:
        producer.flush()
        consumer.close()
