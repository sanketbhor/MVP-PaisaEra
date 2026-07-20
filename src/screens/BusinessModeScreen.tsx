import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '../components/Card';
import { colors, fonts } from '../theme/tokens';
import { formatINR } from '../utils/format';
import { computeBusinessCashFlow, businessData } from '../engine';

interface Props {
  onBack: () => void;
}

export default function BusinessModeScreen({ onBack }: Props) {
  const cashFlow = useMemo(
    () => computeBusinessCashFlow(businessData.cashIn, businessData.cashOut),
    [],
  );

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable onPress={onBack} accessibilityRole="button" style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <View>
            <Text style={styles.title}>Business mode</Text>
            <Text style={styles.subtitle}>{businessData.businessName} · GST-ready</Text>
          </View>
        </View>

        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Business ka paisa personal se alag rehta hai. Cash-flow, receivables aur GST-taggable
            expenses — profit tracking, budgets nahi.
          </Text>
        </View>

        <View style={styles.miniRow}>
          <Card style={styles.miniCard}>
            <Text style={styles.miniLabel}>Is mahine in</Text>
            <Text style={[styles.miniValue, { color: colors.hero }]}>{formatINR(cashFlow.cashIn)}</Text>
          </Card>
          <Card style={styles.miniCard}>
            <Text style={styles.miniLabel}>Is mahine out</Text>
            <Text style={[styles.miniValue, { color: colors.warnText }]}>{formatINR(cashFlow.cashOut)}</Text>
          </Card>
        </View>

        <Card style={{ marginBottom: 12 }}>
          <View style={styles.netRow}>
            <View>
              <Text style={styles.netTitle}>Net cash-flow</Text>
              <Text style={styles.netSubtitle}>July · deterministic</Text>
            </View>
            <Text style={[styles.netValue, { color: cashFlow.isPositive ? colors.hero : colors.warnText }]}>
              {cashFlow.isPositive ? '+' : '-'}
              {formatINR(Math.abs(cashFlow.net))}
            </Text>
          </View>
        </Card>

        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <View style={styles.row}>
            <View style={styles.iconChip}>
              <Text style={styles.iconText}>🧾</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Pending receivables</Text>
              <Text style={styles.rowSubtext}>{businessData.pendingInvoiceCount} invoices</Text>
            </View>
            <Text style={styles.rowAmount}>{formatINR(businessData.pendingReceivablesAmount)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={[styles.iconChip, { backgroundColor: colors.insightBadgeBg }]}>
              <Text style={styles.iconText}>%</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>GST-taggable</Text>
              <Text style={styles.rowSubtext}>{businessData.gstTaggedTransactionCount} transactions tagged</Text>
            </View>
            <Text style={styles.rowAmount}>{formatINR(businessData.gstTaggedAmount)}</Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screenBg },
  scrollContent: { padding: 24, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1e1912',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  backIcon: { fontSize: 17 },
  title: { fontFamily: fonts.sans, fontSize: 17, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.sansRegular, fontSize: 12, color: colors.textMuted, marginTop: 1 },
  banner: { backgroundColor: colors.transferBg, borderRadius: 16, padding: 13, marginBottom: 14 },
  bannerText: { fontFamily: fonts.sansRegular, fontSize: 12.5, lineHeight: 19, color: '#2a5560' },
  miniRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  miniCard: { flex: 1 },
  miniLabel: { fontFamily: fonts.sansBold, fontSize: 11.5, color: colors.textMuted },
  miniValue: { fontFamily: fonts.mono, fontSize: 19, marginTop: 4 },
  netRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  netTitle: { fontFamily: fonts.sans, fontSize: 14, color: colors.textPrimary },
  netSubtitle: { fontFamily: fonts.sansRegular, fontSize: 11.5, color: colors.textMuted, marginTop: 1 },
  netValue: { fontFamily: fonts.mono, fontSize: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 15 },
  iconChip: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.warnBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 14 },
  rowLabel: { fontFamily: fonts.sans, fontSize: 14, color: colors.textPrimary },
  rowSubtext: { fontFamily: fonts.sansRegular, fontSize: 11.5, color: colors.textMuted, marginTop: 1 },
  rowAmount: { fontFamily: fonts.mono, fontSize: 13, color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.hairline, marginHorizontal: 15 },
});
