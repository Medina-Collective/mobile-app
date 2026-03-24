import { StyleSheet } from 'react-native';
import { colors } from './colors';

/**
 * Medina Collective Design System — Typography
 *
 * Colors tuned for dark burgundy backgrounds.
 * Weights are warm and present — not thin/chic, but inviting.
 */
export const fontFamily = {
  regular:  'System',
  medium:   'System',
  semiBold: 'System',
  bold:     'System',
} as const;

export const fontSize = {
  xs:    11,
  sm:    13,
  base:  15,
  md:    17,
  lg:    20,
  xl:    24,
  '2xl': 28,
  '3xl': 34,
  '4xl': 40,
  '5xl': 48,
} as const;

export const textStyles = StyleSheet.create({
  /** Large editorial wordmark */
  display: {
    fontSize: fontSize['4xl'],
    fontWeight: '700',
    color: colors.beige[200],
    letterSpacing: 4,
    lineHeight: fontSize['4xl'] * 1.15,
  },
  heading1: {
    fontSize: fontSize['3xl'],
    fontWeight: '700',
    color: colors.beige[200],
    letterSpacing: 0.3,
    lineHeight: fontSize['3xl'] * 1.25,
  },
  heading2: {
    fontSize: fontSize['2xl'],
    fontWeight: '600',
    color: colors.beige[200],
    letterSpacing: 0.2,
    lineHeight: fontSize['2xl'] * 1.3,
  },
  heading3: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.beige[200],
    lineHeight: fontSize.xl * 1.35,
  },
  heading4: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.beige[200],
    lineHeight: fontSize.lg * 1.4,
  },
  body: {
    fontSize: fontSize.base,
    fontWeight: '400',
    color: colors.beige[300],
    lineHeight: fontSize.base * 1.65,
  },
  bodyBold: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.beige[200],
    lineHeight: fontSize.base * 1.65,
  },
  bodySm: {
    fontSize: fontSize.sm,
    fontWeight: '400',
    color: colors.beige[300],
    lineHeight: fontSize.sm * 1.65,
  },
  caption: {
    fontSize: fontSize.xs,
    fontWeight: '400',
    color: colors.beige[400],
    lineHeight: fontSize.xs * 1.6,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.beige[200],
    letterSpacing: 0.2,
  },
  overline: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.beige[400],
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
});

export type TextVariant = keyof typeof textStyles;
