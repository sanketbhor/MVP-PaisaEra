"""Business logic for the OTP request/verify flow. Deliberately mirrors
the client's OtpSendResult/OtpVerifyResult discriminated-union shape (see
../../src/auth/types.ts) so the HTTP layer (auth.py) is a thin, boring
translation from these dataclasses to JSON.
"""
import re
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from .config import settings
from .models import OTPVerification, User
from .security import create_access_token, create_refresh_token, generate_otp, hash_otp, hash_phone, verify_otp_hash
from .sms import SmsDeliveryError, get_sms_provider

_INDIAN_MOBILE_RE = re.compile(r"^[6-9]\d{9}$")


def is_valid_indian_mobile(local_number: str) -> bool:
    digits = re.sub(r"\D", "", local_number)
    return bool(_INDIAN_MOBILE_RE.match(digits))


def normalize_phone(local_number: str) -> str:
    digits = re.sub(r"\D", "", local_number)
    return f"+91{digits}"


def _now() -> datetime:
    return datetime.now(timezone.utc)


@dataclass
class RequestOtpResult:
    ok: bool
    cooldown_seconds: int | None = None
    error: str | None = None  # 'invalid_phone' | 'rate_limited' | 'unknown'
    retry_after_seconds: int | None = None
    message: str | None = None


@dataclass
class VerifyOtpResult:
    ok: bool
    user_id: str | None = None
    access_token: str | None = None
    refresh_token: str | None = None
    error: str | None = None  # 'invalid_code' | 'expired_code' | 'unknown'
    message: str | None = None


def request_otp(db: Session, local_number: str) -> RequestOtpResult:
    if not is_valid_indian_mobile(local_number):
        return RequestOtpResult(ok=False, error="invalid_phone")

    phone = normalize_phone(local_number)
    phone_hash = hash_phone(phone)
    now = _now()
    window_start = now - timedelta(hours=1)

    recent = (
        db.execute(
            select(OTPVerification)
            .where(OTPVerification.phone_hash == phone_hash, OTPVerification.created_at >= window_start)
            .order_by(OTPVerification.created_at.desc())
        )
        .scalars()
        .all()
    )

    if recent:
        most_recent = recent[0]
        seconds_since_last = (now - most_recent.created_at).total_seconds()
        if seconds_since_last < settings.OTP_RESEND_COOLDOWN_SECONDS:
            retry_after = int(settings.OTP_RESEND_COOLDOWN_SECONDS - seconds_since_last)
            return RequestOtpResult(ok=False, error="rate_limited", retry_after_seconds=max(retry_after, 1))

    if len(recent) >= settings.OTP_MAX_REQUESTS_PER_HOUR:
        oldest_in_window = recent[-1]
        retry_after = int((oldest_in_window.created_at + timedelta(hours=1) - now).total_seconds())
        return RequestOtpResult(ok=False, error="rate_limited", retry_after_seconds=max(retry_after, 1))

    code = generate_otp()
    row = OTPVerification(
        phone_hash=phone_hash,
        otp_hash=hash_otp(code),
        expires_at=now + timedelta(minutes=settings.OTP_EXPIRY_MINUTES),
        attempt_count=0,
        created_at=now,
    )
    db.add(row)

    try:
        get_sms_provider().send(phone, code)
    except SmsDeliveryError as exc:
        db.rollback()
        return RequestOtpResult(ok=False, error="unknown", message=f"SMS delivery failed: {exc}")

    db.commit()
    return RequestOtpResult(ok=True, cooldown_seconds=settings.OTP_RESEND_COOLDOWN_SECONDS)


def verify_otp(db: Session, local_number: str, code: str) -> VerifyOtpResult:
    phone = normalize_phone(local_number)
    phone_hash = hash_phone(phone)
    now = _now()

    row = (
        db.execute(
            select(OTPVerification)
            .where(OTPVerification.phone_hash == phone_hash, OTPVerification.verified_at.is_(None))
            .order_by(OTPVerification.created_at.desc())
        )
        .scalars()
        .first()
    )

    if row is None:
        return VerifyOtpResult(ok=False, error="unknown", message="OTP kabhi bheja hi nahi gaya — pehle bhejo.")

    if row.expires_at < now:
        return VerifyOtpResult(ok=False, error="expired_code")

    if row.attempt_count >= settings.OTP_MAX_VERIFY_ATTEMPTS:
        return VerifyOtpResult(ok=False, error="expired_code", message="Bahut baar galat try — naya code mangwao.")

    row.attempt_count += 1
    db.add(row)

    if not verify_otp_hash(code, row.otp_hash):
        db.commit()
        return VerifyOtpResult(ok=False, error="invalid_code")

    row.verified_at = now
    db.add(row)

    user = db.execute(select(User).where(User.phone_hash == phone_hash)).scalars().first()
    if user is None:
        user = User(phone_hash=phone_hash, created_at=now)
        db.add(user)
        db.flush()  # populate user.id before issuing tokens

    db.commit()

    return VerifyOtpResult(
        ok=True,
        user_id=str(user.id),
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@dataclass
class RefreshResult:
    ok: bool
    access_token: str | None = None
    refresh_token: str | None = None
    error: str | None = None


def refresh_tokens(refresh_token: str) -> RefreshResult:
    from .security import InvalidTokenError, decode_token

    try:
        payload = decode_token(refresh_token, expected_type="refresh")
    except InvalidTokenError:
        return RefreshResult(ok=False, error="invalid_token")

    user_id = payload["sub"]
    return RefreshResult(
        ok=True,
        access_token=create_access_token(user_id),
        refresh_token=create_refresh_token(user_id),
    )
