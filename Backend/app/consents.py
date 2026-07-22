"""DPDP-style consent audit trail, owned by this backend's direct Postgres
connection — same RLS-bypass reasoning as goals.py. Requires a Bearer
access token; the consent_type still matches the check constraint already
enforced on public.consents ('aa_linked' | 'sms_permission' | 'notifications').
"""
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from .database import get_db
from .deps import get_current_user_id
from .models import Consent

router = APIRouter(prefix="/consents", tags=["consents"])

VALID_CONSENT_TYPES = {"aa_linked", "sms_permission", "notifications"}


def _to_json(c: Consent) -> dict:
    return {
        "id": str(c.id),
        "consentType": c.consent_type,
        "grantedAt": c.granted_at.isoformat(),
        "revokedAt": c.revoked_at.isoformat() if c.revoked_at else None,
    }


class ConsentBody(BaseModel):
    consentType: str = Field(min_length=1, max_length=32)


@router.post("")
def log_consent(
    body: ConsentBody,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    if body.consentType not in VALID_CONSENT_TYPES:
        raise HTTPException(status_code=400, detail="invalid consent type")
    consent = Consent(
        user_id=user_id,
        consent_type=body.consentType,
        granted_at=datetime.now(timezone.utc),
    )
    db.add(consent)
    db.commit()
    db.refresh(consent)
    return {"ok": True, "consent": _to_json(consent)}


@router.post("/{consent_type}/revoke")
def revoke_consent(
    consent_type: str,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    db.execute(
        update(Consent)
        .where(Consent.user_id == user_id, Consent.consent_type == consent_type, Consent.revoked_at.is_(None))
        .values(revoked_at=datetime.now(timezone.utc))
    )
    db.commit()
    return {"ok": True}


@router.get("")
def list_consents(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    rows = db.execute(
        select(Consent).where(Consent.user_id == user_id).order_by(Consent.granted_at.desc())
    ).scalars()
    return {"ok": True, "consents": [_to_json(c) for c in rows]}
