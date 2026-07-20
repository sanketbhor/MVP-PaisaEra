// Resolves a Provenance record (ids only) into human-viewable rows. This is
// what makes "traceable" mean something in the UI: the Why-This panel can
// literally list the source transactions/bills/goals behind a number, not
// just assert that some exist.

import type { EngineInput, Provenance } from '../engine';
import { formatFullDate } from '../utils/formatDate';
import type { SourceRecord } from './types';

export function resolveSourceRecords(provenance: Provenance, input: EngineInput): SourceRecord[] {
  const records: SourceRecord[] = [];

  for (const billId of provenance.billIds ?? []) {
    const bill = input.bills.find((b) => b.id === billId);
    if (bill) {
      records.push({
        icon: bill.icon ?? '🧾',
        label: bill.name,
        amount: bill.amount,
        dateLabel: formatFullDate(bill.lastRenewedDate),
      });
    }
  }

  for (const txId of provenance.transactionIds ?? []) {
    const tx = input.transactions.find((t) => t.id === txId);
    if (tx) {
      records.push({
        icon: tx.type === 'credit' ? '💰' : '🧾',
        label: tx.merchant,
        amount: tx.amount,
        dateLabel: formatFullDate(tx.date),
      });
    }
  }

  for (const goalId of provenance.goalIds ?? []) {
    const goal = input.goals.find((g) => g.id === goalId);
    if (goal) {
      records.push({
        icon: goal.emoji,
        label: `${goal.name} (goal)`,
        amount: goal.monthlyContribution,
        dateLabel: null,
      });
    }
  }

  return records;
}
