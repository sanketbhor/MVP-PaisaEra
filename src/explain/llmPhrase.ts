// Real-LLM phrasing, with the deterministic templates in chatResponse.ts as
// the unconditional fallback — this call is never load-bearing. The backend
// route (Backend/app/ai.py) receives exactly the same `Fact`
// buildSystemPrompt already documented as the architectural boundary: no
// field on Fact can hold a raw transaction, so the model has nothing to
// miscalculate from even if it tried. Only the phrased `text` changes here;
// confidence/sourceTab/sourceLabel still come from the deterministic layer,
// because those drive real UI behavior (the "why this?" link, the
// low-confidence caveat) and must stay grounded regardless of what the model
// says.
import { isAiApiConfigured, postJson } from './aiApiClient';
import { buildChatResponse } from './chatResponse';
import type { Fact } from '../nlq';
import type { PersonaId } from './personalities';
import type { ChatResponseText } from './types';

interface PhraseResponse {
  ok: boolean;
  text?: string;
  error?: string;
  detail?: string;
}

export async function phraseChatResponse(
  fact: Fact,
  personaId: PersonaId,
  query: string,
  recentReplies: string[] = [],
): Promise<ChatResponseText> {
  const templateResponse = buildChatResponse(fact, personaId);

  // No backend configured (demo mode), or nothing groundable to phrase —
  // the template's own "I didn't understand" / "no goal set" copy is
  // already the right answer, not something worth spending a model call on.
  if (!isAiApiConfigured || fact.kind === 'unknownQuery' || fact.kind === 'unknownGoal') {
    return templateResponse;
  }

  try {
    const { data } = await postJson<PhraseResponse>('/ai/phrase', { fact, personaId, query, recentReplies });
    if (!data.ok || !data.text) {
      return templateResponse;
    }
    return { ...templateResponse, text: data.text };
  } catch {
    return templateResponse;
  }
}
