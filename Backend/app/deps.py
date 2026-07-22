"""Shared FastAPI dependencies. Currently just the Bearer-token -> user_id
resolver used by every router that owns per-user data (transactions, goals,
consents) — factored out once a third router needed the identical check.
"""
import uuid

from fastapi import Header, HTTPException

from .security import InvalidTokenError, decode_token


def get_current_user_id(authorization: str = Header(default="")) -> uuid.UUID:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="missing bearer token")
    try:
        payload = decode_token(authorization.removeprefix("Bearer "), expected_type="access")
        return uuid.UUID(payload["sub"])
    except (InvalidTokenError, KeyError, ValueError) as exc:
        raise HTTPException(status_code=401, detail="invalid token") from exc
