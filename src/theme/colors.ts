/**
 * Medina Design System — Color Tokens
 *
 * Primary: Warm terracotta-amber (reflects cultural warmth, community)
 * Neutral: True gray scale
 * Semantic: Success, Warning, Error, Info
 */
export const colors = {
  /** Warm off-white — used as the main app background throughout auth & core screens */
  sand: {
    50:  '#fdfbf8',
    100: '#f7f4f0',
    200: '#ede8e1',
    300: '#ddd5cb',
  },
  primary: {
    50:  '#fdf4ee',
    100: '#fae2cc',
    200: '#f5c499',
    300: '#ee9d5e',
    400: '#e87630',
    500: '#d45e1a', // Brand primary — main CTAs, active states
    600: '#b04915',
    700: '#8a3712',
    800: '#6a2b10',
    900: '#4e200d',
  },
  accent: {
    50:  '#f0f4ff',
    100: '#dde5ff',
    200: '#bac8ff',
    300: '#91a7ff',
    400: '#5c7cfa',
    500: '#4263eb', // Accent blue — links, secondary actions
    600: '#3451c7',
    700: '#2844a1',
    800: '#1e3480',
    900: '#152760',
  },
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
  success: {
    50:  '#f0fdf4',
    500: '#22c55e',
    700: '#15803d',
  },
  warning: {
    50:  '#fffbeb',
    500: '#f59e0b',
    700: '#b45309',
  },
  error: {
    50:  '#fef2f2',
    500: '#ef4444',
    700: '#b91c1c',
  },
  info: {
    50:  '#eff6ff',
    500: '#3b82f6',
    700: '#1d4ed8',
  },
} as const;

export type Colors = typeof colors;
