"""Chat phrasing via Gemini — the only file that talks to the LLM.

This mirrors the exact architectural boundary src/explain/systemPrompt.ts
documents on the client: the only input is a pre-computed `Fact` (numbers/
strings/booleans + provenance, see src/nlq/types.ts) built by the
deterministic finance engine. There is no field on Fact that could hold a
raw transaction, so this function is structurally unable to let the model
"calculate" anything — it can only choose words around numbers computed
upstream. Was originally a Supabase Edge Function (supabase/functions/
ai-phrase/) but that was never deployed (needs an interactive `supabase
login` this environment can't do) — moved here instead, onto the same
backend already proven to run and be testable locally end to end.

If this fails for any reason (missing key, Gemini error, bad response),
the client (src/explain/llmPhrase.ts) falls back to the existing
deterministic template phrasing. A broken or unconfigured key degrades
the chat experience; it never breaks it.
"""
import json
import urllib.error
import urllib.request
from dataclasses import dataclass

from .config import settings

PERSONA_VOICE = {
    "friend": (
        'Casual peer voice, addresses the user as "bhai". Short, punchy sentences. '
        "Frames observations as questions or offers to help, never orders. "
        "Light and motivating, never judgmental."
    ),
    "papa": (
        "Direct and a little stern. Very short, blunt sentences — states the number, "
        "then challenges the user with a pointed question. No softening, no emoji in "
        "the reply text itself."
    ),
    "mom": (
        'Gentle and reassuring, addresses the user as "beta". Longer, warmer sentences '
        'with softening connectors ("koi baat nahi", "chalo dekhte hain"). Frames every '
        "observation collaboratively — never blame, always \"let's figure it out together.\""
    ),
}


def _build_system_prompt(persona_id: str, fact: dict, query: str) -> str:
    voice = PERSONA_VOICE.get(persona_id, PERSONA_VOICE["friend"])
    return "\n".join(
        [
            "You are Paisa, a personal-finance companion speaking Hinglish.",
            f"Voice: {voice}",
            "",
            "You do not have access to the user's transactions, bank data, or any raw "
            "records. You may ONLY reference the numbers below — they were already "
            "computed by a separate, deterministic finance engine. Do not compute, "
            "estimate, or infer any number that is not present in this object. If the "
            "object does not contain what the user asked about, say so honestly instead "
            "of guessing.",
            "",
            "Never give investment advice. If asked, say that is switched off for now.",
            "Reply in 1-3 short sentences, Hinglish, matching the voice above. Plain "
            "text only — no markdown, no bullet points.",
            "",
            f"USER ASKED: {query}",
            "",
            "FACTS (JSON, pre-computed, complete context):",
            json.dumps(fact, indent=2),
        ]
    )


@dataclass
class PhraseResult:
    ok: bool
    text: str | None = None
    error: str | None = None  # 'not_configured' | 'gemini_error' | 'empty_response'
    detail: str | None = None


def phrase_fact(fact: dict, persona_id: str, query: str) -> PhraseResult:
    if not settings.GEMINI_API_KEY:
        return PhraseResult(ok=False, error="not_configured")

    prompt = _build_system_prompt(persona_id, fact, query)
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{settings.AI_DEFAULT_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
    )
    body = json.dumps(
        {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"maxOutputTokens": settings.AI_MAX_RESPONSE_TOKENS, "temperature": 0.6},
        }
    ).encode("utf-8")

    req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=20) as res:
            gemini_json = json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        return PhraseResult(ok=False, error="gemini_error", detail=detail)
    except urllib.error.URLError as exc:
        return PhraseResult(ok=False, error="gemini_error", detail=str(exc))

    try:
        text = gemini_json["candidates"][0]["content"]["parts"][0]["text"].strip()
    except (KeyError, IndexError, AttributeError):
        text = None

    if not text:
        return PhraseResult(ok=False, error="empty_response")

    return PhraseResult(ok=True, text=text)
