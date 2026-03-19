from app.core.logging import logger


class AggregatorService:
    async def run_ingestion_cycle(self) -> dict[str, str]:
        logger.info("Aggregator ingestion cycle requested")
        return {"status": "queued"}

