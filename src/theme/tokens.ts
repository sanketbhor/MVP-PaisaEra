// Design tokens extracted from the approved "Soft Neo-bank" direction
// (PaisaEra Home.dc.html, flow 2a/2b/2c/2d — claude.ai/design project d4233641)

export const colors = {
  pageBg: '#e7e2d8',
  screenBg: '#efeee7',
  cardBg: '#fffdf7',
  hero: '#3f7a5c',
  heroDark: '#2c5c43',
  heroDay1: '#4d7d64',
  heroOnColor: '#eef4ef',
  heroOnColorMuted: '#cfe1d5',
  heroOnColorFaint: '#dfeae1',
  textPrimary: '#211e19',
  textMuted: '#8a8478',
  textMuted2: '#6b655b',
  hairline: 'rgba(33,30,25,.09)',
  hairlineStrong: 'rgba(33,30,25,.16)',
  warnText: '#a6672e',
  warnBg: '#f3e6d8',
  insightBadgeBg: '#e6efe6',
  transferBg: '#e6f0f2',
  amber: '#c9a23f',
  shadowCard: '0 6px 18px -10px rgba(30,25,18,.28)',
  shadowHero: '0 16px 30px -14px rgba(63,122,92,.65)',
  dashedBorder: 'rgba(63,122,92,.4)',
  navActive: '#3f7a5c',
  navInactive: '#a39c8e',
  sheetOverlay: 'rgba(20,17,13,.4)',
  sheetHandle: 'rgba(33,30,25,.18)',
  trackBg: '#e8e6df',
} as const;

export const fonts = {
  sans: 'HankenGrotesk_600SemiBold',
  sansRegular: 'HankenGrotesk_400Regular',
  sansMedium: 'HankenGrotesk_500Medium',
  sansBold: 'HankenGrotesk_700Bold',
  mono: 'IBMPlexMono_600SemiBold',
  monoRegular: 'IBMPlexMono_400Regular',
} as const;

export const radii = {
  hero: 26,
  card: 20,
  cardLg: 22,
  pill: 20,
  input: 18,
  iconBtn: 10,
} as const;

export const spacing = {
  screenPadding: 24,
  cardGap: 14,
} as const;

export type ConfidenceLevel = 'growing' | 'building' | 'high';

export const confidenceLabel: Record<ConfidenceLevel, string> = {
  growing: 'GROWING',
  building: 'BUILDING',
  high: 'HIGH',
};

export const confidenceBarsFilled: Record<ConfidenceLevel, number> = {
  growing: 1,
  building: 2,
  high: 3,
};
