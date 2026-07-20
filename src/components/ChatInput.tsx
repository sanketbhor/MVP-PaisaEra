import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts, radii } from '../theme/tokens';

interface Props {
  remaining: number;
  dailyLimit: number;
  onSend: (text: string) => void;
}

export default function ChatInput({ remaining, dailyLimit, onSend }: Props) {
  const [value, setValue] = useState('');
  const limitReached = remaining <= 0;

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || limitReached) return;
    onSend(trimmed);
    setValue('');
  };

  return (
    <View style={styles.wrap}>
      <TextInput
        value={value}
        onChangeText={setValue}
        onSubmitEditing={handleSend}
        editable={!limitReached}
        placeholder={limitReached ? 'Aaj ke messages khatam — kal phir try kar' : `Type kar… (aaj ${remaining}/${dailyLimit} free)`}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        returnKeyType="send"
      />
      <Pressable
        onPress={handleSend}
        disabled={limitReached || !value.trim()}
        accessibilityRole="button"
        accessibilityLabel="Send"
        style={[styles.sendBtn, (limitReached || !value.trim()) && styles.sendBtnDisabled]}
      >
        <Text style={styles.sendIcon}>↑</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.cardBg,
    borderRadius: radii.input,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#1e1912',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 3,
  },
  input: { flex: 1, fontFamily: fonts.sansRegular, fontSize: 14, color: colors.textPrimary, paddingVertical: 4 },
  sendBtn: {
    width: 30,
    height: 30,
    borderRadius: radii.iconBtn,
    backgroundColor: colors.hero,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.trackBg },
  sendIcon: { color: '#fff', fontSize: 14 },
});
