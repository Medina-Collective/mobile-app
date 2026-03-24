import { render, fireEvent } from '@testing-library/react-native';
import { ProfessionalCard } from '../ProfessionalCard';
import type { Professional } from '@app-types/professional';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

const base: Professional = {
  id: '1',
  businessName: 'Henna by Fatima',
  profileType: 'service',
  category: 'Beauty',
  subcategories: ['Henna', 'Makeup'],
  serviceTypes: ['at_home'],
  basedIn: 'Montreal',
  servesAreas: ['Montreal'],
  description: 'Test description',
  inquiryEmail: 'test@test.com',
  priceRange: '$$',
  status: 'approved',
  isFavorited: false,
};

describe('ProfessionalCard', () => {
  beforeEach(() => mockPush.mockClear());

  it('renders business name, category, location and type badge', () => {
    const { getByText } = render(<ProfessionalCard professional={base} />);
    expect(getByText('Henna by Fatima')).toBeTruthy();
    expect(getByText('Beauty · Henna, Makeup')).toBeTruthy();
    expect(getByText('Montreal')).toBeTruthy();
    expect(getByText('Service')).toBeTruthy();
  });

  it('renders avatar initials from the first two words', () => {
    const { getByText } = render(<ProfessionalCard professional={base} />);
    expect(getByText('HB')).toBeTruthy(); // "Henna by Fatima" → H + B
  });

  it('shows "?" when business name is empty', () => {
    const { getByText } = render(<ProfessionalCard professional={{ ...base, businessName: '' }} />);
    expect(getByText('?')).toBeTruthy();
  });

  it('shows price range when provided', () => {
    const { getByText } = render(<ProfessionalCard professional={base} />);
    expect(getByText('$$')).toBeTruthy();
  });

  it('hides price range when undefined', () => {
    const { queryByText } = render(
      <ProfessionalCard professional={{ ...base, priceRange: undefined }} />,
    );
    expect(queryByText('$$')).toBeNull();
  });

  it('shows only category when there are no subcategories', () => {
    const { getByText } = render(
      <ProfessionalCard professional={{ ...base, subcategories: [] }} />,
    );
    expect(getByText('Beauty')).toBeTruthy();
  });

  it('navigates to the profile screen on press', () => {
    const { getByText } = render(<ProfessionalCard professional={base} />);
    fireEvent.press(getByText('Henna by Fatima'));
    expect(mockPush).toHaveBeenCalledWith('/professional/1');
  });
});
