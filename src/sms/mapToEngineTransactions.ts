import type { RawTransaction } from '../engine';
import type { RemoteTransaction } from './transactionsApiClient';

export function mapToEngineTransactions(remote: RemoteTransaction[]): RawTransaction[] {
  return remote.map((t) => ({
    id: t.id,
    merchant: t.merchant,
    amount: t.amount,
    date: t.occurredAt.slice(0, 10),
    type: t.type,
  }));
}
