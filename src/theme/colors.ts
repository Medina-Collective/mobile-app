/**
 * Medina Collective Design System — Color Tokens
 *
 * Aesthetic: Rich dark burgundy backgrounds, warm cream typography, gold accents.
 * Inspired by the brand identity — deep maroon, candlelight, cultural warmth.
 */
export const colors = {
  /**
   * Maroon — the app's signature dark background scale.
   * 900 is the deepest (page bg), values rise toward surface/border.
   */
  maroon: {
    900: '#1a0808', // page background (deepest)
    800: '#220e0e', // slight lift
    700: '#2e1414', // card / surface
    600: '#3d1c1c', // elevated surface
    500: '#561f1f', // borders, dividers
    400: '#7a3030', // muted borders
    300: '#a05050', // muted text on dark
    200: '#c48080', // secondary text
    100: '#e0b5b5', // light decorative
    50:  '#f5e5e5', // barely-there tint
  },

  /**
   * Cream — warm off-white text and surface scale for dark backgrounds.
   */
  cream: {
    50:  '#fefaf4',
    100: '#f8eddb',
    200: '#eedcbf',
    300: '#e0c49e',
    400: '#c9a87a',
    500: '#a8844f', // muted cream (captions, labels)
    600: '#7a5e35',
  },

  /**
   * Gold — accent for active states, highlights, and key CTAs.
   */
  gold: {
    300: '#e8c882',
    400: '#d4a855',
    500: '#b8882a', // primary accent
    600: '#9a6e18',
  },

  /**
   * Primary — warm terracotta, used for the brand dot separator and accents.
   */
  primary: {
    50:  '#fdf4ee',
    100: '#fae2cc',
    200: '#f5c499',
    300: '#ee9d5e',
    400: '#e87630',
    500: '#d45e1a', // brand terracotta — dot separator, focus rings
    600: '#b04915',
    700: '#8a3712',
    800: '#6a2b10',
    900: '#4e200d',
  },

  /**
   * Neutral — kept for utility (errors, info badges, etc.)
   */
  neutral: {
    0:    '#ffffff',
    50:   '#f9fafb',
    100:  '#f3f4f6',
    200:  '#e5e7eb',
    300:  '#d1d5db',
    400:  '#9ca3af',
    500:  '#6b7280',
    600:  '#4b5563',
    700:  '#374151',
    800:  '#1f2937',
    900:  '#111827',
    1000: '#000000',
  },

  success: { 50: '#f0fdf4', 500: '#22c55e', 700: '#15803d' },
  warning: { 50: '#fffbeb', 500: '#f59e0b', 700: '#b45309' },
  error:   { 50: '#fef2f2', 500: '#ef4444', 700: '#b91c1c' },
  info:    { 50: '#eff6ff', 500: '#3b82f6', 700: '#1d4ed8' },

  /** @deprecated use maroon.900 for backgrounds */
  sand: {
    50:  '#fdfbf8',
    100: '#f7f4f0',
    200: '#ede8e1',
    300: '#ddd5cb',
  },
} as const;

export type Colors = typeof colors;
