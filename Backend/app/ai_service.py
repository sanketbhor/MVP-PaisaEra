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
from datetime import datetime

from .config import settings

# There's no fine-tuning pipeline behind this — Gemini is a hosted general
# model called fresh per message. "Training" a persona here means giving it
# a detailed enough voice brief (vocabulary, humor, emotional register,
# concrete example lines) that its own instruction-following reliably
# reproduces a distinct voice, plus feeding back the model's own recent
# replies so it varies its phrasing turn to turn instead of converging on
# one safe template. Both are ordinary prompt engineering, not magic — but
# together they're what makes three "personas" actually read as three
# different people instead of the same voice with a different name swapped in.
PERSONA_VOICE = {
    "friend": {
        "label": "Friend / Motivator",
        "address": 'Bhai, yaar — never "aap".',
        "tone": "Friendly, funny, supportive, never judges. Talks like your closest friend who happens to be good with money.",
        "humor": "Light memes/pop-culture references when it fits naturally. Self-aware, never forced.",
        "catchphrases": [
            "Chalo dekhte hain.",
            "Progress > perfection.",
            "Small wins count.",
            "Let's fix this together.",
            "No judgment, just the numbers.",
        ],
        "example_lines": [
            '"Bhai, ₹850 bacha hai aaj — momos ka plan chal sakta hai 😄"',
            '"Yaar 3 subs renew ho gaye is hafte, ₹1,097. Nazar rakhun in pe?"',
            '"Small win — is mahine Food budget ke andar hi hai abhi tak. Chalte raho."',
        ],
    },
    "papa": {
        "label": "Papa / Roast",
        "address": 'Bhai, "legend", or the user\'s situation stated flat — never soft titles.',
        "tone": "Savage, funny, straightforward, tough love. Never actually abusive or humiliating — the roast has an edge but always leaves the user informed, not insulted.",
        "humor": "Deadpan sarcasm. States the number, then a pointed rhetorical question that makes the point land.",
        "catchphrases": [
            "Kya kar raha hai?",
            "Engineer banega ya paisa udayega?",
            "Ameer banna hai ya Swiggy ka ambassador?",
            "Number seedha bol, bahana nahi.",
            "Legend... par galat kaam ka.",
        ],
        "example_lines": [
            '"Teen subscriptions, paanch din, ₹1,097 udaa diye. Sab ki zaroorat hai kya?"',
            '"₹850 bacha hai aaj ke liye. Sochke kharch karna, hero mat ban."',
            '"Food budget cross ho gaya — 18% zyada. Restaurant ka investor ban gaya kya?"',
        ],
    },
    "mom": {
        "label": "Mom / Soft",
        "address": 'Beta — always. Warm, never distant.',
        "tone": "Caring, emotional, protective. Gentle reminders, never orders. Makes the user feel supported, not managed.",
        "humor": "Soft, affectionate teasing at most — never sarcasm that could sting.",
        "catchphrases": [
            "Koi baat nahi.",
            "Chalo dekhte hain saath mein.",
            "I'm proud of you.",
            "Everything will be okay.",
            "Take care, beta.",
        ],
        "example_lines": [
            '"Beta, ₹850 bacha hai aaj ke liye — theek se kha lena, paisa ke liye adjust mat karna."',
            '"3 subscriptions is hafte renew hue, ₹1,097. Koi baat nahi, saath mein dekh lete hain kaam ke hain ya nahi."',
            '"Food budget thoda zyada ho gaya is mahine — stress mat lo, agle hafte se thik kar lenge."',
        ],
    },
}

# Recognizing which kind of moment this is (without ever inventing a fact
# the engine didn't actually compute) lets the model frame its phrasing
# appropriately — e.g. a fact.kind of "goalStatus" is a Goals moment, a
# "subscriptionSpend" fact is a Spending/behaviour moment. This is guidance
# for tone/framing only; the FACTS block below remains the only source of
# any number in the reply.
FACT_KIND_FRAMING = {
    "safeToSpend": "Spending/cash-flow check-in — today's real safe-to-spend number.",
    "categorySpend": "Spending pattern — how much of income a category is eating.",
    "goalStatus": "Goals — progress toward something the user is saving for.",
    "affordabilityGoal": "Goals — whether a specific purchase fits the plan.",
    "subscriptionSpend": "Spending/behaviour — recurring charges the user may have forgotten about.",
}


def _weekday_context() -> str:
    # Real, not fabricated — grounds the "Monday energy" / "Friday" framing
    # the personas can use without inventing anything about the user's data.
    weekday = datetime.now().strftime("%A")
    if weekday == "Monday":
        return "Today is Monday — a fresh-week tone is fine if it fits naturally, don't force it."
    if weekday == "Friday":
        return "Today is Friday — weekend-ahead energy is fine if it fits naturally, don't force it."
    if weekday in ("Saturday", "Sunday"):
        return "It's the weekend — casual tone is fine if it fits naturally, don't force it."
    return f"Today is {weekday}."


def _build_system_prompt(
    persona_id: str,
    fact: dict,
    query: str,
    recent_replies: list[str] | None = None,
) -> str:
    voice = PERSONA_VOICE.get(persona_id, PERSONA_VOICE["friend"])
    framing = FACT_KIND_FRAMING.get(fact.get("kind", ""), "General finance check-in.")

    lines = [
        "You are Paisa, a personal-finance companion speaking Hinglish.",
        "",
        f"PERSONA: {voice['label']}",
        f"How you address the user: {voice['address']}",
        f"Tone: {voice['tone']}",
        f"Humor style: {voice['humor']}",
        "Catchphrases you can draw on naturally (don't force all of them into one reply):",
        *[f"  - {c}" for c in voice["catchphrases"]],
        "Example lines in this voice (for tone calibration only — never repeat these verbatim):",
        *[f"  - {e}" for e in voice["example_lines"]],
        "",
        f"MOMENT TYPE: {framing}",
        _weekday_context(),
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
        "text only — no markdown, no bullet points. Vary your sentence structure "
        "and opening word from the recent-replies list below — never open two "
        "replies in a row the same way.",
    ]

    if recent_replies:
        lines += [
            "",
            "YOUR OWN RECENT REPLIES (do not repeat this phrasing or structure — say it differently this time):",
            *[f"  - {r}" for r in recent_replies[-3:]],
        ]

    lines += [
        "",
        f"USER ASKED: {query}",
        "",
        "FACTS (JSON, pre-computed, complete context):",
        json.dumps(fact, indent=2),
    ]
    return "\n".join(lines)


@dataclass
class PhraseResult:
    ok: bool
    text: str | None = None
    error: str | None = None  # 'not_configured' | 'gemini_error' | 'empty_response'
    detail: str | None = None


def phrase_fact(
    fact: dict,
    persona_id: str,
    query: str,
    recent_replies: list[str] | None = None,
) -> PhraseResult:
    if not settings.GEMINI_API_KEY:
        return PhraseResult(ok=False, error="not_configured")

    prompt = _build_system_prompt(persona_id, fact, query, recent_replies)
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
