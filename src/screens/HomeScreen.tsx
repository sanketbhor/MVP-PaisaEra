import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import SafeToSpendHero from '../components/SafeToSpendHero';
import BillCard from '../components/BillCard';
import InsightCard from '../components/InsightCard';
import { GoalProgressCard, NoGoalCard } from '../components/GoalProgressCard';
import AskPaisaInput from '../components/AskPaisaInput';
import SafeToSpendExpandedModal from '../components/SafeToSpendExpandedModal';
import WhyThisModal from '../components/WhyThisModal';
import Card from '../components/Card';
import { colors, fonts, radii } from '../theme/tokens';
import { formatGreetingDate } from '../utils/formatDate';
import { formatINR } from '../utils/format';
import {
  BILL_ALERT_RULES,
  computeSafeToSpend,
  detectSubscriptionRenewalInsight,
} from '../engine';
import type { EngineInput } from '../engine';
import { buildGenericWhyThis, buildSubscriptionInsightText, buildSubscriptionWhyThis } from '../explain';
import type { TabKey } from '../navigation/BottomNav';

interface Props {
  input: EngineInput;
  userName: string;
  isDay1: boolean;
  onToggleDay1: () => void;
  onNavigate: (tab: TabKey) => void;
}

export default function HomeScreen({ input, userName, isDay1, onToggleDay1, onNavigate }: Props) {
  const [expandedOpen, setExpandedOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);

  const sts = useMemo(() => computeSafeToSpend(input), [input]);
  const subscriptionInsight = useMemo(() => detectSubscriptionRenewalInsight(input), [input]);

  const whyThisData = useMemo(() => {
    return subscriptionInsight
      ? buildSubscriptionWhyThis(input, subscriptionInsight)
      : buildGenericWhyThis(input);
  }, [input, subscriptionInsight]);

  const insightLabel = subscriptionInsight ? 'Aaj ka insight' : 'Abhi ke liye';
  const insightBody = subscriptionInsight
    ? buildSubscriptionInsightText(subscriptionInsight)
    : 'Main abhi tera pattern seekh raha hoon. 3-4 hafte baad clearly bata paunga ki paisa kaha ja raha hai. Tab tak — koi fake advice nahi.';

  const daysUntil = (dateISO: string) =>
    Math.round((new Date(dateISO).getTime() - new Date(input.today).getTime()) / (1000 * 60 * 60 * 24));

  // Subscriptions auto-renew and get their own screen — only bills that need the
  // user's attention (utilities, rent, etc.) surface as a "due this week" alert here.
  const dueThisWeek = input.bills
    .filter(
      (b) =>
        b.category !== 'subscription' &&
        b.dueDate &&
        daysUntil(b.dueDate) >= 0 &&
        daysUntil(b.dueDate) <= BILL_ALERT_RULES.DUE_SOON_WINDOW_DAYS,
    )
    .sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate));
  const nextBill = dueThisWeek[0] ?? null;
  const moreCount = dueThisWeek.length - 1;
  const dueDaysAway = nextBill ? daysUntil(nextBill.dueDate) : null;
  const dueLabel = dueDaysAway === 0 ? 'Aaj due' : dueDaysAway === 1 ? 'Kal due' : `${dueDaysAway} din mein`;

  const primaryGoal = input.goals[0] ?? null;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greetingTitle}>Good morning, {userName} ☀</Text>
            <Text style={styles.greetingSubtitle}>
              {isDay1
                ? `Bas ${input.daysTrackedWithApp} din saath — abhi seekh raha hoon 👋`
                : formatGreetingDate(input.today)}
            </Text>
          </View>
          <Pressable onPress={onToggleDay1} accessibilityRole="button" style={styles.dayPill}>
            <Text style={styles.dayPillText}>{isDay1 ? 'Day 30 →' : 'Day 4 →'}</Text>
          </Pressable>
        </View>

        {sts.income > 0 ? (
          <SafeToSpendHero
            breakdown={sts}
            subLabel={
              isDay1
                ? 'Salary aur ab tak ke kharchon se'
                : `${formatINR(sts.remaining)} bacha · ${sts.daysRemainingInMonth} din`
            }
            ctaLabel={isDay1 ? 'Kya missing? →' : 'Hisaab dekh →'}
            onPress={() => setExpandedOpen(true)}
          />
        ) : (
          // Genuinely no income has been observed yet (a fresh manual-entry
          // signup, before anything's been added) — showing "₹0" here would
          // read as a real answer instead of an honest unknown, so this
          // replaces the hero entirely rather than rendering it with a zero.
          <Card style={styles.unknownIncomeCard}>
            <Text style={styles.unknownIncomeTitle}>Safe to Spend abhi calculate nahi kar sakte</Text>
            <Text style={styles.unknownIncomeBody}>
              Income detect nahi hui abhi. Bank link karo ya apna pehla kharcha add karo — tabhi hisaab
              shuru hoga.
            </Text>
          </Card>
        )}

        {isDay1 ? (
          <BillCard
            title="Bills detect ho rahe hain"
            amount={null}
            subtitle="1-2 cycle baad pakka bataunga"
            tag="Soon"
            onPress={() => onNavigate('subscriptions')}
          />
        ) : (
          nextBill && (
            <BillCard
              title={`⚠ ${nextBill.name}`}
              amount={formatINR(nextBill.amount)}
              subtitle={moreCount > 0 ? `+ ${moreCount} aur ${moreCount === 1 ? 'bill' : 'bills'} is hafte` : ''}
              tag={dueLabel}
              onPress={() => onNavigate('subscriptions')}
            />
          )
        )}

        <InsightCard label={insightLabel} body={insightBody} onPressWhy={() => setWhyOpen(true)} />

        {primaryGoal ? (
          <Pressable onPress={() => onNavigate('goals')} accessibilityRole="button">
            <GoalProgressCard goal={primaryGoal} today={input.today} />
          </Pressable>
        ) : (
          <NoGoalCard onPress={() => onNavigate('goals')} />
        )}

        <View style={styles.hubRow}>
          {(
            [
              { tab: 'transactions', icon: '≣', label: 'Transactions' },
              { tab: 'budgets', icon: '◐', label: 'Budgets' },
              { tab: 'subscriptions', icon: '↻', label: 'Subs' },
            ] as const
          ).map((item) => (
            <Pressable key={item.tab} onPress={() => onNavigate(item.tab)} accessibilityRole="button" style={styles.hubItem}>
              <Card style={styles.hubCard}>
                <Text style={styles.hubIcon}>{item.icon}</Text>
                <Text style={styles.hubLabel}>{item.label}</Text>
              </Card>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <AskPaisaInput onPress={() => onNavigate('chat')} />
      </View>

      <SafeToSpendExpandedModal
        visible={expandedOpen}
        onClose={() => setExpandedOpen(false)}
        input={input}
        breakdown={sts}
      />
      <WhyThisModal visible={whyOpen} onClose={() => setWhyOpen(false)} data={whyThisData} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screenBg },
  scrollContent: { padding: 24, paddingBottom: 12, gap: 14 },
  greetingRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 6, marginBottom: 2 },
  greetingTitle: { fontFamily: fonts.sans, fontSize: 21, letterSpacing: -0.2, color: colors.textPrimary },
  greetingSubtitle: { fontFamily: fonts.sansRegular, fontSize: 13, color: colors.textMuted, marginTop: 3 },
  dayPill: { backgroundColor: 'rgba(33,30,25,.07)', borderRadius: radii.pill, paddingHorizontal: 11, paddingVertical: 6 },
  dayPillText: { fontFamily: fonts.sans, fontSize: 12, color: colors.textMuted2 },
  footer: { paddingHorizontal: 24, paddingBottom: 20, paddingTop: 8, backgroundColor: colors.screenBg },
  hubRow: { flexDirection: 'row', gap: 10 },
  hubItem: { flex: 1 },
  hubCard: { alignItems: 'flex-start', paddingVertical: 13, paddingHorizontal: 12 },
  hubIcon: { fontSize: 16 },
  hubLabel: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.textPrimary, marginTop: 5 },
  unknownIncomeCard: { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.dashedBorder },
  unknownIncomeTitle: { fontFamily: fonts.sans, fontSize: 14.5, color: colors.textPrimary, marginBottom: 6 },
  unknownIncomeBody: { fontFamily: fonts.sansRegular, fontSize: 13, lineHeight: 20, color: colors.textMuted2 },
});
