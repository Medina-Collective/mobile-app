import { format, formatDistanceToNow } from 'date-fns';

/**
 * Format a date as "Mar 23, 2026"
 */
export function formatDate(date: Date | string | number): string {
  return format(new Date(date), 'MMM d, yyyy');
}

/**
 * Format a date as "Mon, Mar 23 · 7:00 PM"
 */
export function formatEventDate(date: Date | string | number): string {
  return format(new Date(date), "EEE, MMM d · h:mm a");
}

/**
 * Format a date as relative time: "2 hours ago", "in 3 days"
 */
export function formatRelativeTime(date: Date | string | number): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/**
 * Truncate a string to a max length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(text: string): string {
  if (text.length === 0) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}
