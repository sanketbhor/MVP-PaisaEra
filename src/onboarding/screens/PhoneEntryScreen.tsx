import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { colors, fonts } from '../../theme/tokens';
import { sendOtp } from '../../auth';

interface Props {
  phoneLocal: string;
  onChangePhone: (value: string) => void;
  onBack: () => void;
  onSent: (cooldownSeconds: number, demoCode?: string) => void;
}

export default function PhoneEntryScreen({ phoneLocal, onChangePhone, onBack, onSent }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    setError(null);
    setLoading(true);
    const result = await sendOtp(phoneLocal);
    setLoading(false);
    if (result.ok) {
      onSent(result.cooldownSeconds, result.demoCode);
      return;
    }
    if (result.error === 'invalid_phone') setError('Sahi 10-digit mobile number daalo.');
    else if (result.error === 'rate_limited') setError(`Bahut baar try kiya — ${result.retryAfterSeconds}s baad phir try karo.`);
    else setError('Kuch gadbad ho gayi. Phir try karo.');
  };

  return (
    <View style={styles.screen}>
      <Pressable onPress={onBack} accessibilityRole="button" style={styles.backBtn}>
        <Text style={styles.backIcon}>←</Text>
      </Pressable>

      <Text style={styles.title}>Phone Number</Text>
      <Text style={styles.subtitle}>Taaki data sirf tumhara rahe aur account secure ho. Bas itna — koi email nahi.</Text>

      <View style={styles.inputRow}>
        <View style={styles.prefixBox}>
          <Text style={styles.prefixText}>+91</Text>
        </View>
        <TextInput
          value={phoneLocal}
          onChangeText={(v) => onChangePhone(v.replace(/\D/g, '').slice(0, 10))}
          keyboardType="number-pad"
          placeholder="98765 43210"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          maxLength={10}
          autoFocus
        />
      </View>

      <View style={styles.lockRow}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.lockText}>Number verify karne ke liye ek OTP bhejenge.</Text>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={{ flex: 1 }} />
      <PrimaryButton label="OTP bhejo" onPress={handleSend} disabled={phoneLocal.length !== 10} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 26, paddingTop: 12 },
  backBtn: { width: 34, marginBottom: 22 },
  backIcon: { fontSize: 20, color: colors.textPrimary },
  title: { fontFamily: fonts.sans, fontSize: 24, letterSpacing: -0.3, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.sansRegular, fontSize: 14, lineHeight: 21, color: colors.textMuted2, marginTop: 8 },
  inputRow: { flexDirection: 'row', gap: 10, marginTop: 26 },
  prefixBox: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    paddingHorizontal: 14,
    justifyContent: 'center',
    shadowColor: '#1e1912',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 3,
  },
  prefixText: { fontFamily: fonts.mono, fontSize: 17, color: colors.textPrimary },
  input: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontFamily: fonts.mono,
    fontSize: 17,
    letterSpacing: 1,
    color: colors.textPrimary,
    shadowColor: '#1e1912',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 3,
  },
  lockRow: { flexDirection: 'row', gap: 8, marginTop: 16, alignItems: 'flex-start' },
  lockIcon: { fontSize: 12 },
  lockText: { flex: 1, fontFamily: fonts.sansRegular, fontSize: 12, lineHeight: 17, color: colors.textMuted },
  error: { fontFamily: fonts.sansMedium, fontSize: 12.5, color: colors.warnText, marginTop: 14 },
});
