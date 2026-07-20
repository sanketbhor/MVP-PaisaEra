import React from 'react';
import BottomSheet from './BottomSheet';

interface Props {
  visible: boolean;
  caName: string | null;
  onClose: () => void;
}

// This prototype has no payment/booking integration — the sheet is purely
// informational, matching every other CTA in this app that would need real
// money to move (Pro upgrade, subscription cancel).
export default function BookCASheet({ visible, caName, onClose }: Props) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={caName ? `${caName} ko book karo` : 'Booking'}
      body="Yeh prototype hai — real booking aur payment abhi wire nahi hue. Live version mein yahan se seedha CA ke calendar pe slot book hoga."
    />
  );
}
