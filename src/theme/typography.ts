import { StyleSheet } from 'react-native';
import { colors } from './colors';

/**
 * Medina Collective Design System — Typography
 *
 * All default text colors are tuned for dark (maroon) backgrounds.
 * Font families are placeholders — replace when custom fonts are added.
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

/**
 * Pre-built text style variants for the <Text> component.
 * Default colors are warm cream — designed for dark backgrounds.
 */
export const textStyles = StyleSheet.create({
  /** Editorial wordmark — ultra-thin, wide tracking */
  display: {
    fontSize: fontSize['4xl'],
    fontWeight: '200',
    color: colors.cream[100],
    letterSpacing: 8,
    lineHeight: fontSize['4xl'] * 1.1,
  },
  heading1: {
    fontSize: fontSize['3xl'],
    fontWeight: '300',
    color: colors.cream[100],
    letterSpacing: 0.5,
    lineHeight: fontSize['3xl'] * 1.25,
  },
  heading2: {
    fontSize: fontSize['2xl'],
    fontWeight: '300',
    color: colors.cream[100],
    letterSpacing: 0.3,
    lineHeight: fontSize['2xl'] * 1.3,
  },
  heading3: {
    fontSize: fontSize.xl,
    fontWeight: '500',
    color: colors.cream[100],
    lineHeight: fontSize.xl * 1.3,
  },
  heading4: {
    fontSize: fontSize.lg,
    fontWeight: '500',
    color: colors.cream[100],
    lineHeight: fontSize.lg * 1.35,
  },
  body: {
    fontSize: fontSize.base,
    fontWeight: '400',
    color: colors.cream[200],
    lineHeight: fontSize.base * 1.6,
  },
  bodyBold: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.cream[200],
    lineHeight: fontSize.base * 1.6,
  },
  bodySm: {
    fontSize: fontSize.sm,
    fontWeight: '400',
    color: colors.cream[300],
    lineHeight: fontSize.sm * 1.6,
  },
  caption: {
    fontSize: fontSize.xs,
    fontWeight: '400',
    color: colors.cream[500],
    lineHeight: fontSize.xs * 1.5,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.cream[200],
    letterSpacing: 0.1,
  },
  overline: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.cream[500],
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});

export type TextVariant = keyof typeof textStyles;
