import {
  ANNOUNCEMENT_TYPE_LABELS,
  ANNOUNCEMENT_TYPE_ICONS,
  ANNOUNCEMENT_TYPE_COLORS,
} from '@app-types/announcement';

const ALL_TYPES = [
  'activity_event',
  'bazaar',
  'brand_popup',
  'halaqa',
  'limited_offer',
  'update',
  'other',
] as const;

describe('ANNOUNCEMENT_TYPE_LABELS', () => {
  it('has a label for every announcement type', () => {
    for (const type of ALL_TYPES) {
      expect(ANNOUNCEMENT_TYPE_LABELS[type]).toBeDefined();
      expect(typeof ANNOUNCEMENT_TYPE_LABELS[type]).toBe('string');
    }
  });

  it('includes "update" with a non-empty label', () => {
    expect(ANNOUNCEMENT_TYPE_LABELS.update).toBe('Update');
  });
});

describe('ANNOUNCEMENT_TYPE_ICONS', () => {
  it('has an icon for every announcement type', () => {
    for (const type of ALL_TYPES) {
      expect(ANNOUNCEMENT_TYPE_ICONS[type]).toBeDefined();
      expect(typeof ANNOUNCEMENT_TYPE_ICONS[type]).toBe('string');
    }
  });

  it('includes "update" with a non-empty icon name', () => {
    expect(ANNOUNCEMENT_TYPE_ICONS.update).toBe('megaphone-outline');
  });
});

describe('ANNOUNCEMENT_TYPE_COLORS', () => {
  it('has colors for every announcement type', () => {
    for (const type of ALL_TYPES) {
      const colors = ANNOUNCEMENT_TYPE_COLORS[type];
      expect(colors).toBeDefined();
      expect(typeof colors.bg).toBe('string');
      expect(typeof colors.text).toBe('string');
    }
  });

  it('each entry has both bg and text properties', () => {
    for (const type of ALL_TYPES) {
      const colors = ANNOUNCEMENT_TYPE_COLORS[type];
      expect(Object.keys(colors)).toContain('bg');
      expect(Object.keys(colors)).toContain('text');
    }
  });

  it('includes "update" with bg and text color strings', () => {
    expect(ANNOUNCEMENT_TYPE_COLORS.update.bg).toBeTruthy();
    expect(ANNOUNCEMENT_TYPE_COLORS.update.text).toBeTruthy();
  });
});
