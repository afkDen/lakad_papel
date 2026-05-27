/**
 * LakadPapel Design Tokens
 * Centralized theme constants matching DESIGN_DOCUMENT.md specifications.
 * All components import from here — no magic strings anywhere.
 */

export const colors = {
  // Backgrounds
  white: '#ffffff',
  gray50: '#f9fafb',

  // Borders & separators
  gray200: '#e5e7eb',
  gray300: '#d1d5db',

  // Text
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray900: '#111827',

  // Semantic
  green600: '#16a34a',
  teal600: '#0d9488',
  blue600: '#2563eb',
  blue700: '#1d4ed8',
  red500: '#ef4444',
} as const;

export const typography = {
  screenTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    lineHeight: 28,
    color: colors.gray900,
  },
  sectionHeader: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    lineHeight: 20,
    color: colors.gray500,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
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
    fontSize: 15,
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
    fontSize: 16,
    lineHeight: 24,
    color: colors.gray900,
  },
  cardSemibold: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
    color: colors.gray900,
  },
  smallSemibold: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: colors.gray900,
  },
} as const;

export const spacing = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
} as const;

export const radii = {
  sm: 4,
  md: 8,  // rounded-lg equivalent
  lg: 12,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
} as const;
