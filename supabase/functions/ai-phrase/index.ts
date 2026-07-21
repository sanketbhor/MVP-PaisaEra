// Server-side only. Holds the Gemini key (set via `supabase secrets set
// GEMINI_API_KEY=...`) — it never ships to the client. This is the seam
// src/explain/systemPrompt.ts already documented: receive ONLY a
// pre-computed `Fact` (numbers/strings/booleans + provenance ids, see
// src/nlq/types.ts), build a system prompt from it, call the model, return
// text. There is no field on Fact that could hold a raw transaction, so
// this function is structurally unable to let the model "calculate"
// anything — it can only choose words around numbers computed upstream by
// the deterministic engine.
//
// If this fails for any reason (missing key, Gemini error, bad response),
// the client (src/explain/llmPhrase.ts) falls back to the existing
// deterministic template phrasing in chatResponse.ts. A broken or
// unconfigured key degrades the experience; it never breaks it.
import { corsHeaders } from '../_shared/cors.ts';

const GEMINI_MODEL = (Deno.env.get('AI_DEFAULT_MODEL') ?? 'gemini/gemini-2.5-flash').replace('gemini/', '');
const MAX_TOKENS = Number(Deno.env.get('AI_MAX_RESPONSE_TOKENS') ?? 1000);

const PERSONA_VOICE: Record<string, string> = {
  friend:
    'Casual peer voice, addresses the user as "bhai". Short, punchy sentences. Frames observations as questions or offers to help, never orders. Light and motivating, never judgmental.',
  papa: 'Direct and a little stern. Very short, blunt sentences — states the number, then challenges the user with a pointed question. No softening, no emoji in the reply text itself.',
  mom: 'Gentle and reassuring, addresses the user as "beta". Longer, warmer sentences with softening connectors ("koi baat nahi", "chalo dekhte hain"). Frames every observation collaboratively — never blame, always "let\'s figure it out together."',
};

function buildSystemPrompt(personaId: string, fact: Record<string, unknown>, query: string): string {
  const voice = PERSONA_VOICE[personaId] ?? PERSONA_VOICE.friend;
  return [
    'You are Paisa, a personal-finance companion speaking Hinglish.',
    `Voice: ${voice}`,
    '',
    "You do not have access to the user's transactions, bank data, or any raw records. You may ONLY reference the numbers below — they were already computed by a separate, deterministic finance engine. Do not compute, estimate, or infer any number that is not present in this object. If the object does not contain what the user asked about, say so honestly instead of guessing.",
    '',
    'Never give investment advice. If asked, say that is switched off for now.',
    'Reply in 1-3 short sentences, Hinglish, matching the voice above. Plain text only — no markdown, no bullet points.',
    '',
    `USER ASKED: ${query}`,
    '',
    'FACTS (JSON, pre-computed, complete context):',
    JSON.stringify(fact, null, 2),
  ].join('\n');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { fact, personaId, query } = await req.json();
    if (!fact || typeof fact !== 'object') {
      return new Response(JSON.stringify({ error: 'missing_fact' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'not_configured' }), {
        status: 501,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = buildSystemPrompt(String(personaId ?? 'friend'), fact, String(query ?? ''));

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: MAX_TOKENS, temperature: 0.6 },
        }),
      },
    );

    if (!geminiRes.ok) {
      const detail = await geminiRes.text();
      return new Response(JSON.stringify({ error: 'gemini_error', detail }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiJson = await geminiRes.json();
    const text: string | undefined = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) {
      return new Response(JSON.stringify({ error: 'empty_response' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'unknown', detail: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
