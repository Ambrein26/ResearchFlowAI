import uuid

from fastapi import HTTPException


def normalize_uuid(value: str, resource_name: str) -> str:
    try:
        return str(uuid.UUID(str(value)))
    except (ValueError, TypeError, AttributeError):
        raise HTTPException(
            status_code=404,
            detail=f"{resource_name} not found."
        )
