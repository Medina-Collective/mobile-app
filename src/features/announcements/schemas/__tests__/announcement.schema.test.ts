import {
  announcementSchema,
  ANNOUNCEMENT_TYPE_OPTIONS,
  ANNOUNCEMENT_FORM_TYPES,
  MAX_VISIBILITY_DAYS,
} from '@features/announcements/schemas/announcement.schema';

const now = new Date();
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

const validBase = {
  type: 'event' as const,
  title: 'Community Gathering',
  category: 'Events & Activities',
  girlsOnly: false,
  isFree: true,
  visibilityStart: now,
  visibilityEnd: tomorrow,
};

// ── ANNOUNCEMENT_TYPE_OPTIONS ─────────────────────────────────────────────────

describe('ANNOUNCEMENT_TYPE_OPTIONS', () => {
  it('contains all expected DB announcement types', () => {
    const values = ANNOUNCEMENT_TYPE_OPTIONS.map((o) => o.value);
    expect(values).toContain('activity_event');
    expect(values).toContain('bazaar');
    expect(values).toContain('brand_popup');
    expect(values).toContain('halaqa');
    expect(values).toContain('limited_offer');
    expect(values).toContain('other');
  });

  it('each option has a label and icon', () => {
    for (const option of ANNOUNCEMENT_TYPE_OPTIONS) {
      expect(typeof option.label).toBe('string');
      expect(option.label.length).toBeGreaterThan(0);
      expect(typeof option.icon).toBe('string');
    }
  });
});

// ── ANNOUNCEMENT_FORM_TYPES ───────────────────────────────────────────────────

describe('ANNOUNCEMENT_FORM_TYPES', () => {
  it('contains the 3 form types: event, offer, update', () => {
    const values = ANNOUNCEMENT_FORM_TYPES.map((o) => o.value);
    expect(values).toContain('event');
    expect(values).toContain('offer');
    expect(values).toContain('update');
  });

  it('each option has a label, description, and icon', () => {
    for (const option of ANNOUNCEMENT_FORM_TYPES) {
      expect(typeof option.label).toBe('string');
      expect(option.label.length).toBeGreaterThan(0);
      expect(typeof option.description).toBe('string');
      expect(option.description.length).toBeGreaterThan(0);
      expect(typeof option.icon).toBe('string');
    }
  });
});

// ── announcementSchema — valid data ───────────────────────────────────────────

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
    const result = announcementSchema.safeParse({ ...validBase, location: 'Montreal, QC' });
    expect(result.success).toBe(true);
  });

  it('parses each valid form type', () => {
    for (const type of ['event', 'offer', 'update'] as const) {
      const result = announcementSchema.safeParse({ ...validBase, type });
      expect(result.success).toBe(true);
    }
  });

  it('parses with event-specific optional fields', () => {
    const result = announcementSchema.safeParse({
      ...validBase,
      type: 'event',
      eventDate: tomorrow,
      eventTime: new Date(),
      maxParticipants: 50,
      registrationLink: 'https://register.example.com',
    });
    expect(result.success).toBe(true);
  });

  it('parses with offer-specific optional fields', () => {
    const result = announcementSchema.safeParse({
      ...validBase,
      type: 'offer',
      discountLabel: '20% off',
      promoCode: 'SAVE20',
      validUntil: tomorrow,
      shopLink: 'https://shop.example.com',
    });
    expect(result.success).toBe(true);
  });

  it('parses with update-specific optional fields', () => {
    const result = announcementSchema.safeParse({
      ...validBase,
      type: 'update',
      deadline: tomorrow,
      externalLink: 'https://example.com',
    });
    expect(result.success).toBe(true);
  });

  it('parses with isFree=false and a price', () => {
    const result = announcementSchema.safeParse({ ...validBase, isFree: false, price: '$10' });
    expect(result.success).toBe(true);
  });

  it('parses with girlsOnly=true', () => {
    const result = announcementSchema.safeParse({ ...validBase, girlsOnly: true });
    expect(result.success).toBe(true);
  });

  it('parses with coverImageUri', () => {
    const result = announcementSchema.safeParse({
      ...validBase,
      coverImageUri: 'file://path/to/image.jpg',
    });
    expect(result.success).toBe(true);
  });

  it('parses with maxParticipants as a positive integer', () => {
    const result = announcementSchema.safeParse({ ...validBase, maxParticipants: 100 });
    expect(result.success).toBe(true);
  });
});

// ── announcementSchema — required fields ──────────────────────────────────────

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

  it('fails when category is missing', () => {
    const { category: _cat, ...withoutCategory } = validBase;
    const result = announcementSchema.safeParse(withoutCategory);
    expect(result.success).toBe(false);
  });

  it('fails when girlsOnly is missing', () => {
    const { girlsOnly: _g, ...withoutGirlsOnly } = validBase;
    const result = announcementSchema.safeParse(withoutGirlsOnly);
    expect(result.success).toBe(false);
  });

  it('fails when isFree is missing', () => {
    const { isFree: _f, ...withoutIsFree } = validBase;
    const result = announcementSchema.safeParse(withoutIsFree);
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
});

// ── announcementSchema — field validation ─────────────────────────────────────

describe('announcementSchema — field validation', () => {
  it('fails when title is too short (< 2 chars)', () => {
    const result = announcementSchema.safeParse({ ...validBase, title: 'A' });
    expect(result.success).toBe(false);
  });

  it('fails when title exceeds 100 chars', () => {
    const result = announcementSchema.safeParse({ ...validBase, title: 'A'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('succeeds when title is exactly 100 chars', () => {
    const result = announcementSchema.safeParse({ ...validBase, title: 'A'.repeat(100) });
    expect(result.success).toBe(true);
  });

  it('succeeds when title is exactly 2 chars', () => {
    const result = announcementSchema.safeParse({ ...validBase, title: 'AB' });
    expect(result.success).toBe(true);
  });

  it('fails when description exceeds 1000 chars', () => {
    const result = announcementSchema.safeParse({ ...validBase, description: 'A'.repeat(1001) });
    expect(result.success).toBe(false);
  });

  it('succeeds when description is exactly 1000 chars', () => {
    const result = announcementSchema.safeParse({ ...validBase, description: 'A'.repeat(1000) });
    expect(result.success).toBe(true);
  });

  it('fails when location exceeds 200 chars', () => {
    const result = announcementSchema.safeParse({ ...validBase, location: 'A'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('succeeds when location is exactly 200 chars', () => {
    const result = announcementSchema.safeParse({ ...validBase, location: 'A'.repeat(200) });
    expect(result.success).toBe(true);
  });

  it('fails when maxParticipants is 0 (not positive)', () => {
    const result = announcementSchema.safeParse({ ...validBase, maxParticipants: 0 });
    expect(result.success).toBe(false);
  });

  it('fails when maxParticipants is negative', () => {
    const result = announcementSchema.safeParse({ ...validBase, maxParticipants: -5 });
    expect(result.success).toBe(false);
  });

  it('fails when maxParticipants is not an integer', () => {
    const result = announcementSchema.safeParse({ ...validBase, maxParticipants: 10.5 });
    expect(result.success).toBe(false);
  });

  it('fails when category is empty string', () => {
    const result = announcementSchema.safeParse({ ...validBase, category: '' });
    expect(result.success).toBe(false);
  });
});

// ── announcementSchema — refine rules ─────────────────────────────────────────

describe('announcementSchema — refine rules', () => {
  it('fails when visibilityEnd is before visibilityStart', () => {
    const result = announcementSchema.safeParse({
      ...validBase,
      visibilityStart: tomorrow,
      visibilityEnd: now,
    });
    expect(result.success).toBe(false);
  });

  it('fails when visibilityEnd equals visibilityStart', () => {
    const sameTime = new Date();
    const result = announcementSchema.safeParse({
      ...validBase,
      visibilityStart: sameTime,
      visibilityEnd: sameTime,
    });
    expect(result.success).toBe(false);
  });

  it('fails when visibility window exceeds MAX_VISIBILITY_DAYS', () => {
    const tooFar = new Date(now.getTime() + (MAX_VISIBILITY_DAYS + 1) * 24 * 60 * 60 * 1000);
    const result = announcementSchema.safeParse({ ...validBase, visibilityEnd: tooFar });
    expect(result.success).toBe(false);
  });

  it('succeeds when visibility window is exactly MAX_VISIBILITY_DAYS', () => {
    const exact = new Date(now.getTime() + MAX_VISIBILITY_DAYS * 24 * 60 * 60 * 1000);
    const result = announcementSchema.safeParse({ ...validBase, visibilityEnd: exact });
    expect(result.success).toBe(true);
  });

  it('error path includes visibilityEnd for date order violation', () => {
    const result = announcementSchema.safeParse({
      ...validBase,
      visibilityStart: tomorrow,
      visibilityEnd: now,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('visibilityEnd');
    }
  });

  it('error path includes visibilityEnd for window-too-long violation', () => {
    const tooFar = new Date(now.getTime() + (MAX_VISIBILITY_DAYS + 5) * 24 * 60 * 60 * 1000);
    const result = announcementSchema.safeParse({ ...validBase, visibilityEnd: tooFar });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('visibilityEnd');
    }
  });
});

// ── announcementSchema — invalid enum ─────────────────────────────────────────

describe('announcementSchema — invalid enum', () => {
  it('fails with an invalid type value', () => {
    const result = announcementSchema.safeParse({ ...validBase, type: 'invalid_type' });
    expect(result.success).toBe(false);
  });

  it('fails with an old DB-level type (activity_event)', () => {
    const result = announcementSchema.safeParse({ ...validBase, type: 'activity_event' });
    expect(result.success).toBe(false);
  });

  it('fails with an old DB-level type (limited_offer)', () => {
    const result = announcementSchema.safeParse({ ...validBase, type: 'limited_offer' });
    expect(result.success).toBe(false);
  });
});
