import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ModalScreen from './ModalScreen';
import Card from './Card';
import { colors, fonts } from '../theme/tokens';
import { formatINR } from '../utils/format';
import { formatFullDate } from '../utils/formatDate';
import { computeForecast } from '../engine';
import type { EngineInput, SafeToSpendResult } from '../engine';
import { buildForecastText } from '../explain';

interface Row {
  title: string;
  subtitle: string;
  value: number;
  positive?: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  input: EngineInput;
  breakdown: SafeToSpendResult;
}

export default function SafeToSpendExpandedModal({ visible, onClose, input, breakdown }: Props) {
  const forecast = computeForecast(input);
  const rows: Row[] = [
    {
      title: 'Salary aaya',
      subtitle: `${formatFullDate(breakdown.incomeDetectedDate)} · detected`,
      value: breakdown.income,
      positive: true,
    },
    {
      title: `Bills — ${breakdown.billsCount}`,
      subtitle: breakdown.isEstimate ? `${breakdown.billsSummaryLabel} (estimate) →` : `${breakdown.billsSummaryLabel} →`,
      value: -breakdown.billsTotal,
    },
  ];
  if (breakdown.goalAllocation > 0 && breakdown.goalLabel) {
    rows.push({
      title: breakdown.goalLabel,
      subtitle: 'Is mahine ka save',
      value: -breakdown.goalAllocation,
    });
  }
  rows.push({
    title: 'Emergency buffer',
    subtitle: breakdown.isEstimate ? 'Bills confirm hone tak reserved' : 'Side mein rakha hua',
    value: -breakdown.emergencyBuffer,
  });

  return (
    <ModalScreen visible={visible} onClose={onClose} title="Safe to spend ka hisaab">
      <Card style={styles.tableCard}>
        {rows.map((row, i) => (
          <React.Fragment key={row.title}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{row.title}</Text>
                <Text style={styles.rowSubtitle}>{row.subtitle}</Text>
              </View>
              <Text style={[styles.rowValue, row.positive && styles.rowValuePositive]}>
                {row.value >= 0 ? '+' : ''}
                {formatINR(row.value)}
              </Text>
            </View>
            <View style={styles.hairline} />
          </React.Fragment>
        ))}
        <View style={[styles.row, { paddingVertical: 12 }]}>
          <Text style={styles.totalTitle}>
            {breakdown.isEstimate ? 'Is mahine bacha · estimate' : 'Is mahine bacha'}
          </Text>
          <Text style={styles.totalValue}>{formatINR(breakdown.remaining)}</Text>
        </View>
      </Card>

      <View style={styles.divideStep}>
        <Text style={styles.divideText}>÷ {breakdown.daysRemainingInMonth} din bache</Text>
        <View style={styles.divideLine} />
      </View>

      <View style={styles.resultCard}>
        <Text style={styles.resultLabel}>= Aaj ka budget</Text>
        <Text style={styles.resultValue}>
          {breakdown.isEstimate ? '≈ ' : ''}
          {formatINR(breakdown.dailyBudget)}
        </Text>
      </View>

      <View style={styles.forecastCard}>
        <Text style={styles.forecastLabel}>Forecast</Text>
        <Text style={styles.forecastText}>{buildForecastText(forecast)}</Text>
      </View>

      <View style={styles.footerNote}>
        <Text style={styles.footerIcon}>🔒</Text>
        <Text style={styles.footerText}>
          Har number tere <Text style={styles.footerBold}>real transactions</Text> se banta hai —
          Paisa kuch guess nahi karta.{breakdown.isEstimate ? ' Kuch numbers abhi estimate hain, jab tak data pura na ho.' : ' Haath se bhi verify kar sakta hai.'}
        </Text>
      </View>
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  tableCard: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 11 },
  rowTitle: { fontFamily: fonts.sans, fontSize: 14.5, color: colors.textPrimary },
  rowSubtitle: { fontFamily: fonts.sansRegular, fontSize: 11.5, color: colors.textMuted, marginTop: 1 },
  rowValue: { fontFamily: fonts.mono, fontSize: 15, color: colors.textPrimary },
  rowValuePositive: { color: colors.hero },
  hairline: { height: 1, backgroundColor: colors.hairline },
  totalTitle: { fontFamily: fonts.sansBold, fontSize: 14.5, color: colors.textPrimary },
  totalValue: { fontFamily: fonts.mono, fontSize: 16, color: colors.textPrimary },
  divideStep: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 6, paddingTop: 14, paddingBottom: 6 },
  divideText: { fontFamily: fonts.monoRegular, fontSize: 13, color: colors.textMuted },
  divideLine: { flex: 1, height: 1, backgroundColor: colors.hairlineStrong },
  resultCard: {
    backgroundColor: colors.hero,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultLabel: { fontFamily: fonts.sans, fontSize: 14.5, color: colors.heroOnColor },
  resultValue: { fontFamily: fonts.mono, fontSize: 30, color: colors.heroOnColor, letterSpacing: -0.5 },
  forecastCard: {
    marginTop: 16,
    backgroundColor: colors.insightBadgeBg,
    borderRadius: 16,
    padding: 14,
  },
  forecastLabel: {
    fontFamily: fonts.sans,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.heroDark,
    marginBottom: 4,
  },
  forecastText: { fontFamily: fonts.sansRegular, fontSize: 13, lineHeight: 19, color: colors.heroDark },
  footerNote: { flexDirection: 'row', gap: 9, marginTop: 18, paddingTop: 4 },
  footerIcon: { fontSize: 14 },
  footerText: { flex: 1, fontFamily: fonts.sansRegular, fontSize: 12.5, lineHeight: 19, color: colors.textMuted2 },
  footerBold: { fontFamily: fonts.sans, color: colors.textPrimary },
});
