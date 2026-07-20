import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ModalScreen from './ModalScreen';
import Card from './Card';
import { colors, confidenceBarsFilled, fonts } from '../theme/tokens';
import { formatINR } from '../utils/format';
import type { WhyThisData } from '../explain';

interface Props {
  visible: boolean;
  onClose: () => void;
  data: WhyThisData;
}

export default function WhyThisModal({ visible, onClose, data }: Props) {
  const filled = confidenceBarsFilled[data.confidence];

  return (
    <ModalScreen visible={visible} onClose={onClose} title="Yeh insight kyun?">
      <View style={styles.quoteBox}>
        <Text style={styles.quoteText}>{data.headline}</Text>
      </View>

      <Text style={styles.sectionLabel}>Yeh kis data pe based hai</Text>
      <View style={{ gap: 11 }}>
        {data.dataPointsUsed.map((point) => (
          <View key={point} style={styles.bulletRow}>
            <Text style={[styles.bulletMark, { color: colors.hero }]}>✓</Text>
            <Text style={styles.bulletText}>{point}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Abhi kya missing hai</Text>
      <View style={{ gap: 11 }}>
        {data.missingData.map((point) => (
          <View key={point} style={styles.bulletRow}>
            <Text style={[styles.bulletMark, { color: colors.warnText }]}>–</Text>
            <Text style={[styles.bulletText, { color: colors.textMuted2 }]}>{point}</Text>
          </View>
        ))}
      </View>

      {data.sourceRecords.length > 0 && (
        <>
          <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Source records</Text>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {data.sourceRecords.map((record, i) => (
              <React.Fragment key={`${record.label}-${i}`}>
                <View style={styles.sourceRow}>
                  <Text style={styles.sourceIcon}>{record.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sourceLabel}>{record.label}</Text>
                    {record.dateLabel && <Text style={styles.sourceDate}>{record.dateLabel}</Text>}
                  </View>
                  {record.amount !== null && (
                    <Text style={styles.sourceAmount}>{formatINR(record.amount)}</Text>
                  )}
                </View>
                {i < data.sourceRecords.length - 1 && <View style={styles.sourceDivider} />}
              </React.Fragment>
            ))}
          </Card>
        </>
      )}

      <Card style={styles.confidenceCard}>
        <View style={styles.confidenceHeader}>
          <Text style={styles.confidenceLabel}>Confidence</Text>
          <Text style={styles.confidenceValue}>
            {data.confidence === 'high' ? 'High' : data.confidence === 'building' ? 'Building' : 'Growing'}
          </Text>
        </View>
        <View style={styles.barsRow}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[styles.bar, { backgroundColor: i < filled ? colors.hero : '#e8e6df' }]}
            />
          ))}
        </View>
        <Text style={styles.confidenceNote}>{data.confidenceNote}</Text>
      </Card>
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  quoteBox: {
    backgroundColor: colors.insightBadgeBg,
    borderRadius: 18,
    padding: 15,
    marginBottom: 20,
  },
  quoteText: { fontFamily: fonts.sansRegular, fontSize: 14, lineHeight: 21, color: colors.heroDark },
  sectionLabel: {
    fontFamily: fonts.sans,
    fontSize: 11.5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 10,
  },
  bulletRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  bulletMark: { fontSize: 14, marginTop: 1 },
  bulletText: { flex: 1, fontFamily: fonts.sansRegular, fontSize: 13.5, lineHeight: 19, color: colors.textPrimary },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 12, paddingHorizontal: 15 },
  sourceIcon: { fontSize: 16 },
  sourceLabel: { fontFamily: fonts.sans, fontSize: 13.5, color: colors.textPrimary },
  sourceDate: { fontFamily: fonts.sansRegular, fontSize: 11.5, color: colors.textMuted, marginTop: 1 },
  sourceAmount: { fontFamily: fonts.mono, fontSize: 13, color: colors.textPrimary },
  sourceDivider: { height: 1, backgroundColor: colors.hairline, marginHorizontal: 15 },
  confidenceCard: { marginTop: 20 },
  confidenceHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  confidenceLabel: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.textMuted },
  confidenceValue: { fontFamily: fonts.sansBold, fontSize: 13, color: colors.hero },
  barsRow: { flexDirection: 'row', gap: 5 },
  bar: { flex: 1, height: 6, borderRadius: 3 },
  confidenceNote: { fontFamily: fonts.sansRegular, fontSize: 12.5, lineHeight: 19, color: colors.textMuted2, marginTop: 9 },
});
