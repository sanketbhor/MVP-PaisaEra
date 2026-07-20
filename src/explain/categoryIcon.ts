import { colors } from '../theme/tokens';
import type { TransactionCategory } from '../engine';

export const CATEGORY_ICON: Record<TransactionCategory, { icon: string; iconBg: string }> = {
  Food: { icon: '🍔', iconBg: colors.insightBadgeBg },
  Fuel: { icon: '⛽', iconBg: colors.warnBg },
  Groceries: { icon: '🛒', iconBg: colors.insightBadgeBg },
  Transfer: { icon: '↔', iconBg: colors.transferBg },
  Shopping: { icon: '🛍', iconBg: colors.insightBadgeBg },
  Subscription: { icon: '🔁', iconBg: colors.insightBadgeBg },
};
