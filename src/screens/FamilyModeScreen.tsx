import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '../components/Card';
import BudgetCategoryCard from '../components/BudgetCategoryCard';
import { colors, fonts } from '../theme/tokens';
import { formatINR } from '../utils/format';
import { familyHouseholdBudget, familyHouseholdName, familyMembers, familyRoleLabel } from '../engine';

interface Props {
  onBack: () => void;
}

export default function FamilyModeScreen({ onBack }: Props) {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable onPress={onBack} accessibilityRole="button" style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <View>
            <Text style={styles.title}>Family mode</Text>
            <Text style={styles.subtitle}>
              1 household · {familyMembers.length} members
            </Text>
          </View>
        </View>

        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Ek household budget, members ke roles ke saath. Bachchon ke allowance track hote hain, unke
            bank accounts nahi.
          </Text>
        </View>

        <View style={{ marginBottom: 14 }}>
          <BudgetCategoryCard budget={{ ...familyHouseholdBudget, category: familyHouseholdName }} />
        </View>

        <Text style={styles.sectionLabel}>Members</Text>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {familyMembers.map((member, i) => (
            <React.Fragment key={member.id}>
              <View style={styles.memberRow}>
                <View style={[styles.avatar, { backgroundColor: member.color }]}>
                  <Text style={styles.avatarText}>{member.initial}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberRole}>{familyRoleLabel[member.role]}</Text>
                </View>
                <Text style={styles.memberAmount}>{formatINR(member.amount)}</Text>
              </View>
              {i < familyMembers.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
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
  banner: { backgroundColor: colors.insightBadgeBg, borderRadius: 16, padding: 13, marginBottom: 14 },
  bannerText: { fontFamily: fonts.sansRegular, fontSize: 12.5, lineHeight: 19, color: colors.heroDark },
  sectionLabel: {
    fontFamily: fonts.sans,
    fontSize: 11.5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 8,
  },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 15 },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.sansBold, fontSize: 13, color: '#fff' },
  memberName: { fontFamily: fonts.sans, fontSize: 14, color: colors.textPrimary },
  memberRole: { fontFamily: fonts.sansRegular, fontSize: 11.5, color: colors.textMuted, marginTop: 1 },
  memberAmount: { fontFamily: fonts.monoRegular, fontSize: 12.5, color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.hairline, marginHorizontal: 15 },
});
