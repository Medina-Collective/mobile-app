import { render, fireEvent, act } from '@testing-library/react-native';
import { ProfileWizard } from '../ProfileWizard';

const mockBack = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ back: mockBack }) }));

// Mock all sub-components to keep tests fast and focused on wizard logic
jest.mock('../StepIndicator', () => ({
  StepIndicator: ({ currentStep }: { currentStep: number }) => {
    const { Text } = require('react-native');
    return <Text testID="step-indicator">{`step-${currentStep}`}</Text>;
  },
}));
jest.mock('../BusinessLogoPicker', () => ({ BusinessLogoPicker: () => null }));
jest.mock('../BusinessTypeSelector', () => ({
  BusinessTypeSelector: ({ onChange }: { onChange: (v: string) => void }) => {
    const { Text } = require('react-native');
    return <Text testID="type-selector" onPress={() => onChange('service')}>select-type</Text>;
  },
}));
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
    const { getByTestId } = render(
      <ProfileWizard submitLabel="Submit" onSubmit={mockOnSubmit} />,
    );
    expect(getByTestId('step-indicator').props.children).toBe('step-0');
  });

  it('advances to step 1 on Next when step 0 is valid', async () => {
    const { getByText, getByTestId } = render(
      <ProfileWizard submitLabel="Submit" onSubmit={mockOnSubmit} />,
    );
    // businessName is empty and profileType unset — validation fails, wizard stays on step 0
    await act(async () => { fireEvent.press(getByText('Next')); });
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
    const { getByText } = render(
      <ProfileWizard submitLabel="Submit" onSubmit={mockOnSubmit} />,
    );
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
      await act(async () => { fireEvent.press(getByText('Next')); });
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
    await act(async () => { fireEvent.press(getByText('Next')); });
    expect(getByTestId('step-indicator').props.children).toBe('step-1');
    // Step 1 → 3 (skip subcategory for 'shop')
    await act(async () => { fireEvent.press(getByText('Next')); });
    expect(getByTestId('step-indicator').props.children).toBe('step-3');
  });
});
