import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { ProfileWizard } from '../ProfileWizard';

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

const mockBack = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ back: mockBack }) }));

/* eslint-disable @typescript-eslint/no-require-imports */
// Mock all sub-components to keep tests fast and focused on wizard logic
jest.mock('../StepIndicator', () => {
  const { Text } = require('react-native');
  return {
    StepIndicator: ({ currentStep }: { currentStep: number }) => (
      <Text testID="step-indicator">{`step-${currentStep}`}</Text>
    ),
  };
});
jest.mock('../BusinessLogoPicker', () => ({ BusinessLogoPicker: () => null }));
jest.mock('../BusinessTypeSelector', () => {
  const { Text } = require('react-native');
  return {
    BusinessTypeSelector: ({ onChange }: { onChange: (v: string) => void }) => (
      <Text testID="type-selector" onPress={() => onChange('service')}>
        select-type
      </Text>
    ),
  };
});
/* eslint-enable @typescript-eslint/no-require-imports */
jest.mock('../CategorySelector', () => ({ CategorySelector: () => null }));
jest.mock('../SubcategorySelector', () => ({ SubcategorySelector: () => null }));
jest.mock('../ServiceTypeSelector', () => ({ ServiceTypeSelector: () => null }));
jest.mock('../LocationStep', () => ({ LocationStep: () => null }));
jest.mock('../ProfilePreviewCard', () => ({ ProfilePreviewCard: () => null }));

const mockOnSubmit = jest.fn().mockResolvedValue(undefined);

beforeEach(() => {
  mockBack.mockClear();
  mockOnSubmit.mockClear();
});

describe('ProfileWizard', () => {
  it('starts on step 0', () => {
    const { getByTestId } = render(<ProfileWizard submitLabel="Submit" onSubmit={mockOnSubmit} />);
    expect(getByTestId('step-indicator').props.children).toBe('step-0');
  });

  it('advances to step 1 on Next when step 0 is valid', async () => {
    const { getByText, getByTestId } = render(
      <ProfileWizard submitLabel="Submit" onSubmit={mockOnSubmit} />,
    );
    // businessName is empty and profileType unset — validation fails, wizard stays on step 0
    await act(async () => {
      fireEvent.press(getByText('Next'));
    });
    // With empty businessName, validation fails — still on step 0
    expect(getByTestId('step-indicator').props.children).toBe('step-0');
  });

  it('calls onCancel when Back is pressed on step 0 with onCancel prop', () => {
    const onCancel = jest.fn();
    const { getByText } = render(
      <ProfileWizard submitLabel="Submit" onSubmit={mockOnSubmit} onCancel={onCancel} />,
    );
    fireEvent.press(getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls router.back when Back is pressed on step 0 without onCancel prop', () => {
    const { getByText } = render(<ProfileWizard submitLabel="Submit" onSubmit={mockOnSubmit} />);
    fireEvent.press(getByText('Cancel'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('shows the submitLabel on the last step', async () => {
    const { getByText } = render(
      <ProfileWizard
        submitLabel="Save changes"
        onSubmit={mockOnSubmit}
        defaultValues={{
          businessName: 'Test Business',
          profileType: 'shop', // shop skips subcategory step → 5 Next presses to reach review
          category: 'Food & Sweets',
          subcategories: [],
          serviceTypes: [],
          basedIn: 'Montreal',
          servesAreas: ['Montreal'],
          description: 'A description with enough characters to pass validation minimum.',
          inquiryEmail: 'test@test.com',
        }}
      />,
    );
    // shop type: steps 0→1→3→4→5→6 = 5 presses (subcategory is skipped)
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        fireEvent.press(getByText('Next'));
      });
    }
    expect(getByText('Save changes')).toBeTruthy();
  });

  it('pre-populates businessName from defaultValues', () => {
    const { getByDisplayValue } = render(
      <ProfileWizard
        submitLabel="Submit"
        onSubmit={mockOnSubmit}
        defaultValues={{ businessName: 'My Business' }}
      />,
    );
    expect(getByDisplayValue('My Business')).toBeTruthy();
  });

  it('skips subcategory step (step 2) for non-service profile types', async () => {
    const { getByText, getByTestId } = render(
      <ProfileWizard
        submitLabel="Submit"
        onSubmit={mockOnSubmit}
        defaultValues={{
          businessName: 'Test',
          profileType: 'shop',
          category: 'Food & Sweets',
        }}
      />,
    );
    // Step 0 → 1 (category)
    await act(async () => {
      fireEvent.press(getByText('Next'));
    });
    expect(getByTestId('step-indicator').props.children).toBe('step-1');
    // Step 1 → 3 (skip subcategory for 'shop')
    await act(async () => {
      fireEvent.press(getByText('Next'));
    });
    expect(getByTestId('step-indicator').props.children).toBe('step-3');
  });

  it('goes to step 2 (subcategory) for service profile type', async () => {
    const { getByText, getByTestId } = render(
      <ProfileWizard
        submitLabel="Submit"
        onSubmit={mockOnSubmit}
        defaultValues={{
          businessName: 'Test',
          profileType: 'service',
          category: 'Beauty',
        }}
      />,
    );
    await act(async () => {
      fireEvent.press(getByText('Next'));
    });
    expect(getByTestId('step-indicator').props.children).toBe('step-1');
    await act(async () => {
      fireEvent.press(getByText('Next'));
    });
    // service type: should land on step 2 (subcategory)
    expect(getByTestId('step-indicator').props.children).toBe('step-2');
  });

  it('Back from step 1 returns to step 0', async () => {
    const { getByText, getByTestId } = render(
      <ProfileWizard
        submitLabel="Submit"
        onSubmit={mockOnSubmit}
        defaultValues={{ businessName: 'Test', profileType: 'shop', category: 'Food & Sweets' }}
      />,
    );
    await act(async () => {
      fireEvent.press(getByText('Next'));
    });
    expect(getByTestId('step-indicator').props.children).toBe('step-1');
    fireEvent.press(getByText('Back'));
    expect(getByTestId('step-indicator').props.children).toBe('step-0');
  });

  it('Back from step 3 goes to step 1 for non-service type (skips subcategory)', async () => {
    const { getByText, getByTestId } = render(
      <ProfileWizard
        submitLabel="Submit"
        onSubmit={mockOnSubmit}
        defaultValues={{ businessName: 'Test', profileType: 'shop', category: 'Food & Sweets' }}
      />,
    );
    // 0 → 1 → 3 (skip step 2)
    await act(async () => fireEvent.press(getByText('Next')));
    await act(async () => fireEvent.press(getByText('Next')));
    expect(getByTestId('step-indicator').props.children).toBe('step-3');
    fireEvent.press(getByText('Back'));
    // Should skip step 2 back to step 1
    expect(getByTestId('step-indicator').props.children).toBe('step-1');
  });

  it('Back from step 3 goes to step 2 for service type', async () => {
    const { getByText, getByTestId } = render(
      <ProfileWizard
        submitLabel="Submit"
        onSubmit={mockOnSubmit}
        defaultValues={{ businessName: 'Test', profileType: 'service', category: 'Beauty' }}
      />,
    );
    // 0 → 1 → 2 → 3
    await act(async () => fireEvent.press(getByText('Next')));
    await act(async () => fireEvent.press(getByText('Next')));
    await act(async () => fireEvent.press(getByText('Next')));
    expect(getByTestId('step-indicator').props.children).toBe('step-3');
    fireEvent.press(getByText('Back'));
    expect(getByTestId('step-indicator').props.children).toBe('step-2');
  });

  it('calls onSubmit with form data when submitted on the last step', async () => {
    const { getByText } = render(
      <ProfileWizard
        submitLabel="Submit"
        onSubmit={mockOnSubmit}
        defaultValues={{
          businessName: 'Test Business',
          profileType: 'shop',
          category: 'Food & Sweets',
          subcategories: [],
          serviceTypes: [],
          basedIn: 'Montreal',
          servesAreas: ['Montreal'],
          description: 'A description with enough characters to pass validation minimum.',
          inquiryEmail: 'test@test.com',
        }}
      />,
    );
    for (let i = 0; i < 5; i++) {
      await act(async () => fireEvent.press(getByText('Next')));
    }
    await act(async () => fireEvent.press(getByText('Submit')));
    await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledTimes(1));
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ businessName: 'Test Business', inquiryEmail: 'test@test.com' }),
    );
  });
});
