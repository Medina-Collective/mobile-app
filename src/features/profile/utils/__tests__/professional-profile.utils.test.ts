import { formDataToRow } from '../professional-profile.utils';
import type { ProfessionalProfileFormData } from '@features/profile/schemas/professional-profile.schema';

const base: ProfessionalProfileFormData = {
  businessName: 'Henna by Fatima',
  profileType: 'freelancer_service',
  monetizationType: 'for_profit',
  category: 'Beauty',
  subcategories: ['Henna'],
  serviceTypes: ['in_person'],
  basedIn: 'Montreal',
  servesAreas: ['Montreal'],
  description: 'A great henna artist.',
  inquiryEmail: 'hello@henna.com',
  instagram: '',
  phone: '',
  website: '',
  bookingLink: '',
  startingPrice: '',
};

describe('formDataToRow', () => {
  it('maps all required fields correctly', () => {
    const row = formDataToRow(base);
    expect(row.business_name).toBe('Henna by Fatima');
    expect(row.profile_type).toBe('freelancer_service');
    expect(row.monetization_type).toBe('for_profit');
    expect(row.category).toBe('Beauty');
    expect(row.subcategories).toEqual(['Henna']);
    expect(row.service_types).toEqual(['in_person']);
    expect(row.based_in).toBe('Montreal');
    expect(row.serves_areas).toEqual(['Montreal']);
    expect(row.description).toBe('A great henna artist.');
    expect(row.inquiry_email).toBe('hello@henna.com');
  });

  it('passes empty string optional fields through as empty strings', () => {
    const row = formDataToRow(base);
    expect(row.instagram).toBe('');
    expect(row.phone).toBe('');
    expect(row.website).toBe('');
    expect(row.booking_link).toBe('');
    expect(row.starting_price).toBe('');
    expect(row.logo_uri).toBeNull(); // undefined ?? null → null
  });

  it('maps provided optional fields through', () => {
    const row = formDataToRow({
      ...base,
      instagram: 'hennaartist',
      phone: '+15140000000',
      website: 'https://henna.com',
      bookingLink: 'https://cal.com/henna',
      priceRange: '$$',
      startingPrice: '$50',
      logoUri: 'file://logo.png',
    });
    expect(row.instagram).toBe('hennaartist');
    expect(row.phone).toBe('+15140000000');
    expect(row.website).toBe('https://henna.com');
    expect(row.booking_link).toBe('https://cal.com/henna');
    expect(row.price_range).toBe('$$');
    expect(row.starting_price).toBe('$50');
    expect(row.logo_uri).toBe('file://logo.png');
  });

  it('maps undefined optional fields to null', () => {
    const row = formDataToRow({ ...base, priceRange: undefined, logoUri: undefined });
    expect(row.price_range).toBeNull();
    expect(row.logo_uri).toBeNull();
  });
});
