import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '../components/Card';
import SubscriptionRow from '../components/SubscriptionRow';
import CancelSubscriptionSheet from '../components/CancelSubscriptionSheet';
import { colors, fonts } from '../theme/tokens';
import { formatINR } from '../utils/format';
import { detectSubscriptionRenewalInsight } from '../engine';
import type { Bill, EngineInput } from '../engine';

interface Props {
  input: EngineInput;
}

export default function SubscriptionsScreen({ input }: Props) {
  const [cancelTarget, setCancelTarget] = useState<Bill | null>(null);

  const subscriptions = useMemo(
    () => input.bills.filter((b) => b.category === 'subscription'),
    [input.bills],
  );
  const monthlyTotal = subscriptions.reduce((sum, b) => sum + b.amount, 0);
  const insight = useMemo(() => detectSubscriptionRenewalInsight(input), [input]);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 12 }}>
          <Text style={styles.title}>Subscriptions</Text>
          {subscriptions.length > 0 && (
            <Text style={styles.subtitle}>
              {subscriptions.length} detect hue · {formatINR(monthlyTotal)}/mo
            </Text>
          )}
        </View>

        {subscriptions.length === 0 ? (
          <Card>
            <Text style={styles.emptyTitle}>Subscriptions abhi detect ho rahe hain</Text>
            <Text style={styles.emptyBody}>
              Recurring payments pakadne ke liye ek-do billing cycle dekhna padta hai — jaldi hi
              yahan dikhenge.
            </Text>
          </Card>
        ) : (
          <>
            {insight && (
              <View style={styles.alertBanner}>
                <Text style={styles.alertText}>
                  ⚠ {insight.windowDays} din mein {insight.merchants.length} renew hue —{' '}
                  {insight.merchants.join(', ')}.{' '}
                  <Text style={styles.alertAmount}>{formatINR(insight.totalAmount)}</Text>.
                </Text>
              </View>
            )}
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              {subscriptions.map((sub, i) => (
                <React.Fragment key={sub.id}>
                  <SubscriptionRow bill={sub} today={input.today} onCancel={() => setCancelTarget(sub)} />
                  {i < subscriptions.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </Card>
            <View style={styles.footerNote}>
              <Text style={styles.footerIcon}>↗</Text>
              <Text style={styles.footerText}>
                Cancel tujhe provider ke page pe le jayega — Paisa khud cancel nahi karta.
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      <CancelSubscriptionSheet
        visible={!!cancelTarget}
        subscriptionName={cancelTarget?.name ?? null}
        cancelUrl={cancelTarget?.cancelUrl ?? null}
        onClose={() => setCancelTarget(null)}
      />
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
  alertBanner: { backgroundColor: colors.warnBg, borderRadius: 16, padding: 13, marginBottom: 12 },
  alertText: { fontFamily: fonts.sansRegular, fontSize: 13, lineHeight: 19, color: '#7a4e22' },
  alertAmount: { fontFamily: fonts.sans, color: '#7a4e22' },
  divider: { height: 1, backgroundColor: colors.hairline, marginHorizontal: 15 },
  footerNote: { flexDirection: 'row', gap: 8, paddingTop: 10, paddingHorizontal: 4 },
  footerIcon: { fontSize: 11.5, color: colors.textMuted },
  footerText: { flex: 1, fontFamily: fonts.sansRegular, fontSize: 11.5, lineHeight: 17, color: colors.textMuted },
});
