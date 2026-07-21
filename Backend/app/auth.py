"""HTTP layer — thin translation from otp_service's result dataclasses to
JSON responses. No business logic lives here.
"""
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from . import otp_service
from .database import get_db
from .schemas import OtpRequestBody, OtpVerifyBody, RefreshBody

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/otp/request")
def request_otp(body: OtpRequestBody, db: Session = Depends(get_db)):
    result = otp_service.request_otp(db, body.phone)
    if result.ok:
        return {"ok": True, "cooldown_seconds": result.cooldown_seconds}
    if result.error == "invalid_phone":
        return JSONResponse(status_code=400, content={"ok": False, "error": "invalid_phone"})
    if result.error == "rate_limited":
        return JSONResponse(
            status_code=429,
            content={"ok": False, "error": "rate_limited", "retry_after_seconds": result.retry_after_seconds},
        )
    return JSONResponse(status_code=502, content={"ok": False, "error": "unknown", "message": result.message})


@router.post("/otp/verify")
def verify_otp(body: OtpVerifyBody, db: Session = Depends(get_db)):
    result = otp_service.verify_otp(db, body.phone, body.code)
    if result.ok:
        return {
            "ok": True,
            "user_id": result.user_id,
            "access_token": result.access_token,
            "refresh_token": result.refresh_token,
        }
    if result.error in ("invalid_code", "expired_code"):
        return JSONResponse(status_code=400, content={"ok": False, "error": result.error, "message": result.message})
    return JSONResponse(status_code=404, content={"ok": False, "error": "unknown", "message": result.message})


@router.post("/refresh")
def refresh(body: RefreshBody):
    result = otp_service.refresh_tokens(body.refresh_token)
    if result.ok:
        return {"ok": True, "access_token": result.access_token, "refresh_token": result.refresh_token}
    return JSONResponse(status_code=401, content={"ok": False, "error": result.error})
