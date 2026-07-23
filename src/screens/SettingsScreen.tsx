import React, { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '../components/Card';
import DeleteAccountSheet from '../components/DeleteAccountSheet';
import { colors, fonts, radii } from '../theme/tokens';
import { computeNotificationCadence } from '../engine';
import type { CadencePreference } from '../engine';
import type { SyncResult } from '../sms';

const CADENCE_OPTIONS: { key: CadencePreference; label: string }[] = [
  { key: 'low', label: 'Kam' },
  { key: 'auto', label: 'Auto (learning)' },
  { key: 'high', label: 'Zyada' },
];

interface Props {
  daysSinceInstall: number;
  appOpensLast7Days: number;
  onBack: () => void;
  onOpenFeedback: () => void;
  onSyncSmsNow: () => Promise<SyncResult | null>;
  // Lifted to MainApp rather than kept as local state here — MainApp
  // conditionally renders this screen per-tab, so it fully unmounts on
  // every tab switch and any state kept only here resets on return
  // (confirmed live: the SMS-fallback toggle flipped back off after
  // navigating away and back).
  cadencePreference: CadencePreference;
  onChangeCadencePreference: (pref: CadencePreference) => void;
  smsFallbackEnabled: boolean;
  onToggleSmsFallback: () => void;
}

export default function SettingsScreen({
  daysSinceInstall,
  appOpensLast7Days,
  onBack,
  onOpenFeedback,
  onSyncSmsNow,
  cadencePreference,
  onChangeCadencePreference,
  smsFallbackEnabled,
  onToggleSmsFallback,
}: Props) {
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleSyncNow = async () => {
    setSyncing(true);
    setSyncMessage(null);
    const result = await onSyncSmsNow();
    setSyncing(false);
    if (!result) {
      setSyncMessage('Login session nahi mila — dobara try karo.');
    } else if (!result.ok) {
      setSyncMessage(
        result.error === 'unsupported_platform'
          ? 'Yeh sirf Android par kaam karta hai.'
          : 'Sync fail ho gaya — dobara try karo.',
      );
    } else {
      setSyncMessage(`${result.scanned} SMS dekhe, ${result.uploaded} naye transactions mile.`);
    }
  };

  const cadence = useMemo(
    () => computeNotificationCadence({ daysSinceInstall, appOpensLast7Days, preference: cadencePreference }),
    [daysSinceInstall, appOpensLast7Days, cadencePreference],
  );

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable onPress={onBack} accessibilityRole="button" style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text style={styles.title}>Notifications &amp; data</Text>
        </View>

        <Card style={{ marginBottom: 12 }}>
          <Text style={styles.cardTitle}>Kitni baar sunoge?</Text>
          <Text style={styles.cardBody}>
            Main dekhunga tum kitna kholte ho aur khud adjust kar lunga — par control tumhare paas hai.
          </Text>
          <View style={styles.pillRow}>
            {CADENCE_OPTIONS.map((opt) => {
              const selected = opt.key === cadencePreference;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => onChangeCadencePreference(opt.key)}
                  accessibilityRole="button"
                  style={[styles.pill, selected && styles.pillSelected]}
                >
                  <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.cadenceNote}>
            Abhi: din mein ~{cadence.notificationsPerDay} baar · bade kharche pe hamesha. ({cadence.basis})
          </Text>
        </Card>

        <Card style={{ marginBottom: 12 }}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>SMS se fallback data lo</Text>
              <Text style={styles.rowSubtext}>
                Jab bank link na ho paye, SMS se transactions padhega — sirf tab jab tu on kare
              </Text>
            </View>
            <Pressable
              onPress={onToggleSmsFallback}
              accessibilityRole="switch"
              accessibilityState={{ checked: smsFallbackEnabled }}
              style={[styles.toggle, smsFallbackEnabled && styles.toggleOn]}
            >
              <View style={[styles.toggleKnob, smsFallbackEnabled && styles.toggleKnobOn]} />
            </Pressable>
          </View>
        </Card>

        {Platform.OS === 'android' && (
          <Card style={{ marginBottom: 12 }}>
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>SMS se abhi sync karo</Text>
                <Text style={styles.rowSubtext}>Pichle 90 din ke transaction SMS dobara scan karo</Text>
              </View>
              <Pressable
                onPress={handleSyncNow}
                disabled={syncing}
                accessibilityRole="button"
                style={[styles.syncBtn, syncing && styles.syncBtnBusy]}
              >
                <Text style={styles.syncBtnText}>{syncing ? 'Sync ho raha...' : 'Sync karo'}</Text>
              </Pressable>
            </View>
            {syncMessage && <Text style={styles.syncMessage}>{syncMessage}</Text>}
          </Card>
        )}

        <Card style={{ padding: 0, overflow: 'hidden', marginBottom: 12 }}>
          <View style={styles.row}>
            <Text style={styles.rowIcon}>⬇</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Data export karo</Text>
              <Text style={styles.rowSubtext}>Poora data CSV/JSON mein — jab chaho</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowIcon}>↩</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>AA consent revoke karo</Text>
              <Text style={styles.rowSubtext}>Bank access turant band</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>
          <View style={styles.divider} />
          <Pressable onPress={onOpenFeedback} accessibilityRole="button" style={styles.row}>
            <Text style={styles.rowIcon}>💬</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Feedback bhejo</Text>
              <Text style={styles.rowSubtext}>Beta hai — jo kharab laga bata do</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </Card>

        <Pressable onPress={() => setShowDeleteSheet(true)} accessibilityRole="button">
          <Card style={styles.deleteCard}>
            <Text style={styles.rowIcon}>🗑</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.deleteLabel}>Account delete karo</Text>
              <Text style={styles.rowSubtext}>Sab data hamesha ke liye mit jayega</Text>
            </View>
          </Card>
        </Pressable>
      </ScrollView>

      <DeleteAccountSheet visible={showDeleteSheet} onClose={() => setShowDeleteSheet(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screenBg },
  scrollContent: { padding: 24, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
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
  cardTitle: { fontFamily: fonts.sans, fontSize: 14, color: colors.textPrimary, marginBottom: 4 },
  cardBody: { fontFamily: fonts.sansRegular, fontSize: 12.5, lineHeight: 19, color: colors.textMuted, marginBottom: 14 },
  pillRow: { flexDirection: 'row', gap: 8 },
  pill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
  },
  pillSelected: { backgroundColor: colors.hero, borderColor: colors.hero },
  pillText: { fontFamily: fonts.sans, fontSize: 12, color: colors.textPrimary },
  pillTextSelected: { color: colors.heroOnColor },
  cadenceNote: { fontFamily: fonts.sansRegular, fontSize: 11.5, color: colors.textMuted, marginTop: 10 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggle: { width: 44, height: 26, borderRadius: 13, backgroundColor: colors.trackBg, padding: 3, justifyContent: 'center' },
  toggleOn: { backgroundColor: colors.hero },
  toggleKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  toggleKnobOn: { alignSelf: 'flex-end' },
  syncBtn: { backgroundColor: colors.hero, borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 9 },
  syncBtnBusy: { opacity: 0.6 },
  syncBtnText: { fontFamily: fonts.sansBold, fontSize: 12.5, color: colors.heroOnColor },
  syncMessage: { fontFamily: fonts.sansRegular, fontSize: 12, color: colors.textMuted, marginTop: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 15 },
  rowIcon: { width: 22, textAlign: 'center', fontSize: 15 },
  rowLabel: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.textPrimary },
  rowSubtext: { fontFamily: fonts.sansRegular, fontSize: 11.5, color: colors.textMuted, marginTop: 1 },
  chevron: { fontFamily: fonts.sansRegular, fontSize: 12.5, color: colors.textMuted },
  divider: { height: 1, backgroundColor: colors.hairline, marginHorizontal: 15 },
  deleteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(166,103,46,.35)',
  },
  deleteLabel: { fontFamily: fonts.sans, fontSize: 14, color: colors.warnText },
});
