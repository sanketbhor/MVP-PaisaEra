import React from 'react';
import { Linking, Pressable, StyleSheet, Text } from 'react-native';
import BottomSheet from './BottomSheet';
import { colors, fonts, radii } from '../theme/tokens';

interface Props {
  visible: boolean;
  subscriptionName: string | null;
  cancelUrl: string | null;
  onClose: () => void;
}

export default function CancelSubscriptionSheet({
  visible,
  subscriptionName,
  cancelUrl,
  onClose,
}: Props) {
  const handleOpenProvider = () => {
    if (cancelUrl) Linking.openURL(cancelUrl);
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={`${subscriptionName ?? 'Subscription'} cancel karo`}
      body="PaisaEra khud cancel nahi karta. Main tujhe iske account page pe le jaunga — cancel wahi se hoga."
    >
      <Pressable onPress={handleOpenProvider} accessibilityRole="button" style={styles.cta}>
        <Text style={styles.ctaText}>Provider page kholo ↗</Text>
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
