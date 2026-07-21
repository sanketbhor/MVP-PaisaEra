import { colors } from '../theme/tokens';

export type PersonaId = 'friend' | 'papa' | 'mom';

export interface PersonaConfig {
  id: PersonaId;
  name: string;
  role: string;
  tagline: string;
  emoji: string;
  avatarBg: string;
  isFree: boolean;
  // Describes the voice contract this persona's templates follow — vocabulary,
  // sentence length, and judgment, not just an emoji swap. This is the same
  // text that would seed a real LLM's persona instructions if one were wired
  // in later (see explain/systemPrompt.ts).
  voiceDescription: string;
  sampleQuote: string;
}

export const DEFAULT_PERSONA_ID: PersonaId = 'friend';

export const PERSONALITIES: Record<PersonaId, PersonaConfig> = {
  friend: {
    id: 'friend',
    name: 'Friend',
    role: 'Motivator',
    tagline: 'Casual, peer-to-peer',
    emoji: '🧑',
    avatarBg: colors.insightBadgeBg,
    isFree: true,
    voiceDescription:
      'Casual peer voice, addresses the user as "bhai". Short, punchy sentences. Frames observations as questions or offers to help, never orders. Light and motivating, never judgmental.',
    sampleQuote: '"Bhai, 5 din mein 3 subs renew ho gaye — ₹1,097 gaye. Nazar rakhun?"',
  },
  papa: {
    id: 'papa',
    name: 'Papa',
    role: 'Roast',
    tagline: 'Direct, stern, caring underneath',
    emoji: '👨',
    avatarBg: colors.warnBg,
    isFree: true,
    voiceDescription:
      'Direct and a little stern. Very short, blunt sentences — states the number, then challenges the user with a pointed question. No softening, no emoji in the reply text itself. Care is implied by the attention paid, never stated outright.',
    sampleQuote: '"Teen subscriptions, paanch din. ₹1,097 udaa diye. Sab ki zaroorat hai kya?"',
  },
  mom: {
    id: 'mom',
    name: 'Mom',
    role: 'Soft',
    tagline: 'Gentle, reassuring, non-judgmental',
    emoji: '👩',
    avatarBg: '#e9e3f0',
    isFree: true,
    voiceDescription:
      'Gentle and reassuring, addresses the user as "beta". Longer, warmer sentences with softening connectors ("koi baat nahi", "chalo dekhte hain"). Frames every observation collaboratively — never blame, always "let\'s figure it out together."',
    sampleQuote:
      '"Beta, is hafte 3 subscriptions renew hue — ₹1,097. Koi baat nahi, saath dekhte hain kya kaam ka hai."',
  },
};
