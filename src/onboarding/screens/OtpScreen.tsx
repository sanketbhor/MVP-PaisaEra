import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { colors, fonts } from '../../theme/tokens';
import { sendOtp, verifyOtp } from '../../auth';
import type { AppSession } from '../../auth';

interface Props {
  phoneLocal: string;
  initialCooldownSeconds: number;
  demoCode?: string;
  onBack: () => void;
  onVerified: (session: AppSession) => void;
}

export default function OtpScreen({ phoneLocal, initialCooldownSeconds, demoCode, onBack, onVerified }: Props) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<'invalid_code' | 'expired_code' | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(initialCooldownSeconds);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(c - 1, 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleVerify = async (submittedCode: string) => {
    if (submittedCode.length !== 6) return;
    setVerifying(true);
    setError(null);
    const result = await verifyOtp(phoneLocal, submittedCode);
    setVerifying(false);
    if (result.ok) {
      onVerified(result.session);
      return;
    }
    if (result.error === 'invalid_code' || result.error === 'expired_code') {
      setError(result.error);
    } else {
      setError('invalid_code');
    }
  };

  const handleChangeCode = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    setCode(digits);
    setError(null);
    if (digits.length === 6) handleVerify(digits);
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    const result = await sendOtp(phoneLocal);
    setResending(false);
    if (result.ok) {
      setCooldown(result.cooldownSeconds);
      setCode('');
    }
  };

  const minutes = Math.floor(cooldown / 60);
  const seconds = String(cooldown % 60).padStart(2, '0');

  return (
    <View style={styles.screen}>
      <Pressable onPress={onBack} accessibilityRole="button" style={styles.backBtn}>
        <Text style={styles.backIcon}>←</Text>
      </Pressable>

      <Text style={styles.title}>OTP</Text>
      <Text style={styles.subtitle}>
        +91 {phoneLocal} pe 6-digit code bheja.{demoCode ? ` Demo mode: ${demoCode} use karo.` : ''}
      </Text>

      <Pressable onPress={() => inputRef.current?.focus()} style={styles.otpRow}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={[styles.otpBox, error && styles.otpBoxErr, !error && code.length === i && styles.otpBoxActive]}>
            <Text style={styles.otpDigit}>{code[i] ?? ''}</Text>
          </View>
        ))}
      </Pressable>
      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={handleChangeCode}
        keyboardType="number-pad"
        maxLength={6}
        style={styles.hiddenInput}
        autoFocus
      />

      {error && (
        <Text style={styles.error}>
          {error === 'expired_code' ? 'Code expire ho gaya — naya code mangwao.' : 'Galat ya expired code — dobara try karo.'}
        </Text>
      )}

      <View style={styles.resendRow}>
        {cooldown > 0 ? (
          <Text style={styles.resendLabel}>
            Resend in {minutes}:{seconds}
          </Text>
        ) : (
          <Pressable onPress={handleResend} disabled={resending} accessibilityRole="button">
            <Text style={styles.resendLink}>{resending ? 'Bhej rahe hain…' : 'Naya code bhejo'}</Text>
          </Pressable>
        )}
      </View>

      <View style={{ flex: 1 }} />
      <PrimaryButton label="Verify karo" onPress={() => handleVerify(code)} disabled={code.length !== 6} loading={verifying} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 26, paddingTop: 12 },
  backBtn: { width: 34, marginBottom: 22 },
  backIcon: { fontSize: 20, color: colors.textPrimary },
  title: { fontFamily: fonts.sans, fontSize: 24, letterSpacing: -0.3, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.sansRegular, fontSize: 14, lineHeight: 21, color: colors.textMuted2, marginTop: 8 },
  otpRow: { flexDirection: 'row', gap: 9, marginTop: 26 },
  otpBox: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: colors.cardBg,
    borderWidth: 1.5,
    borderColor: colors.hairlineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxActive: { borderColor: colors.hero },
  otpBoxErr: { borderColor: colors.warnText },
  otpDigit: { fontFamily: fonts.mono, fontSize: 22, color: colors.textPrimary },
  hiddenInput: { position: 'absolute', opacity: 0, height: 0, width: 0 },
  error: { fontFamily: fonts.sansMedium, fontSize: 12.5, color: colors.warnText, marginTop: 12 },
  resendRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  resendLabel: { fontFamily: fonts.sansRegular, fontSize: 12.5, color: colors.textMuted },
  resendLink: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.hero },
});
