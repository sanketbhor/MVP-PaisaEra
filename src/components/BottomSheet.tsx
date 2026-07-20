import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme/tokens';

interface Props {
  visible: boolean;
  onClose: () => void;
  title: string;
  body: string;
  children?: React.ReactNode;
}

export default function BottomSheet({ visible, onClose, title, body, children }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} accessibilityLabel="Close">
        {/* Nested Pressable claims the touch responder so taps inside the sheet don't bubble to the overlay's onClose. */}
        <Pressable style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.sheetOverlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.screenBg,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 34,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 3,
    backgroundColor: colors.sheetHandle,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: { fontFamily: fonts.sans, fontSize: 16, color: colors.textPrimary, marginBottom: 4 },
  body: { fontFamily: fonts.sansRegular, fontSize: 13.5, lineHeight: 20, color: colors.textMuted2, marginBottom: 16 },
});
