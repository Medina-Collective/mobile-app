import { StyleSheet } from 'react-native';
import { colors } from './colors';

/**
 * Medina Design System — Typography
 *
 * Font families are placeholders — replace with actual font assets
 * when custom fonts are added to assets/fonts/.
 */
export const fontFamily = {
  regular: 'System',
  medium:  'System',
  semiBold: 'System',
  bold:    'System',
} as const;

export const fontSize = {
  xs:   11,
  sm:   13,
  base: 15,
  md:   17,
  lg:   20,
  xl:   24,
  '2xl': 28,
  '3xl': 34,
  '4xl': 40,
  '5xl': 48,
} as const;

/**
 * Pre-built text style variants for the <Text> component.
 * Reference via variant="heading1", variant="body", etc.
 */
export const textStyles = StyleSheet.create({
  heading1: {
    fontSize: fontSize['3xl'],
    fontWeight: '700',
    color: colors.neutral[900],
    letterSpacing: -0.5,
    lineHeight: fontSize['3xl'] * 1.2,
  },
  heading2: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.neutral[900],
    lineHeight: fontSize['2xl'] * 1.25,
  },
  heading3: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.neutral[900],
    lineHeight: fontSize.xl * 1.3,
  },
  heading4: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.neutral[900],
    lineHeight: fontSize.lg * 1.35,
  },
  body: {
    fontSize: fontSize.base,
    fontWeight: '400',
    color: colors.neutral[800],
    lineHeight: fontSize.base * 1.6,
  },
  bodyBold: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.neutral[800],
    lineHeight: fontSize.base * 1.6,
  },
  bodySm: {
    fontSize: fontSize.sm,
    fontWeight: '400',
    color: colors.neutral[700],
    lineHeight: fontSize.sm * 1.6,
  },
  caption: {
    fontSize: fontSize.xs,
    fontWeight: '400',
    color: colors.neutral[500],
    lineHeight: fontSize.xs * 1.5,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.neutral[700],
    letterSpacing: 0.1,
  },
  overline: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.neutral[500],
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});

export type TextVariant = keyof typeof textStyles;
