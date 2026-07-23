import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '../components/Card';
import TransactionRow from '../components/TransactionRow';
import RecategorizeSheet from '../components/RecategorizeSheet';
import { colors, fonts } from '../theme/tokens';
import { relativeDayLabel } from '../utils/formatDate';
import { categorizeAll } from '../engine';
import type { EngineInput, RawTransaction, TransactionCategory } from '../engine';

interface Props {
  input: EngineInput;
}

export default function TransactionsScreen({ input }: Props) {
  const [rawTransactions, setRawTransactions] = useState<RawTransaction[]>(input.transactions);
  const [recatTxId, setRecatTxId] = useState<string | null>(null);

  // input.transactions can change after this screen has already mounted —
  // e.g. the real-SMS sync resolving asynchronously after Home already
  // rendered. useState's initial value only applies on first mount, so
  // without this the screen gets stuck showing whatever was true at that
  // moment (often still-empty) even once real data arrives.
  useEffect(() => {
    setRawTransactions(input.transactions);
  }, [input.transactions]);

  // Categorization runs fresh off the raw transactions every render — the
  // engine, not local UI state, is the source of truth for category/confirmed.
  const categorized = useMemo(
    () => categorizeAll(rawTransactions).filter((t) => t.type === 'debit'),
    [rawTransactions],
  );

  const groups = useMemo(() => {
    const byLabel = new Map<string, typeof categorized>();
    for (const tx of categorized) {
      const label = relativeDayLabel(tx.date, input.today);
      if (!byLabel.has(label)) byLabel.set(label, []);
      byLabel.get(label)!.push(tx);
    }
    return Array.from(byLabel.entries());
  }, [categorized, input.today]);

  const recatTx = categorized.find((t) => t.id === recatTxId) ?? null;

  const handleSelectCategory = (category: TransactionCategory) => {
    if (!recatTxId) return;
    setRawTransactions((prev) =>
      prev.map((t) => (t.id === recatTxId ? { ...t, userConfirmedCategory: category } : t)),
    );
    setRecatTxId(null);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Transactions</Text>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.hero }]} />
            <Text style={styles.legendText}>Confirmed</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.legendDotGuess} />
            <Text style={styles.legendText}>Guess — tap to fix</Text>
          </View>
        </View>

        {groups.length === 0 ? (
          <Text style={styles.emptyText}>Abhi koi transaction track nahi hua.</Text>
        ) : (
          groups.map(([label, items]) => (
            <View key={label} style={{ marginBottom: 18 }}>
              <Text style={styles.groupLabel}>{label}</Text>
              <Card style={styles.groupCard}>
                {items.map((tx, i) => (
                  <React.Fragment key={tx.id}>
                    <TransactionRow
                      transaction={tx}
                      onPress={tx.isConfirmed ? undefined : () => setRecatTxId(tx.id)}
                    />
                    {i < items.length - 1 && <View style={styles.divider} />}
                  </React.Fragment>
                ))}
              </Card>
            </View>
          ))
        )}
      </ScrollView>

      <RecategorizeSheet
        visible={!!recatTx}
        merchantName={recatTx?.merchant ?? null}
        onClose={() => setRecatTxId(null)}
        onSelect={handleSelectCategory}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screenBg },
  scrollContent: { padding: 24, paddingBottom: 12 },
  title: { fontFamily: fonts.sans, fontSize: 20, color: colors.textPrimary, marginBottom: 12 },
  legendRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 9, height: 9, borderRadius: 3 },
  legendDotGuess: {
    width: 9,
    height: 9,
    borderRadius: 3,
    borderWidth: 1.4,
    borderStyle: 'dashed',
    borderColor: colors.warnText,
  },
  legendText: { fontFamily: fonts.sansRegular, fontSize: 12, color: colors.textMuted },
  groupLabel: {
    fontFamily: fonts.sans,
    fontSize: 11.5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 8,
  },
  groupCard: { padding: 0, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: colors.hairline, marginHorizontal: 15 },
  emptyText: { fontFamily: fonts.sansRegular, fontSize: 14, color: colors.textMuted, marginTop: 12 },
});
