import type { RawTransaction, TransactionCategory } from '../engine';
import type { RemoteTransaction } from './transactionsApiClient';

const VALID_CATEGORIES = new Set<string>(['Food', 'Fuel', 'Groceries', 'Transfer', 'Shopping', 'Subscription']);

function asCategory(value: string | null): TransactionCategory | undefined {
  return value && VALID_CATEGORIES.has(value) ? (value as TransactionCategory) : undefined;
}

export function mapToEngineTransactions(remote: RemoteTransaction[]): RawTransaction[] {
  return remote.map((t) => ({
    id: t.id,
    merchant: t.merchant,
    amount: t.amount,
    date: t.occurredAt.slice(0, 10),
    type: t.type,
    userConfirmedCategory: asCategory(t.userCategory),
  }));
}
