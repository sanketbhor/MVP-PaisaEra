// Categorization engine.
// Assigns a spend category to each raw transaction using a fixed, inspectable
// rule table — never a model. A rule either matches with high confidence
// (auto-confirmed) or low confidence (surfaced to the user as a guess, via
// isConfirmed: false, until they fix it — see userConfirmedCategory).

import type { CategorizedTransaction, RawTransaction, TransactionCategory } from './types';

interface CategorizationRule {
  id: string;
  category: TransactionCategory;
  confident: boolean;
  match: (merchant: string) => boolean;
}

const contains = (patterns: RegExp) => (merchant: string) => patterns.test(merchant);

// Ordered — first match wins. Keep specific merchant rules above generic ones.
export const CATEGORIZATION_RULES: CategorizationRule[] = [
  {
    id: 'rule-subscription-streaming',
    category: 'Subscription',
    confident: true,
    match: contains(/netflix|spotify|hotstar|icloud|prime video|youtube premium/i),
  },
  {
    id: 'rule-food-delivery',
    category: 'Food',
    confident: true,
    match: contains(/swiggy|zomato/i),
  },
  {
    id: 'rule-groceries-delivery',
    category: 'Groceries',
    confident: true,
    match: contains(/bigbasket|blinkit|zepto|grofers/i),
  },
  {
    id: 'rule-shopping-marketplace',
    category: 'Shopping',
    confident: true,
    match: contains(/amazon|flipkart|myntra/i),
  },
  {
    id: 'rule-fuel-petrol-pump',
    category: 'Fuel',
    confident: false, // petrol-pump names vary too much to trust automatically
    match: contains(/petrol|fuel|hp\s|indianoil|bharat petroleum|iocl/i),
  },
  {
    id: 'rule-transfer-upi-person',
    category: 'Transfer',
    confident: false, // a P2P UPI transfer's real purpose isn't knowable from the merchant string alone
    match: contains(/^upi\s*[·:]/i),
  },
];

// No rule matched at all — falls back to the closest catch-all category, always
// unconfirmed so the user is asked rather than the engine guessing silently.
const FALLBACK_CATEGORY: TransactionCategory = 'Shopping';

export function categorizeTransaction(tx: RawTransaction): CategorizedTransaction {
  if (tx.userConfirmedCategory) {
    return { ...tx, category: tx.userConfirmedCategory, isConfirmed: true, matchedRuleId: 'user-override' };
  }
  const rule = CATEGORIZATION_RULES.find((r) => r.match(tx.merchant));
  if (!rule) {
    return { ...tx, category: FALLBACK_CATEGORY, isConfirmed: false, matchedRuleId: null };
  }
  return { ...tx, category: rule.category, isConfirmed: rule.confident, matchedRuleId: rule.id };
}

export function categorizeAll(transactions: RawTransaction[]): CategorizedTransaction[] {
  return transactions.map(categorizeTransaction);
}
