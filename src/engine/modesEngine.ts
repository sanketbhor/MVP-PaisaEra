// Deterministic calculations for the three account "modes." Each mode has a
// genuinely different math shape per the product spec — Couple splits a
// shared pool by contribution, Family tracks a household budget against
// member roles, Business tracks cash-flow (profit), not a budget. None of
// this invents numbers: every result is a sum or ratio over declared
// records (see modesMockData.ts).

export interface CoupleMember {
  id: string;
  initial: string;
  name: string;
  color: string;
  contributionThisMonth: number;
}

export interface CoupleExpenseSplit {
  total: number;
  splits: { memberId: string; amount: number; pct: number }[];
}

export function computeCoupleExpenseSplit(members: CoupleMember[]): CoupleExpenseSplit {
  const total = members.reduce((sum, m) => sum + m.contributionThisMonth, 0);
  return {
    total,
    splits: members.map((m) => ({
      memberId: m.id,
      amount: m.contributionThisMonth,
      pct: total > 0 ? m.contributionThisMonth / total : 0,
    })),
  };
}

export interface BusinessCashFlow {
  cashIn: number;
  cashOut: number;
  net: number;
  isPositive: boolean;
}

export function computeBusinessCashFlow(cashIn: number, cashOut: number): BusinessCashFlow {
  const net = cashIn - cashOut;
  return { cashIn, cashOut, net, isPositive: net >= 0 };
}
