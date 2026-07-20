import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Card from './Card';
import { colors, fonts } from '../theme/tokens';
import { formatINR } from '../utils/format';
import { computeBudgetStatus } from '../engine';
import type { CategoryBudget } from '../engine';
import { buildBudgetInsightText } from '../explain';

interface Props {
  budget: CategoryBudget;
}

export default function BudgetCategoryCard({ budget }: Props) {
  const status = computeBudgetStatus(budget);
  const insightText = buildBudgetInsightText(status);
  const barColor =
    status.level === 'over' ? colors.warnText : status.level === 'near' ? colors.amber : colors.hero;
  const spentColor = status.level === 'over' ? colors.warnText : colors.textPrimary;
  const insightColor = status.level === 'over' ? colors.warnText : colors.textMuted2;

  return (
    <Card>
      <View style={styles.headerRow}>
        <Text style={styles.categoryLabel}>
          {budget.emoji} {budget.category}
        </Text>
        <Text style={styles.amounts}>
          <Text style={[styles.spent, { color: spentColor }]}>{formatINR(budget.spent)}</Text>{' '}
          <Text style={styles.ofBudget}>/ {formatINR(budget.budgeted)}</Text>
        </Text>
      </View>
      <View style={styles.track}>
        <View
          style={[styles.fill, { width: `${Math.min(status.pctUsed, 1) * 100}%`, backgroundColor: barColor }]}
        />
      </View>
      <Text style={[styles.insight, { color: insightColor }]}>{insightText}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 },
  categoryLabel: { fontFamily: fonts.sans, fontSize: 14.5, color: colors.textPrimary },
  amounts: { fontFamily: fonts.monoRegular, fontSize: 12.5 },
  spent: { fontFamily: fonts.mono, fontWeight: '700' },
  ofBudget: { fontFamily: fonts.monoRegular, color: colors.textMuted },
  track: { height: 7, borderRadius: 4, backgroundColor: colors.trackBg, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  insight: { fontFamily: fonts.sansMedium, fontSize: 12.5, marginTop: 8 },
});
