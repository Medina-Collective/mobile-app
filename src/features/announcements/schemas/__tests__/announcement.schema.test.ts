import {
  announcementSchema,
  ANNOUNCEMENT_TYPE_OPTIONS,
} from '@features/announcements/schemas/announcement.schema';

// Shared valid base data
const now = new Date();
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

const validBase = {
  type: 'activity_event' as const,
  title: 'Community Gathering',
  visibilityStart: now,
  visibilityEnd: tomorrow,
  audience: 'public' as const,
  participationEnabled: false,
};

describe('ANNOUNCEMENT_TYPE_OPTIONS', () => {
  it('contains all expected announcement types', () => {
    const values = ANNOUNCEMENT_TYPE_OPTIONS.map((o) => o.value);
    expect(values).toContain('activity_event');
    expect(values).toContain('bazaar');
    expect(values).toContain('brand_popup');
    expect(values).toContain('halaqa');
    expect(values).toContain('limited_offer');
    expect(values).toContain('update');
    expect(values).toContain('other');
  });
});

describe('announcementSchema — valid data', () => {
  it('parses a minimal valid object', () => {
    const result = announcementSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it('parses with optional description', () => {
    const result = announcementSchema.safeParse({
      ...validBase,
      description: 'A wonderful event',
    });
    expect(result.success).toBe(true);
  });

  it('parses with optional location', () => {
    const result = announcementSchema.safeParse({ ...validBase, location: 'Montreal' });
    expect(result.success).toBe(true);
  });

  it('parses with optional externalUrl', () => {
    const result = announcementSchema.safeParse({
      ...validBase,
      externalUrl: 'https://example.com',
    });
    expect(result.success).toBe(true);
  });

  it('parses with optional maxCapacity', () => {
    const result = announcementSchema.safeParse({
      ...validBase,
      participationEnabled: true,
      maxCapacity: 50,
    });
    expect(result.success).toBe(true);
  });

  it('parses with optional audience pro_only', () => {
    const result = announcementSchema.safeParse({ ...validBase, audience: 'pro_only' });
    expect(result.success).toBe(true);
  });

  it('parses with eventStart only (no deadline)', () => {
    const result = announcementSchema.safeParse({
      ...validBase,
      eventStart: now,
      eventEnd: tomorrow,
    });
    expect(result.success).toBe(true);
  });

  it('parses with deadline only (no eventStart)', () => {
    const result = announcementSchema.safeParse({ ...validBase, deadline: tomorrow });
    expect(result.success).toBe(true);
  });

  it('parses each valid announcement type', () => {
    const types = [
      'activity_event',
      'bazaar',
      'brand_popup',
      'halaqa',
      'limited_offer',
      'update',
      'other',
    ] as const;
    for (const type of types) {
      const result = announcementSchema.safeParse({ ...validBase, type });
      expect(result.success).toBe(true);
    }
  });
});

describe('announcementSchema — required fields', () => {
  it('fails when title is missing', () => {
    const { title: _title, ...withoutTitle } = validBase;
    const result = announcementSchema.safeParse(withoutTitle);
    expect(result.success).toBe(false);
  });

  it('fails when type is missing', () => {
    const { type: _type, ...withoutType } = validBase;
    const result = announcementSchema.safeParse(withoutType);
    expect(result.success).toBe(false);
  });

  it('fails when visibilityStart is missing', () => {
    const { visibilityStart: _vs, ...withoutStart } = validBase;
    const result = announcementSchema.safeParse(withoutStart);
    expect(result.success).toBe(false);
  });

  it('fails when visibilityEnd is missing', () => {
    const { visibilityEnd: _ve, ...withoutEnd } = validBase;
    const result = announcementSchema.safeParse(withoutEnd);
    expect(result.success).toBe(false);
  });

  it('fails when title is too short (< 2 chars)', () => {
    const result = announcementSchema.safeParse({ ...validBase, title: 'A' });
    expect(result.success).toBe(false);
  });

  it('fails when title exceeds 80 chars', () => {
    const result = announcementSchema.safeParse({
      ...validBase,
      title: 'A'.repeat(81),
    });
    expect(result.success).toBe(false);
  });
});

describe('announcementSchema — refine rules', () => {
  it('fails when visibilityEnd is before visibilityStart', () => {
    const result = announcementSchema.safeParse({
      ...validBase,
      visibilityStart: tomorrow,
      visibilityEnd: now,
    });
    expect(result.success).toBe(false);
  });

  it('fails when visibility window exceeds 30 days', () => {
    const farFuture = new Date(now.getTime() + 31 * 24 * 60 * 60 * 1000);
    const result = announcementSchema.safeParse({
      ...validBase,
      visibilityEnd: farFuture,
    });
    expect(result.success).toBe(false);
  });

  it('fails when both eventStart and deadline are set', () => {
    const result = announcementSchema.safeParse({
      ...validBase,
      eventStart: now,
      deadline: tomorrow,
    });
    expect(result.success).toBe(false);
  });

  it('succeeds when only eventStart is set (no deadline)', () => {
    const result = announcementSchema.safeParse({
      ...validBase,
      eventStart: now,
    });
    expect(result.success).toBe(true);
  });

  it('succeeds when only deadline is set (no eventStart)', () => {
    const result = announcementSchema.safeParse({
      ...validBase,
      deadline: tomorrow,
    });
    expect(result.success).toBe(true);
  });

  it('fails when eventEnd is before eventStart', () => {
    const result = announcementSchema.safeParse({
      ...validBase,
      eventStart: tomorrow,
      eventEnd: now,
    });
    expect(result.success).toBe(false);
  });
});

describe('announcementSchema — invalid enum', () => {
  it('fails with an invalid type value', () => {
    const result = announcementSchema.safeParse({ ...validBase, type: 'invalid_type' });
    expect(result.success).toBe(false);
  });

  it('fails with an invalid audience value', () => {
    const result = announcementSchema.safeParse({ ...validBase, audience: 'everyone' });
    expect(result.success).toBe(false);
  });
});
