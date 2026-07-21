"""OTP generation/hashing, phone hashing, and JWT issuance — the only file
that should ever import argon2 or jwt directly. Nothing here does its own
database or HTTP work; otp_service.py orchestrates, this file just does the
cryptographic primitives.
"""
import hashlib
import secrets
import time
import uuid

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

from .config import settings

_hasher = PasswordHasher()


def generate_otp() -> str:
    """Cryptographically secure, uniform 6-digit code — secrets.choice, not
    random.randint, so there's no modulo bias and it can't be seeded/predicted."""
    digits = "0123456789"
    return "".join(secrets.choice(digits) for _ in range(settings.OTP_LENGTH))


def hash_otp(code: str) -> str:
    return _hasher.hash(code)


def verify_otp_hash(code: str, stored_hash: str) -> bool:
    try:
        return _hasher.verify(stored_hash, code)
    except VerifyMismatchError:
        return False
    except Exception:
        # Any other argon2 error (corrupt hash, wrong format) is a mismatch,
        # not a 500 — never let a malformed row crash a verify request.
        return False


def hash_phone(phone_e164: str) -> str:
    """Same salted-hash approach as public.users.phone_hash on the Postgres
    side (see supabase/migrations/0001_init.sql) — never store the raw
    phone number, but keep it possible to look up "have I seen this number
    before" via equality on the hash."""
    salted = f"{phone_e164}{settings.PHONE_HASH_PEPPER}"
    return hashlib.sha256(salted.encode("utf-8")).hexdigest()


def _encode(user_id: str, token_type: str, expires_in_seconds: int) -> str:
    now = int(time.time())
    payload = {
        "sub": user_id,
        "type": token_type,
        "iat": now,
        "exp": now + expires_in_seconds,
        "jti": str(uuid.uuid4()),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_access_token(user_id: str) -> str:
    return _encode(user_id, "access", settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60)


def create_refresh_token(user_id: str) -> str:
    return _encode(user_id, "refresh", settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60)


class InvalidTokenError(Exception):
    pass


def decode_token(token: str, expected_type: str) -> dict:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except jwt.PyJWTError as exc:
        raise InvalidTokenError(str(exc)) from exc
    if payload.get("type") != expected_type:
        raise InvalidTokenError(f"expected a {expected_type} token, got {payload.get('type')}")
    return payload
