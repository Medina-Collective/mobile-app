import {
  professionalProfileSchema,
  PROFILE_TYPES,
  MONETIZATION_TYPES,
  CATEGORIES_BY_TYPE,
  SUBCATEGORIES_BY_CATEGORY,
  SERVICE_TYPE_OPTIONS,
  BASED_IN_OPTIONS,
  SERVES_AREAS_OPTIONS,
  PRICE_RANGES,
  CATEGORY_STEP_COPY,
  STEP_FIELDS,
  PROFILE_STATUS,
} from '../professional-profile.schema';

const validBase = {
  businessName: 'Henna by Fatima',
  profileType: 'freelancer_service' as const,
  monetizationType: 'for_profit' as const,
  category: 'Beauty',
  subcategories: ['Henna', 'Makeup'],
  serviceTypes: ['in_person', 'travels_to_client'],
  basedIn: 'Montreal',
  servesAreas: ['Laval', 'Longueuil'],
  description: 'Specialised henna artist serving the Montreal community.',
  inquiryEmail: 'hello@henna.com',
};

describe('professionalProfileSchema', () => {
  it('accepts a fully valid payload', () => {
    expect(professionalProfileSchema.safeParse(validBase).success).toBe(true);
  });

  it('accepts optional fields when omitted', () => {
    const result = professionalProfileSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it('rejects a businessName shorter than 2 characters', () => {
    const result = professionalProfileSchema.safeParse({ ...validBase, businessName: 'A' });
    expect(result.success).toBe(false);
  });

  it('rejects an empty businessName', () => {
    const result = professionalProfileSchema.safeParse({ ...validBase, businessName: '' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid profileType', () => {
    const result = professionalProfileSchema.safeParse({ ...validBase, profileType: 'gym' });
    expect(result.success).toBe(false);
  });

  it('accepts all valid profile types', () => {
    for (const { value } of PROFILE_TYPES) {
      const result = professionalProfileSchema.safeParse({ ...validBase, profileType: value });
      expect(result.success).toBe(true);
    }
  });

  it('rejects an invalid monetizationType', () => {
    const result = professionalProfileSchema.safeParse({
      ...validBase,
      monetizationType: 'mixed',
    });
    expect(result.success).toBe(false);
  });

  it('accepts all valid monetization types', () => {
    for (const { value } of MONETIZATION_TYPES) {
      const result = professionalProfileSchema.safeParse({ ...validBase, monetizationType: value });
      expect(result.success).toBe(true);
    }
  });

  it('rejects an empty category', () => {
    const result = professionalProfileSchema.safeParse({ ...validBase, category: '' });
    expect(result.success).toBe(false);
  });

  it('rejects an empty basedIn', () => {
    const result = professionalProfileSchema.safeParse({ ...validBase, basedIn: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a description shorter than 10 characters', () => {
    const result = professionalProfileSchema.safeParse({ ...validBase, description: 'Too short' });
    expect(result.success).toBe(false);
  });

  it('rejects a description longer than 300 characters', () => {
    const result = professionalProfileSchema.safeParse({
      ...validBase,
      description: 'a'.repeat(301),
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid inquiryEmail', () => {
    const result = professionalProfileSchema.safeParse({
      ...validBase,
      inquiryEmail: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });

  it('accepts an optional priceRange of $', () => {
    const result = professionalProfileSchema.safeParse({ ...validBase, priceRange: '$' });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid priceRange', () => {
    const result = professionalProfileSchema.safeParse({ ...validBase, priceRange: '$$$$' });
    expect(result.success).toBe(false);
  });
});

describe('PROFILE_TYPES', () => {
  it('contains exactly 4 types', () => {
    expect(PROFILE_TYPES).toHaveLength(4);
  });

  it('includes the 4 verified profile identity types', () => {
    const values = PROFILE_TYPES.map((t) => t.value);
    expect(values).toContain('community_organizer');
    expect(values).toContain('nonprofit_organization');
    expect(values).toContain('business_brand');
    expect(values).toContain('freelancer_service');
  });

  it('each type has a label and description', () => {
    for (const type of PROFILE_TYPES) {
      expect(type.label.length).toBeGreaterThan(0);
      expect(type.description.length).toBeGreaterThan(0);
    }
  });
});

describe('MONETIZATION_TYPES', () => {
  it('contains exactly 2 options', () => {
    expect(MONETIZATION_TYPES).toHaveLength(2);
  });

  it('includes nonprofit and for_profit', () => {
    const values = MONETIZATION_TYPES.map((t) => t.value);
    expect(values).toContain('nonprofit');
    expect(values).toContain('for_profit');
  });

  it('each option has a label and description', () => {
    for (const type of MONETIZATION_TYPES) {
      expect(type.label.length).toBeGreaterThan(0);
      expect(type.description.length).toBeGreaterThan(0);
    }
  });
});

describe('CATEGORIES_BY_TYPE', () => {
  it('has categories for all 4 profile types', () => {
    expect(CATEGORIES_BY_TYPE.community_organizer.length).toBeGreaterThan(0);
    expect(CATEGORIES_BY_TYPE.nonprofit_organization.length).toBeGreaterThan(0);
    expect(CATEGORIES_BY_TYPE.business_brand.length).toBeGreaterThan(0);
    expect(CATEGORIES_BY_TYPE.freelancer_service.length).toBeGreaterThan(0);
  });
});

describe('SUBCATEGORIES_BY_CATEGORY', () => {
  it('has subcategories for Beauty', () => {
    expect(SUBCATEGORIES_BY_CATEGORY['Beauty']?.length).toBeGreaterThan(0);
  });

  it('returns undefined for a category without subcategories', () => {
    expect(SUBCATEGORIES_BY_CATEGORY['Clothing']).toBeUndefined();
  });
});

describe('SERVICE_TYPE_OPTIONS', () => {
  it('contains 4 options', () => {
    expect(SERVICE_TYPE_OPTIONS).toHaveLength(4);
  });

  it('includes in_person, online, hybrid, travels_to_client', () => {
    const values = SERVICE_TYPE_OPTIONS.map((o) => o.value);
    expect(values).toContain('in_person');
    expect(values).toContain('online');
    expect(values).toContain('hybrid');
    expect(values).toContain('travels_to_client');
  });

  it('each option has value and label', () => {
    for (const opt of SERVICE_TYPE_OPTIONS) {
      expect(opt.value.length).toBeGreaterThan(0);
      expect(opt.label.length).toBeGreaterThan(0);
    }
  });
});

describe('location options', () => {
  it('BASED_IN_OPTIONS includes Montreal', () => {
    expect(BASED_IN_OPTIONS).toContain('Montreal');
  });

  it('SERVES_AREAS_OPTIONS includes Online', () => {
    expect(SERVES_AREAS_OPTIONS).toContain('Online');
  });
});

describe('PRICE_RANGES', () => {
  it('contains $, $$, $$$', () => {
    expect(PRICE_RANGES).toContain('$');
    expect(PRICE_RANGES).toContain('$$');
    expect(PRICE_RANGES).toContain('$$$');
  });
});

describe('CATEGORY_STEP_COPY', () => {
  it('has copy for all profile types', () => {
    const types = [
      'community_organizer',
      'nonprofit_organization',
      'business_brand',
      'freelancer_service',
    ] as const;
    for (const type of types) {
      expect(CATEGORY_STEP_COPY[type].title.length).toBeGreaterThan(0);
      expect(CATEGORY_STEP_COPY[type].subtitle.length).toBeGreaterThan(0);
    }
  });
});

describe('STEP_FIELDS', () => {
  it('has 8 entries for 8 steps', () => {
    expect(STEP_FIELDS).toHaveLength(8);
  });

  it('step 0 validates businessName and profileType', () => {
    expect(STEP_FIELDS[0]).toContain('businessName');
    expect(STEP_FIELDS[0]).toContain('profileType');
  });

  it('step 1 validates monetizationType', () => {
    expect(STEP_FIELDS[1]).toContain('monetizationType');
  });

  it('step 2 validates category', () => {
    expect(STEP_FIELDS[2]).toContain('category');
  });

  it('step 5 validates basedIn', () => {
    expect(STEP_FIELDS[5]).toContain('basedIn');
  });
});

describe('PROFILE_STATUS', () => {
  it('contains all expected states', () => {
    expect(PROFILE_STATUS.DRAFT).toBe('draft');
    expect(PROFILE_STATUS.PENDING_REVIEW).toBe('pending_review');
    expect(PROFILE_STATUS.APPROVED).toBe('approved');
    expect(PROFILE_STATUS.CHANGES_REQUESTED).toBe('changes_requested');
    expect(PROFILE_STATUS.REJECTED).toBe('rejected');
    expect(PROFILE_STATUS.NEEDS_FOLLOW_UP).toBe('needs_follow_up');
  });
});
