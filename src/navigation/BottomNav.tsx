import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme/tokens';

// The full set of screens the app can show. Only home/goals/chat/community/
// profile are represented as nav tabs — transactions/budgets/subscriptions
// live under Home's "spending hub," and settings/onboarding live under
// Profile. Navigating to any of them still needs a TabKey, hence the wider
// union.
export type TabKey =
  | 'home'
  | 'transactions'
  | 'budgets'
  | 'goals'
  | 'subscriptions'
  | 'chat'
  | 'community'
  | 'profile'
  | 'settings'
  | 'onboarding';

type NavGroup = 'home' | 'goals' | 'chat' | 'community' | 'profile';

const TABS: { key: NavGroup; label: string; icon: string; target: TabKey }[] = [
  { key: 'home', label: 'Home', icon: '◇', target: 'home' },
  { key: 'goals', label: 'Goals', icon: '◎', target: 'goals' },
  { key: 'chat', label: 'Chat', icon: '◈', target: 'chat' },
  { key: 'community', label: 'Community', icon: '◍', target: 'community' },
  { key: 'profile', label: 'Profile', icon: '◉', target: 'profile' },
];

// Which nav tab lights up for a given full screen — the "spending" cluster
// (transactions/budgets/subscriptions) counts as Home, and settings counts
// as Profile, matching the source design's navHome/navProfile grouping.
function groupFor(tab: TabKey): NavGroup | null {
  switch (tab) {
    case 'home':
    case 'transactions':
    case 'budgets':
    case 'subscriptions':
      return 'home';
    case 'goals':
      return 'goals';
    case 'chat':
      return 'chat';
    case 'community':
      return 'community';
    case 'profile':
    case 'settings':
      return 'profile';
    case 'onboarding':
      return null;
  }
}

interface Props {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

export default function BottomNav({ active, onChange }: Props) {
  const activeGroup = groupFor(active);
  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const isActive = tab.key === activeGroup;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.target)}
            accessibilityRole="button"
            style={styles.tab}
          >
            <Text style={[styles.icon, isActive && styles.iconActive]}>{tab.icon}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.cardBg,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 12,
  },
  tab: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4 },
  icon: { fontSize: 19, lineHeight: 22, color: colors.navInactive },
  iconActive: { color: colors.navActive },
  label: { fontFamily: fonts.sans, fontSize: 10, color: colors.navInactive },
  labelActive: { color: colors.navActive },
});
