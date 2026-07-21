import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme/tokens';

// Marks progress through the 3 "minimal questions" steps (name/salary/goal)
// — the only real stretch of onboarding worth a progress indicator, since
// everything before it (welcome/phone/otp) and after it (connect/aa/etc.)
// is either a single decision or a fork, not a linear sequence.
export default function ProgressDots({ filled }: { filled: number }) {
  return (
    <View style={styles.row}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={[styles.dot, i < filled && styles.dotOn]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  dot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.hairlineStrong },
  dotOn: { backgroundColor: colors.hero },
});
