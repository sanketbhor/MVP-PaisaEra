"""HTTP layer for chat phrasing — thin translation from ai_service's result
to JSON, mirroring auth.py's pattern.
"""
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from . import ai_service

router = APIRouter(prefix="/ai", tags=["ai"])


class PhraseBody(BaseModel):
    fact: dict
    personaId: str = "friend"
    query: str = ""
    # This persona's own last few replies, oldest first — lets the model
    # avoid repeating its own phrasing/opening turn to turn. Never any
    # other data than text the model itself already generated.
    recentReplies: list[str] = []


@router.post("/phrase")
def phrase(body: PhraseBody):
    result = ai_service.phrase_fact(body.fact, body.personaId, body.query, body.recentReplies)
    if result.ok:
        return {"ok": True, "text": result.text}
    status = 501 if result.error == "not_configured" else 502
    return JSONResponse(status_code=status, content={"ok": False, "error": result.error, "detail": result.detail})
