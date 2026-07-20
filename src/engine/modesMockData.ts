import type { CategoryBudget, Goal } from './types';
import type { CoupleMember } from './modesEngine';

// ── Couple mode ─────────────────────────────────────────────────────────
export const couplePartnerNames = { a: 'Sanket', b: 'Priya' };

export const coupleMembers: CoupleMember[] = [
  { id: 'sanket', initial: 'S', name: 'Sanket', color: '#3f7a5c', contributionThisMonth: 18800 },
  { id: 'priya', initial: 'P', name: 'Priya', color: '#8b6cb0', contributionThisMonth: 15400 },
];

// Reuses the same Goal shape as the individual Goals screen — the shared
// goal engine (computeGoalStatus / computeGoalProgressPct) works on it
// unchanged, since a joint goal is just a goal with a combined contribution.
export const coupleSharedGoal: Goal = {
  id: 'shared-down-payment',
  emoji: '🏠',
  name: 'Ghar ka down-payment',
  targetAmount: 800000,
  savedAmount: 240000,
  monthlyContribution: 40000, // sum of both partners' ₹20k/mo
  deadlineDate: '2028-01-20',
};

// ── Family mode ─────────────────────────────────────────────────────────
export type FamilyRole = 'admin-contributes' | 'contributes' | 'allowance-view-only';

export interface FamilyMember {
  id: string;
  initial: string;
  name: string;
  color: string;
  role: FamilyRole;
  amount: number;
}

export const familyHouseholdName = 'Bhor household';

export const familyMembers: FamilyMember[] = [
  { id: 'sanket', initial: 'S', name: 'Sanket', color: '#3f7a5c', role: 'admin-contributes', amount: 32000 },
  { id: 'aai', initial: 'A', name: 'Aai', color: '#8b6cb0', role: 'contributes', amount: 18000 },
  { id: 'rohan', initial: 'R', name: 'Rohan', color: '#c9a23f', role: 'allowance-view-only', amount: 2000 },
];

export const familyRoleLabel: Record<FamilyRole, string> = {
  'admin-contributes': 'Admin · contributes',
  contributes: 'Contributes',
  'allowance-view-only': 'Allowance · view only',
};

// A household budget is just a CategoryBudget in disguise — reuses
// computeBudgetStatus for the over/near/under verdict.
export const familyHouseholdBudget: CategoryBudget = {
  id: 'household',
  category: 'Household',
  emoji: '🏡',
  budgeted: 75000,
  spent: 62400,
  previousMonthSpent: 60100,
};

// ── Business mode ───────────────────────────────────────────────────────
export interface BusinessModeData {
  businessName: string;
  cashIn: number;
  cashOut: number;
  pendingReceivablesAmount: number;
  pendingInvoiceCount: number;
  gstTaggedAmount: number;
  gstTaggedTransactionCount: number;
}

export const businessData: BusinessModeData = {
  businessName: 'Bhor Traders',
  cashIn: 420000,
  cashOut: 286000,
  pendingReceivablesAmount: 88000,
  pendingInvoiceCount: 3,
  gstTaggedAmount: 51480,
  gstTaggedTransactionCount: 42,
};
