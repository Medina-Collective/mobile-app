import { render, fireEvent } from '@testing-library/react-native';
import { ActivityIndicator } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProfessionalList } from '../ProfessionalList';
import type { Professional } from '@app-types/professional';

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

const mockRetry = jest.fn().mockResolvedValue(undefined);

const professional: Professional = {
  id: '1',
  businessName: 'Henna by Fatima',
  profileType: 'freelancer_service',
  monetizationType: 'for_profit',
  category: 'Beauty',
  subcategories: [],
  serviceTypes: [],
  basedIn: 'Montreal',
  servesAreas: [],
  description: 'Test',
  inquiryEmail: 'test@test.com',
  status: 'approved',
  isFavorited: false,
};

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));

describe('ProfessionalList', () => {
  it('shows a spinner while loading', () => {
    const { UNSAFE_getByType } = renderWithQuery(
      <ProfessionalList
        data={undefined}
        isLoading={true}
        isError={false}
        onRetry={mockRetry}
        errorMessage="Error"
      />,
    );
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('shows the error message and retry button on error', () => {
    const { getByText } = renderWithQuery(
      <ProfessionalList
        data={undefined}
        isLoading={false}
        isError={true}
        onRetry={mockRetry}
        errorMessage="Could not load."
      />,
    );
    expect(getByText('Could not load.')).toBeTruthy();
    expect(getByText('Try again')).toBeTruthy();
  });

  it('calls onRetry when the retry button is pressed', () => {
    const { getByText } = renderWithQuery(
      <ProfessionalList
        data={undefined}
        isLoading={false}
        isError={true}
        onRetry={mockRetry}
        errorMessage="Error"
      />,
    );
    fireEvent.press(getByText('Try again'));
    expect(mockRetry).toHaveBeenCalled();
  });

  it('shows the empty message when data is empty and emptyMessage is provided', () => {
    const { getByText } = renderWithQuery(
      <ProfessionalList
        data={[]}
        isLoading={false}
        isError={false}
        onRetry={mockRetry}
        errorMessage="Error"
        emptyMessage="Nothing saved yet."
      />,
    );
    expect(getByText('Nothing saved yet.')).toBeTruthy();
  });

  it('renders null when data is empty and no emptyMessage is provided', () => {
    const { toJSON } = renderWithQuery(
      <ProfessionalList
        data={[]}
        isLoading={false}
        isError={false}
        onRetry={mockRetry}
        errorMessage="Error"
      />,
    );
    expect(toJSON()).toBeNull();
  });

  it('renders the list of professionals', () => {
    const { getByText } = renderWithQuery(
      <ProfessionalList
        data={[professional]}
        isLoading={false}
        isError={false}
        onRetry={mockRetry}
        errorMessage="Error"
      />,
    );
    expect(getByText('Henna by Fatima')).toBeTruthy();
  });
});
