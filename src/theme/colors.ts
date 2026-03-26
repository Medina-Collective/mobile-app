/**
 * Medina Collective Design System — Color Tokens (Dark Theme)
 *
 * Palette sourced directly from the brand identity:
 *   Dark Background  #2F0A0A  — page background
 *   Dark Merlot      #541623  — cards, surfaces
 *   Beige            #ffd3c0  — primary text & warm highlights
 *   Light Crimson    #ff6f97  — accent, active states, decorative
 *   Warm Sand        #CEC1AE  — primary accent / secondary
 */
export const colors = {
  // ── Brand palette ──────────────────────────────────────────────────────────
  burgundy: {
    /** Page background — the deepest tone */
    deep: '#2F0A0A',
    /** Card / surface background */
    surface: '#541623',
    /** Elevated surface, hover states */
    raised: '#6a2030',
    /** Mid-tone — primary CTA / accent color */
    mid: '#2F0A0A',
    /** Muted text / decorative */
    muted: '#b05060',
    /** Subtle tint over background */
    tint: '#7a3045',
  },

  /** Warm peachy beige — primary text on dark backgrounds */
  beige: {
    50: '#fff8f5',
    100: '#ffe8dc',
    200: '#ffd3c0', // ← exact brand beige (R255 G211 B192)
    300: '#f5b89a',
    400: '#e09070',
    500: '#c06848',
    600: '#9a4828',
  },

  /** Light crimson — accent, active states, highlights */
  crimson: {
    200: '#ffb8cc',
    300: '#ff8fb0',
    400: '#ff6f97', // ← exact brand light crimson (R255 G111 B151)
    500: '#e0406a',
    600: '#c02050',
  },

  // ── Utility ────────────────────────────────────────────────────────────────
  neutral: {
    0: '#ffffff',
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    1000: '#000000',
  },

  /**
   * Warm palette — light theme. Off-white cream background, white card surfaces,
   * dark text (#1a1212) on light backgrounds.
   */
  warm: {
    /** Page background — warm off-white cream */
    bg: '#faf6f0',
    /** Card / surface — pure white */
    surface: '#ffffff',
    /** Elevated inner surface */
    elevated: '#fff9f5',
    /** Border for cards on light bg */
    border: 'rgba(160, 122, 95, 0.14)',
    /** Stronger border for focused states */
    borderFocus: 'rgba(40, 2, 10, 0.35)',
    /** Page-level titles — very dark */
    title: '#1a1212',
    /** Page-level body text */
    body: 'rgba(26, 18, 18, 0.75)',
    /** Page-level muted text */
    muted: 'rgba(26, 18, 18, 0.45)',
    /** Faint dividers */
    divider: 'rgba(160, 122, 95, 0.10)',
    /** Shadow tint for cards */
    shadow: '#7b625b',
  },

  success: { 50: '#f0fdf4', 500: '#22c55e', 700: '#15803d' },
  warning: { 50: '#fffbeb', 500: '#f59e0b', 700: '#b45309' },
  error: { 50: '#fef2f2', 500: '#ef4444', 700: '#b91c1c' },
  info: { 50: '#eff6ff', 500: '#3b82f6', 700: '#1d4ed8' },

  /** @deprecated */
  primary: {
    50: '#fdf4ee',
    100: '#fae2cc',
    200: '#f5c499',
    300: '#ee9d5e',
    400: '#e87630',
    500: '#d45e1a',
    600: '#b04915',
    700: '#8a3712',
    800: '#6a2b10',
    900: '#4e200d',
  },
  /** @deprecated use burgundy */
  maroon: {
    900: '#330b14',
    800: '#3d0f1a',
    700: '#541623',
    600: '#6a2030',
    500: '#440007',
    400: '#b05060',
    300: '#c47a88',
    200: '#daa8b4',
    100: '#edd4d9',
    50: '#f9edef',
  },
  /** @deprecated use beige */
  cream: {
    50: '#fff8f5',
    100: '#ffe8dc',
    200: '#ffd3c0',
    300: '#f5b89a',
    400: '#e09070',
    500: '#c06848',
    600: '#9a4828',
  },
  /** @deprecated */
  sand: {
    50: '#fdfbf8',
    100: '#f7f4f0',
    200: '#ede8e1',
    300: '#ddd5cb',
  },
} as const;

export type Colors = typeof colors;
