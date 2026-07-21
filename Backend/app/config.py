"""Central settings, read once from the environment at import time.

Kept as a plain class with class-level defaults (not pydantic-settings) to
avoid one more dependency for what's a handful of values — swap this for
pydantic BaseSettings if the list grows much past this.
"""
import os

from dotenv import load_dotenv

load_dotenv()


def _require(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


class Settings:
    DATABASE_URL: str = _require("DATABASE_URL")

    JWT_SECRET: str = os.environ.get("JWT_SECRET", "dev-insecure-secret-change-me")
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    PHONE_HASH_PEPPER: str = os.environ.get("PHONE_HASH_PEPPER", "dev-insecure-pepper-change-me")

    OTP_LENGTH: int = 6
    OTP_EXPIRY_MINUTES: int = 5
    OTP_MAX_VERIFY_ATTEMPTS: int = 5
    OTP_MAX_REQUESTS_PER_HOUR: int = 5
    OTP_RESEND_COOLDOWN_SECONDS: int = 30

    SMS_PROVIDER: str = os.environ.get("SMS_PROVIDER", "console")
    MSG91_API_KEY: str | None = os.environ.get("MSG91_API_KEY") or None
    MSG91_SENDER_ID: str | None = os.environ.get("MSG91_SENDER_ID") or None
    TWILIO_ACCOUNT_SID: str | None = os.environ.get("TWILIO_ACCOUNT_SID") or None
    TWILIO_AUTH_TOKEN: str | None = os.environ.get("TWILIO_AUTH_TOKEN") or None
    TWILIO_FROM_NUMBER: str | None = os.environ.get("TWILIO_FROM_NUMBER") or None

    # Chat phrasing — see ai_service.py. Same env var names as the root
    # .env, so a copy-paste of GEMINI_API_KEY works in both places without
    # renaming anything.
    GEMINI_API_KEY: str | None = os.environ.get("GEMINI_API_KEY") or None
    AI_DEFAULT_MODEL: str = os.environ.get("AI_DEFAULT_MODEL", "gemini/gemini-2.5-flash").replace("gemini/", "")
    AI_MAX_RESPONSE_TOKENS: int = int(os.environ.get("AI_MAX_RESPONSE_TOKENS", "1000"))


settings = Settings()
