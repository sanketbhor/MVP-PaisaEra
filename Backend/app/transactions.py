"""Per-user transaction storage for the on-device SMS parser.

The phone parses transaction SMS locally (raw SMS bodies never leave the
device), then uploads only the structured result — amount, type, merchant,
timestamp, and a dedupe hash. Requires a Bearer access token from /auth.
"""
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from .database import get_db
from .deps import get_current_user_id
from .models import Transaction

router = APIRouter(prefix="/transactions", tags=["transactions"])

MAX_BULK_ITEMS = 2000

# Mirrors src/engine/types.ts's TransactionCategory — kept as a plain list
# here (not an import) since this backend has no dependency on the RN app's
# TS source, but the values must match or the client silently gets a
# category it doesn't recognize.
VALID_CATEGORIES = {"Food", "Fuel", "Groceries", "Transfer", "Shopping", "Subscription"}


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
        .where(
            Transaction.user_id == user_id,
            Transaction.occurred_at >= since,
            Transaction.dismissed_at.is_(None),
        )
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
                "userCategory": t.user_category,
            }
            for t in rows
        ],
    }


class CategoryBody(BaseModel):
    category: str


def _get_owned_transaction(db: Session, user_id: uuid.UUID, transaction_id: uuid.UUID) -> Transaction:
    tx = db.get(Transaction, transaction_id)
    if tx is None or tx.user_id != user_id:
        raise HTTPException(status_code=404, detail="transaction not found")
    return tx


@router.patch("/{transaction_id}")
def update_category(
    transaction_id: uuid.UUID,
    body: CategoryBody,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    if body.category not in VALID_CATEGORIES:
        raise HTTPException(status_code=400, detail="invalid category")
    tx = _get_owned_transaction(db, user_id, transaction_id)
    tx.user_category = body.category
    db.commit()
    return {"ok": True}


@router.delete("/{transaction_id}")
def dismiss_transaction(
    transaction_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    # Soft-delete: the row (and its sms_hash) stays so a later resync of
    # the same 90-day inbox window doesn't re-insert the same false
    # positive the user just dismissed.
    tx = _get_owned_transaction(db, user_id, transaction_id)
    tx.dismissed_at = datetime.now(timezone.utc)
    db.commit()
    return {"ok": True}
