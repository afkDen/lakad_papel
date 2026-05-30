/**
 * LakadPapel Design Tokens
 * Centralized theme constants matching DESIGN.md and Stitch specifications.
 * All components import from here — no magic strings anywhere.
 */

export const colors = {
  // Brand & Palette (Stitch Civic-Tech System)
  white: '#ffffff',
  backgroundPaperLight: '#F7F4EF', // Sandy warm-grey background
  backgroundLight: '#fff8f5',      // Peach-tinted soft cream
  primaryTerracotta: '#8d4b00',    // Rich Filipino terracotta brown
  primaryTerracottaDark: '#ffb77d',// Dimmed terracotta for dark mode
  primaryFixed: '#ffdcc3',         // Soft peach-cream text bg
  onPrimaryFixed: '#2f1500',       // Dark chocolate readable text
  secondaryTeal: '#006780',        // Deep Sulu Sea teal
  secondaryTealDark: '#6cd3f7',    // Vibrant Dimmed teal
  tertiaryGreen: '#006b2c',       // Organic forest green (Success)
  borderSubtle: '#E8E0D5',         // Soft warm-sand divider/border
  warningBg: '#FEF3C7',            // Clear warning alert amber background
  dangerRed: '#ba1a1a',            // Standard danger accent
  outlineVariant: '#dbc2b0',       // Outer frame sand color

  // Core Grays
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray900: '#1f1b17',              // Organic dark gray/brown for text
} as const;

export const typography = {
  screenTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    lineHeight: 28,
    color: colors.primaryTerracotta,
  },
  sectionHeader: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    lineHeight: 14,
    color: colors.gray500,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: colors.gray900,
  },
  secondary: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: colors.gray500,
  },
  buttonLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: colors.white,
  },
  caption: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: colors.gray500,
  },
  cardLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: colors.gray900,
  },
  cardSemibold: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    lineHeight: 20,
    color: colors.gray900,
  },
  smallSemibold: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    lineHeight: 18,
    color: colors.gray900,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
} as const;

export const radii = {
  sm: 6,
  md: 12,
  lg: 20,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#1f1b17',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#1f1b17',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

