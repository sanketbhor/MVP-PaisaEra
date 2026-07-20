import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '../components/Card';
import GoalCard from '../components/GoalCard';
import { colors, fonts } from '../theme/tokens';
import { formatINR } from '../utils/format';
import { computeCoupleExpenseSplit, coupleMembers, couplePartnerNames, coupleSharedGoal } from '../engine';

interface Props {
  today: string;
  onBack: () => void;
}

export default function CoupleModeScreen({ today, onBack }: Props) {
  const split = useMemo(() => computeCoupleExpenseSplit(coupleMembers), []);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable onPress={onBack} accessibilityRole="button" style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <View>
            <Text style={styles.title}>Couple mode</Text>
            <Text style={styles.subtitle}>
              {couplePartnerNames.a} &amp; {couplePartnerNames.b} · dono ne consent diya
            </Text>
          </View>
        </View>

        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Sirf shared expenses aur common goals dikhte hain — ek doosre ke private transactions nahi.
            Transparency, surveillance nahi.
          </Text>
        </View>

        <Card style={{ marginBottom: 12 }}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>Shared kharcha · July</Text>
            <Text style={styles.totalAmount}>{formatINR(split.total)}</Text>
          </View>
          {split.splits.map((s) => {
            const member = coupleMembers.find((m) => m.id === s.memberId)!;
            return (
              <View key={s.memberId} style={styles.memberRow}>
                <View style={[styles.avatar, { backgroundColor: member.color }]}>
                  <Text style={styles.avatarText}>{member.initial}</Text>
                </View>
                <View style={styles.memberTrack}>
                  <View style={[styles.memberFill, { width: `${s.pct * 100}%`, backgroundColor: member.color }]} />
                </View>
                <Text style={styles.memberAmount}>{formatINR(s.amount)}</Text>
              </View>
            );
          })}
        </Card>

        <GoalCard goal={coupleSharedGoal} today={today} />
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
  banner: { backgroundColor: '#e9e3f0', borderRadius: 16, padding: 13, marginBottom: 14 },
  bannerText: { fontFamily: fonts.sansRegular, fontSize: 12.5, lineHeight: 19, color: '#5a4a72' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  cardTitle: { fontFamily: fonts.sans, fontSize: 14, color: colors.textPrimary },
  totalAmount: { fontFamily: fonts.mono, fontSize: 14, color: colors.textPrimary },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  avatar: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.sansBold, fontSize: 12, color: '#fff' },
  memberTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.trackBg, overflow: 'hidden' },
  memberFill: { height: '100%', borderRadius: 4 },
  memberAmount: { fontFamily: fonts.monoRegular, fontSize: 12, color: colors.textPrimary },
});
