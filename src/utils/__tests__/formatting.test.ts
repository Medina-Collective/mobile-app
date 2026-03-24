import {
  formatDate,
  formatEventDate,
  formatRelativeTime,
  truncate,
  capitalize,
} from '../formatting';

// Use the Date(year, monthIndex, day) constructor — this creates dates in LOCAL
// time, unlike new Date('YYYY-MM-DD') which parses as UTC midnight and shifts
// by timezone offset when formatted.
describe('formatDate', () => {
  it('formats a March date', () => {
    expect(formatDate(new Date(2026, 2, 23))).toBe('Mar 23, 2026'); // month 2 = March
  });

  it('formats a January date', () => {
    expect(formatDate(new Date(2026, 0, 1))).toBe('Jan 1, 2026'); // month 0 = January
  });

  it('formats a June date from a timestamp', () => {
    expect(formatDate(new Date(2026, 5, 15).getTime())).toBe('Jun 15, 2026'); // month 5 = June
  });
});

describe('formatEventDate', () => {
  it('includes the weekday, month, and day', () => {
    const result = formatEventDate(new Date(2026, 2, 23, 19, 0, 0)); // Mon Mar 23 at 7pm local
    expect(result).toMatch(/Mon, Mar 23/);
  });
});

describe('formatRelativeTime', () => {
  it('returns "ago" for a past date', () => {
    const twoHoursAgo = new Date(Date.now() - 1000 * 60 * 60 * 2);
    expect(formatRelativeTime(twoHoursAgo)).toMatch(/ago/);
  });

  it('returns "in" for a future date', () => {
    const threeDaysFromNow = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3);
    expect(formatRelativeTime(threeDaysFromNow)).toMatch(/in/);
  });
});

describe('truncate', () => {
  it('returns the original string when within limit', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('returns the original string when exactly at limit', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });

  it('truncates and appends ellipsis when over the limit', () => {
    expect(truncate('hello world', 6)).toBe('hello…');
  });
});

describe('capitalize', () => {
  it('capitalizes the first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('returns an empty string unchanged', () => {
    expect(capitalize('')).toBe('');
  });

  it('does not double-capitalize an already capitalized string', () => {
    expect(capitalize('Hello')).toBe('Hello');
  });
});
