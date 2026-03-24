export const APP_NAME = 'Medina';
export const APP_VERSION = '1.0.0';

/**
 * Storage keys — centralised to prevent typos and key collisions
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  ONBOARDED: 'onboarded',
  USER_ROLE: 'user_role',
  THEME: 'theme',
} as const;

/**
 * TanStack Query cache keys.
 * Always use these constants to ensure consistent cache invalidation.
 */
export const QUERY_KEYS = {
  events: ['events'] as const,
  event: (id: string) => ['events', id] as const,
  profile: ['profile'] as const,
  favorites: ['favorites'] as const,
  discover: ['discover'] as const,
} as const;

/**
 * User roles — determines which features/screens are visible
 */
export const USER_ROLES = {
  USER: 'user',
  PROFESSIONAL: 'professional',
  ADMIN: 'admin',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
