import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import BottomSheet from './BottomSheet';
import { colors, fonts, radii } from '../theme/tokens';

interface Props {
  visible: boolean;
  onClose: () => void;
  onUnlock: () => void;
}

// Prototype note: "unlock" just flips a local isPro flag — this app has no
// payment integration, and nothing here initiates a real charge.
export default function ProUpsellSheet({ visible, onClose, onUnlock }: Props) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Papa & Mom — Pro mein"
      body="Friend hamesha free hai. Papa (Roast) aur Mom (Soft), plus voice aur forecasts — Pro (₹99/mo) mein khulte hain."
    >
      <Pressable onPress={onUnlock} accessibilityRole="button" style={styles.cta}>
        <Text style={styles.ctaText}>₹99/mo — Pro le lo</Text>
      </Pressable>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  cta: {
    backgroundColor: colors.hero,
    borderRadius: radii.input,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { fontFamily: fonts.sans, fontSize: 14.5, color: '#fff' },
});
