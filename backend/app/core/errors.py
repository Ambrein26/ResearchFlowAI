import logging

from fastapi import HTTPException


logger = logging.getLogger(__name__)


def ai_service_exception(operation: str, error: Exception) -> HTTPException:
    logger.exception("%s failed", operation, exc_info=error)

    status_code = getattr(error, "status_code", None)
    provider_code = getattr(error, "code", None)
    provider_status = str(getattr(error, "status", ""))

    if status_code == 429 or provider_code == 429 or "RESOURCE_EXHAUSTED" in provider_status:
        return HTTPException(
            status_code=429,
            detail="The AI service is rate-limited. Please try again shortly."
        )

    return HTTPException(
        status_code=502,
        detail=f"{operation} is temporarily unavailable. Please try again."
    )
