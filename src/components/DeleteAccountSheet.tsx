import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import BottomSheet from './BottomSheet';
import { colors, fonts, radii } from '../theme/tokens';

interface Props {
  visible: boolean;
  onClose: () => void;
}

// Matches the source design exactly: both options just close the sheet.
// No destructive action is wired here — this prototype never deletes data.
export default function DeleteAccountSheet({ visible, onClose }: Props) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Account delete karna hai?"
      body="Poora data hamesha ke liye mit jayega — export ka option pehle de denge. Yeh wapas nahi hoga."
    >
      <View style={styles.row}>
        <Pressable onPress={onClose} accessibilityRole="button" style={styles.keepPill}>
          <Text style={styles.keepText}>Rehne do</Text>
        </Pressable>
        <Pressable onPress={onClose} accessibilityRole="button" style={styles.deletePill}>
          <Text style={styles.deleteText}>Delete karo</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  keepPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    borderRadius: radii.pill,
    paddingVertical: 13,
  },
  keepText: { fontFamily: fonts.sans, fontSize: 13.5, color: colors.textPrimary },
  deletePill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.warnText,
    borderRadius: radii.pill,
    paddingVertical: 13,
  },
  deleteText: { fontFamily: fonts.sans, fontSize: 13.5, color: '#fff' },
});
