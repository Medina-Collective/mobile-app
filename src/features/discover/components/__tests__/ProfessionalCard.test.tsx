import { render, fireEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProfessionalCard } from '../ProfessionalCard';
import type { Professional } from '@app-types/professional';

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

const base: Professional = {
  id: '1',
  businessName: 'Henna by Fatima',
  profileType: 'freelancer_service',
  monetizationType: 'for_profit',
  category: 'Beauty',
  subcategories: ['Henna', 'Makeup'],
  serviceTypes: ['in_person'],
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
    const { getByText } = renderWithQuery(<ProfessionalCard professional={base} />);
    expect(getByText('Henna by Fatima')).toBeTruthy();
    expect(getByText('Beauty · Henna, Makeup')).toBeTruthy();
    expect(getByText('Montreal')).toBeTruthy();
    expect(getByText('Freelancer / service provider')).toBeTruthy();
  });

  it('renders avatar initials from the first two words', () => {
    const { getByText } = renderWithQuery(<ProfessionalCard professional={base} />);
    expect(getByText('HB')).toBeTruthy(); // "Henna by Fatima" → H + B
  });

  it('shows "?" when business name is empty', () => {
    const { getByText } = renderWithQuery(
      <ProfessionalCard professional={{ ...base, businessName: '' }} />,
    );
    expect(getByText('?')).toBeTruthy();
  });

  it('shows price range when provided', () => {
    const { getByText } = renderWithQuery(<ProfessionalCard professional={base} />);
    expect(getByText('$$')).toBeTruthy();
  });

  it('hides price range when undefined', () => {
    const { queryByText } = renderWithQuery(
      <ProfessionalCard professional={{ ...base, priceRange: undefined }} />,
    );
    expect(queryByText('$$')).toBeNull();
  });

  it('shows only category when there are no subcategories', () => {
    const { getByText } = renderWithQuery(
      <ProfessionalCard professional={{ ...base, subcategories: [] }} />,
    );
    expect(getByText('Beauty')).toBeTruthy();
  });

  it('navigates to the profile screen on press', () => {
    const { getByText } = renderWithQuery(<ProfessionalCard professional={base} />);
    fireEvent.press(getByText('Henna by Fatima'));
    expect(mockPush).toHaveBeenCalledWith('/professional/1');
  });
});
