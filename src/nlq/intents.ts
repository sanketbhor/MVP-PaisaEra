// Intent classification: turns free text into an intent + entity guesses,
// using keyword/regex matching against the query and against known goal and
// budget-category NAMES only. This is deliberately not a real NLU model —
// it's the same rule-based philosophy as the categorization engine. It never
// looks at transaction content, only the strings the user typed and the
// names of things that already exist in the user's data.

export type IntentKind =
  | 'affordabilityGoal'
  | 'categorySpend'
  | 'safeToSpend'
  | 'goalStatus'
  | 'subscriptionSpend'
  | 'unknown';

export interface ClassifiedIntent {
  kind: IntentKind;
  goalNameGuess?: string;
  categoryGuess?: string;
}

const AFFORD_PATTERN = /\bafford|le sakta|kharid|\bbuy\b/i;
const CATEGORY_SPEND_PATTERN = /kitna\s+(gaya|kharch|kharcha)|\bspent\b|spend on|\bkharcha\b/i;
const SAFE_TO_SPEND_PATTERN = /safe to spend|aaj kitna|budget aaj|spend today/i;
const GOAL_STATUS_PATTERN = /on track|kab tak|\bcomplete\b|deadline|\bgoal\b/i;
const SUBSCRIPTION_PATTERN = /subscription|\brenew/i;

function findMatch(lowerText: string, names: string[]): string | undefined {
  return names.find((name) => name.length > 0 && lowerText.includes(name.toLowerCase()));
}

export function classifyQuery(text: string, goalNames: string[], categoryNames: string[]): ClassifiedIntent {
  const lower = text.toLowerCase();
  const matchedGoal = findMatch(lower, goalNames);
  const matchedCategory = findMatch(lower, categoryNames);

  if (AFFORD_PATTERN.test(lower)) {
    return { kind: 'affordabilityGoal', goalNameGuess: matchedGoal };
  }
  if (matchedCategory && CATEGORY_SPEND_PATTERN.test(lower)) {
    return { kind: 'categorySpend', categoryGuess: matchedCategory };
  }
  if (SUBSCRIPTION_PATTERN.test(lower)) {
    return { kind: 'subscriptionSpend' };
  }
  if (matchedGoal && GOAL_STATUS_PATTERN.test(lower)) {
    return { kind: 'goalStatus', goalNameGuess: matchedGoal };
  }
  if (SAFE_TO_SPEND_PATTERN.test(lower)) {
    return { kind: 'safeToSpend' };
  }
  if (matchedCategory) {
    return { kind: 'categorySpend', categoryGuess: matchedCategory };
  }
  if (matchedGoal) {
    return { kind: 'goalStatus', goalNameGuess: matchedGoal };
  }
  return { kind: 'unknown' };
}
