// Public API of the phrasing layer. Everything here reads structured engine
// output (see src/engine) and produces Hinglish UI copy — it is the seam
// where a real AI layer could later be swapped in, since its inputs are
// already exactly "structured facts + provenance," never raw transactions
// to reason over freely.

export * from './types';
export { resolveSourceRecords } from './resolveProvenance';
export { CATEGORY_ICON } from './categoryIcon';
export { buildSubscriptionInsightText, buildSubscriptionWhyThis } from './subscriptionInsight';
export { buildGenericWhyThis } from './genericWhyThis';
export { buildGoalStatusText } from './goalStatus';
export { buildBudgetInsightText } from './budgetInsight';
export { buildForecastText } from './forecast';
export { PERSONALITIES, DEFAULT_PERSONA_ID } from './personalities';
export type { PersonaId, PersonaConfig } from './personalities';
export { buildChatResponse } from './chatResponse';
export { buildSystemPrompt } from './systemPrompt';
