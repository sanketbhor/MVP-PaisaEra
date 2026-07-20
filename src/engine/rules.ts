// Named, inspectable thresholds used by the calculation and status engines.
// Nothing here is a model weight or a guess — these are product-decided
// business rules. Keeping them in one place means every "over budget" or
// "behind on goal" verdict traces back to a documented number, not a magic
// constant buried in a function.

export const BUDGET_RULES = {
  // A category counts as "near" its limit once spend crosses this fraction of budget.
  NEAR_LIMIT_THRESHOLD: 0.85,
  // Below this fraction, the category is comfortably under — worth calling out as "chill."
  COMFORTABLY_UNDER_THRESHOLD: 0.55,
} as const;

export const GOAL_RULES = {
  // A goal counts as "on track" once its actual monthly contribution reaches
  // this fraction of the pace required to hit the deadline — absorbs rounding,
  // not intent to underfund.
  ON_TRACK_TOLERANCE: 0.95,
} as const;

export const CONFIDENCE_RULES = {
  // Below this many days of tracked history, confidence is "growing."
  GROWING_BELOW_DAYS: 7,
  // Below this many days (and still above GROWING_BELOW_DAYS), confidence is
  // "building." At or above, and with bills confirmed, confidence is "high."
  BUILDING_BELOW_DAYS: 30,
  // A recurring-charge pattern needs this many consecutive observed months to
  // count as "high" confidence for a subscription-renewal insight.
  SUBSCRIPTION_HIGH_CONFIDENCE_MONTHS: 3,
} as const;

export const SUBSCRIPTION_RULES = {
  // Renewals within this many days of "today" are grouped into one insight.
  RENEWAL_WINDOW_DAYS: 5,
  // Fewer than this many renewals in the window isn't worth surfacing as an insight.
  MIN_RENEWALS_FOR_INSIGHT: 2,
} as const;

export const BILL_ALERT_RULES = {
  // A non-subscription bill shows as an "upcoming" Home-screen alert once its
  // due date is within this many days.
  DUE_SOON_WINDOW_DAYS: 7,
} as const;
