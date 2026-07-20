// Demonstrates — and documents — the architectural contract for Phase 3:
// "the AI's system prompt and available context should contain only
// pre-computed numbers, never raw transaction data it could miscalculate
// from."
//
// This prototype answers chat queries with the deterministic templates in
// chatResponse.ts, not a live LLM call (there's no backend/API key in this
// Expo app). But the seam for wiring in a real model is exactly this
// function: build a system prompt from a `Fact`, send { systemPrompt, query }
// to the model, done. Because `Fact` (src/nlq/types.ts) is a closed set of
// number/string/boolean fields with no transaction records anywhere in it,
// the JSON below is, by construction, incapable of containing a transaction
// list — there's nothing to redact, because it was never fetched into this
// layer in the first place.

import { PERSONALITIES } from './personalities';
import type { PersonaId } from './personalities';
import type { Fact } from '../nlq';

export function buildSystemPrompt(personaId: PersonaId, fact: Fact): string {
  const persona = PERSONALITIES[personaId];

  return [
    `You are Paisa, a personal-finance companion speaking Hinglish.`,
    `Voice: ${persona.voiceDescription}`,
    ``,
    `You do not have access to the user's transactions, bank data, or any raw records. You may ONLY reference the numbers below — they were already computed by a separate, deterministic finance engine. Do not compute, estimate, or infer any number that is not present in this object. If the object does not contain what the user asked about, say so honestly instead of guessing.`,
    ``,
    `FACTS (JSON, pre-computed, complete context):`,
    JSON.stringify(fact, null, 2),
  ].join('\n');
}
