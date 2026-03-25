import { PROFILE_TYPE_LABELS, SERVICE_TYPE_LABELS } from '../professional';

describe('PROFILE_TYPE_LABELS', () => {
  it('has a label for every profile type', () => {
    expect(PROFILE_TYPE_LABELS.shop).toBe('Shop');
    expect(PROFILE_TYPE_LABELS.service).toBe('Service');
    expect(PROFILE_TYPE_LABELS.organizer).toBe('Organizer');
    expect(PROFILE_TYPE_LABELS.classes_circles).toBe('Classes & Circles');
  });
});

describe('SERVICE_TYPE_LABELS', () => {
  it('has a label for every service type', () => {
    expect(SERVICE_TYPE_LABELS.at_home).toBe('At home');
    expect(SERVICE_TYPE_LABELS.has_studio).toBe('Has a studio');
    expect(SERVICE_TYPE_LABELS.online).toBe('Online');
    expect(SERVICE_TYPE_LABELS.travels_to_client).toBe('Travels to client');
  });
});
