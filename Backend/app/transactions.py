"""Per-user transaction storage for the on-device SMS parser.

The phone parses transaction SMS locally (raw SMS bodies never leave the
device), then uploads only the structured result — amount, type, merchant,
timestamp, and a dedupe hash. Requires a Bearer access token from /auth.
"""
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from .database import get_db
from .models import Transaction
from .security import InvalidTokenError, decode_token

router = APIRouter(prefix="/transactions", tags=["transactions"])

MAX_BULK_ITEMS = 2000


def get_current_user_id(authorization: str = Header(default="")) -> uuid.UUID:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="missing bearer token")
    try:
        payload = decode_token(authorization.removeprefix("Bearer "), expected_type="access")
        return uuid.UUID(payload["sub"])
    except (InvalidTokenError, KeyError, ValueError) as exc:
        raise HTTPException(status_code=401, detail="invalid token") from exc


class TransactionItem(BaseModel):
    amount: float = Field(gt=0)
    type: str = Field(pattern="^(debit|credit)$")
    merchant: str = Field(min_length=1, max_length=120)
    occurredAt: datetime
    smsHash: str = Field(min_length=1, max_length=64)


class BulkBody(BaseModel):
    transactions: list[TransactionItem] = Field(max_length=MAX_BULK_ITEMS)


@router.post("/bulk")
def upload_bulk(
    body: BulkBody,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    if not body.transactions:
        return {"ok": True, "inserted": 0}
    now = datetime.now(timezone.utc)
    rows = [
        {
            "user_id": user_id,
            "amount": item.amount,
            "type": item.type,
            "merchant": item.merchant.strip(),
            "occurred_at": item.occurredAt,
            "source": "sms",
            "sms_hash": item.smsHash,
            "created_at": now,
        }
        for item in body.transactions
    ]
    stmt = pg_insert(Transaction).values(rows).on_conflict_do_nothing(
        index_elements=["user_id", "sms_hash"],
        index_where=Transaction.sms_hash.isnot(None),
    )
    result = db.execute(stmt)
    db.commit()
    return {"ok": True, "inserted": result.rowcount}


@router.get("")
def list_transactions(
    days: int = 90,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    days = max(1, min(days, 365))
    since = datetime.now(timezone.utc) - timedelta(days=days)
    rows = db.execute(
        select(Transaction)
        .where(Transaction.user_id == user_id, Transaction.occurred_at >= since)
        .order_by(Transaction.occurred_at.desc())
    ).scalars()
    return {
        "ok": True,
        "transactions": [
            {
                "id": str(t.id),
                "amount": float(t.amount),
                "type": t.type,
                "merchant": t.merchant,
                "occurredAt": t.occurred_at.isoformat(),
                "source": t.source,
            }
            for t in rows
        ],
    }
