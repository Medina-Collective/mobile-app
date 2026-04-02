import {
  PROFILE_TYPE_LABELS,
  SERVICE_TYPE_LABELS,
  MONETIZATION_TYPE_LABELS,
} from '../professional';

describe('PROFILE_TYPE_LABELS', () => {
  it('has a label for every profile type', () => {
    expect(PROFILE_TYPE_LABELS.community_organizer).toBe('Community organizer');
    expect(PROFILE_TYPE_LABELS.nonprofit_organization).toBe('Mosque / association');
    expect(PROFILE_TYPE_LABELS.business_brand).toBe('Business / brand');
    expect(PROFILE_TYPE_LABELS.freelancer_service).toBe('Freelancer / service provider');
  });
});

describe('MONETIZATION_TYPE_LABELS', () => {
  it('has a label for every monetization type', () => {
    expect(MONETIZATION_TYPE_LABELS.nonprofit).toBe('Nonprofit / community-based');
    expect(MONETIZATION_TYPE_LABELS.for_profit).toBe('For-profit / paid');
  });
});

describe('SERVICE_TYPE_LABELS', () => {
  it('has a label for every service type', () => {
    expect(SERVICE_TYPE_LABELS.in_person).toBe('In person');
    expect(SERVICE_TYPE_LABELS.online).toBe('Online');
    expect(SERVICE_TYPE_LABELS.hybrid).toBe('Hybrid');
    expect(SERVICE_TYPE_LABELS.travels_to_client).toBe('Travels to client');
  });
});
