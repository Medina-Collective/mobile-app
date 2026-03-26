import { StyleSheet } from 'react-native';
import { colors } from './colors';

/**
 * Medina Collective Design System — Typography
 *
 * Headings  → Playfair Display (serif, elegant)
 * Body/UI   → DM Sans (clean, readable)
 */
export const fontFamily = {
  /** Playfair Display — serif, used for headings and editorial titles */
  serifRegular: 'PlayfairDisplay-Regular',
  serifSemiBold: 'PlayfairDisplay-SemiBold',
  serifBold: 'PlayfairDisplay-Bold',
  /** DM Sans — clean sans-serif, used for body, labels, UI text */
  sansRegular: 'DMSans-Regular',
  sansMedium: 'DMSans-Medium',
  sansSemiBold: 'DMSans-SemiBold',
  sansBold: 'DMSans-Bold',
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 34,
  '4xl': 40,
  '5xl': 48,
} as const;

export const textStyles = StyleSheet.create({
  /** Large editorial wordmark — Playfair Display Bold */
  display: {
    fontFamily: fontFamily.serifBold,
    fontSize: fontSize['4xl'],
    color: colors.warm.title,
    letterSpacing: 0.5,
    lineHeight: fontSize['4xl'] * 1.15,
  },
  heading1: {
    fontFamily: fontFamily.serifBold,
    fontSize: fontSize['3xl'],
    color: colors.warm.title,
    letterSpacing: 0.3,
    lineHeight: fontSize['3xl'] * 1.25,
  },
  heading2: {
    fontFamily: fontFamily.serifSemiBold,
    fontSize: fontSize['2xl'],
    color: colors.warm.title,
    letterSpacing: 0.2,
    lineHeight: fontSize['2xl'] * 1.3,
  },
  heading3: {
    fontFamily: fontFamily.serifSemiBold,
    fontSize: fontSize.xl,
    color: colors.warm.title,
    lineHeight: fontSize.xl * 1.35,
  },
  heading4: {
    fontFamily: fontFamily.serifSemiBold,
    fontSize: fontSize.lg,
    color: colors.warm.title,
    lineHeight: fontSize.lg * 1.4,
  },
  body: {
    fontFamily: fontFamily.sansRegular,
    fontSize: fontSize.base,
    color: colors.warm.body,
    lineHeight: fontSize.base * 1.65,
  },
  bodyBold: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: fontSize.base,
    color: colors.warm.title,
    lineHeight: fontSize.base * 1.65,
  },
  bodySm: {
    fontFamily: fontFamily.sansRegular,
    fontSize: fontSize.sm,
    color: colors.warm.body,
    lineHeight: fontSize.sm * 1.65,
  },
  caption: {
    fontFamily: fontFamily.sansRegular,
    fontSize: fontSize.xs,
    color: colors.warm.muted,
    lineHeight: fontSize.xs * 1.6,
  },
  label: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: fontSize.sm,
    color: colors.warm.title,
    letterSpacing: 0.2,
  },
  overline: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: fontSize.xs,
    color: colors.warm.muted,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
});

export type TextVariant = keyof typeof textStyles;
