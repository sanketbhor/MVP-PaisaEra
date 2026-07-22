"""Per-user goals, owned entirely by this backend's direct Postgres
connection — same pattern as transactions.py. Previously goals were written
via the Supabase client (PostgREST + anon key), which needs Postgres RLS's
auth.uid() to recognize the caller; a JWT issued by this backend's own /auth
never satisfied that, so every create silently fell back to on-device-only
storage and never survived a reinstall. Requires a Bearer access token.
"""
import uuid
from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import get_db
from .deps import get_current_user_id
from .models import Goal

router = APIRouter(prefix="/goals", tags=["goals"])


class GoalBody(BaseModel):
    id: str
    name: str = Field(min_length=1, max_length=120)
    emoji: str = Field(min_length=1, max_length=8)
    targetAmount: float = Field(gt=0)
    savedAmount: float = Field(ge=0, default=0)
    monthlyContribution: float = Field(ge=0, default=0)
    deadlineDate: date


def _to_json(g: Goal) -> dict:
    return {
        "id": str(g.id),
        "name": g.name,
        "emoji": g.emoji,
        "targetAmount": float(g.target_amount) if g.target_amount is not None else 0,
        "savedAmount": float(g.saved_amount),
        "monthlyContribution": float(g.monthly_contribution),
        "deadlineDate": g.deadline_date.isoformat() if g.deadline_date else None,
    }


@router.post("")
def create_goal(
    body: GoalBody,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    goal = Goal(
        user_id=user_id,
        goal_type="custom",
        target_amount=body.targetAmount,
        name=body.name,
        emoji=body.emoji,
        saved_amount=body.savedAmount,
        monthly_contribution=body.monthlyContribution,
        deadline_date=body.deadlineDate,
        created_at=datetime.now(timezone.utc),
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return {"ok": True, "goal": _to_json(goal)}


@router.get("")
def list_goals(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    rows = db.execute(
        select(Goal).where(Goal.user_id == user_id, Goal.name.isnot(None)).order_by(Goal.created_at.desc())
    ).scalars()
    return {"ok": True, "goals": [_to_json(g) for g in rows]}
