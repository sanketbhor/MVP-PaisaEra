import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Card from './Card';
import { colors, fonts } from '../theme/tokens';
import { formatINR } from '../utils/format';
import { formatMonthName } from '../utils/formatDate';
import { computeGoalProgressPct, computeGoalStatus } from '../engine';
import type { Goal } from '../engine';
import { buildGoalStatusText } from '../explain';

interface Props {
  goal: Goal;
  today: string;
}

export default function GoalCard({ goal, today }: Props) {
  const pct = computeGoalProgressPct(goal);
  const status = computeGoalStatus(goal, today);
  const statusText = buildGoalStatusText(goal, status);

  return (
    <Card>
      <View style={styles.headerRow}>
        <Text style={styles.name}>
          {goal.emoji} {goal.name}
        </Text>
        <View style={[styles.badge, status.isOnTrack ? styles.badgeOnTrack : styles.badgeBehind]}>
          <Text style={[styles.badgeText, { color: status.isOnTrack ? colors.hero : colors.warnText }]}>
            {status.isOnTrack ? 'ON TRACK' : 'BEHIND'}
          </Text>
        </View>
      </View>
      <Text style={styles.progressLine}>
        <Text style={styles.savedAmount}>{formatINR(goal.savedAmount)}</Text> / {formatINR(goal.targetAmount)} ·{' '}
        {formatMonthName(goal.deadlineDate)} tak
      </Text>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${pct * 100}%`, backgroundColor: status.isOnTrack ? colors.hero : colors.warnText },
          ]}
        />
      </View>
      <Text style={[styles.statusText, { color: status.isOnTrack ? colors.textMuted2 : colors.warnText }]}>
        {statusText}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  name: { fontFamily: fonts.sans, fontSize: 15.5, color: colors.textPrimary },
  badge: { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4 },
  badgeOnTrack: { backgroundColor: colors.insightBadgeBg },
  badgeBehind: { backgroundColor: colors.warnBg },
  badgeText: { fontFamily: fonts.sansBold, fontSize: 11.5 },
  progressLine: { fontFamily: fonts.monoRegular, fontSize: 12.5, color: colors.textMuted, marginBottom: 10 },
  savedAmount: { fontFamily: fonts.mono, color: colors.textPrimary },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.trackBg, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  statusText: { fontFamily: fonts.sansRegular, fontSize: 12.5, lineHeight: 18, marginTop: 9 },
});
