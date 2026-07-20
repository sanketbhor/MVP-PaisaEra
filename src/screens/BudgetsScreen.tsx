import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '../components/Card';
import BudgetCategoryCard from '../components/BudgetCategoryCard';
import { colors, fonts } from '../theme/tokens';
import { formatINR } from '../utils/format';
import { formatMonthName } from '../utils/formatDate';
import type { EngineInput } from '../engine';

interface Props {
  input: EngineInput;
}

export default function BudgetsScreen({ input }: Props) {
  const { totalSpent, totalBudgeted } = useMemo(() => {
    return input.categoryBudgets.reduce(
      (acc, b) => ({ totalSpent: acc.totalSpent + b.spent, totalBudgeted: acc.totalBudgeted + b.budgeted }),
      { totalSpent: 0, totalBudgeted: 0 },
    );
  }, [input.categoryBudgets]);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 14 }}>
          <Text style={styles.title}>Budgets</Text>
          {input.categoryBudgets.length > 0 && (
            <Text style={styles.subtitle}>
              {formatMonthName(input.today)} · {formatINR(totalSpent)} / {formatINR(totalBudgeted)} use hua
            </Text>
          )}
        </View>

        {input.categoryBudgets.length === 0 ? (
          <Card>
            <Text style={styles.emptyTitle}>Budgets abhi ban rahe hain</Text>
            <Text style={styles.emptyBody}>
              Sahi budget banane ke liye thoda aur spending data chahiye — 2-3 hafte mein ready ho
              jayega. Tab tak koi fake number nahi dikhayenge.
            </Text>
          </Card>
        ) : (
          <View style={{ gap: 12 }}>
            {input.categoryBudgets.map((b) => (
              <BudgetCategoryCard key={b.id} budget={b} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screenBg },
  scrollContent: { padding: 24, paddingBottom: 12 },
  title: { fontFamily: fonts.sans, fontSize: 20, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.sansRegular, fontSize: 13, color: colors.textMuted, marginTop: 2 },
  emptyTitle: { fontFamily: fonts.sans, fontSize: 14.5, color: colors.textPrimary, marginBottom: 6 },
  emptyBody: { fontFamily: fonts.sansRegular, fontSize: 13, lineHeight: 20, color: colors.textMuted2 },
});
