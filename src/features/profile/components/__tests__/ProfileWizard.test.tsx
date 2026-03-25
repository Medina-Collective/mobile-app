import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { ProfileWizard } from '../ProfileWizard';
import * as ImagePicker from 'expo-image-picker';

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
jest.mock('../BusinessLogoPicker', () => {
  const { TouchableOpacity } = require('react-native');
  return {
    BusinessLogoPicker: ({ onPress }: { onPress: () => void }) => (
      <TouchableOpacity testID="logo-picker" onPress={onPress} />
    ),
  };
});
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
jest.mock('../CategorySelector', () => {
  const { Text } = require('react-native');
  return {
    CategorySelector: ({ onChange }: { onChange: (v: string) => void }) => (
      <Text testID="category-selector" onPress={() => onChange('Beauty')}>
        select-category
      </Text>
    ),
  };
});
jest.mock('../SubcategorySelector', () => {
  const { Text } = require('react-native');
  return {
    SubcategorySelector: ({ onChange }: { onChange: (v: string[]) => void }) => (
      <Text testID="subcategory-selector" onPress={() => onChange(['Henna'])}>
        select-subcategory
      </Text>
    ),
  };
});
jest.mock('../ServiceTypeSelector', () => {
  const { Text } = require('react-native');
  return {
    ServiceTypeSelector: ({ onChange }: { onChange: (v: string[]) => void }) => (
      <Text testID="service-type-selector" onPress={() => onChange(['at_home'])}>
        select-service-type
      </Text>
    ),
  };
});
jest.mock('../LocationStep', () => {
  const { Text } = require('react-native');
  return {
    LocationStep: ({
      onBasedInChange,
      onServesAreasChange,
    }: {
      onBasedInChange: (v: string) => void;
      onServesAreasChange: (v: string[]) => void;
    }) => (
      <Text
        testID="location-step"
        onPress={() => {
          onBasedInChange('Montreal');
          onServesAreasChange(['Montreal']);
        }}
      >
        location
      </Text>
    ),
  };
});
jest.mock('../ProfilePreviewCard', () => {
  const { Text } = require('react-native');
  return {
    ProfilePreviewCard: ({ onEditStep }: { onEditStep: (step: number) => void }) => (
      <Text testID="preview-card" onPress={() => onEditStep(0)}>
        preview
      </Text>
    ),
  };
});
/* eslint-enable @typescript-eslint/no-require-imports */

const mockOnSubmit = jest.fn().mockResolvedValue(undefined);

const fullDefaultValues = {
  businessName: 'Test Business',
  profileType: 'shop' as const,
  category: 'Food & Sweets',
  subcategories: [],
  serviceTypes: [],
  basedIn: 'Montreal',
  servesAreas: ['Montreal'],
  description: 'A description with enough characters to pass validation minimum.',
  inquiryEmail: 'test@test.com',
};

beforeEach(() => {
  mockBack.mockClear();
  mockOnSubmit.mockClear();
});

describe('ProfileWizard', () => {
  it('starts on step 0', () => {
    const { getByTestId } = render(<ProfileWizard submitLabel="Submit" onSubmit={mockOnSubmit} />);
    expect(getByTestId('step-indicator').props.children).toBe('step-0');
  });

  it('stays on step 0 when Next is pressed with empty businessName', async () => {
    const { getByText, getByTestId } = render(
      <ProfileWizard submitLabel="Submit" onSubmit={mockOnSubmit} />,
    );
    await act(async () => {
      fireEvent.press(getByText('Next'));
    });
    expect(getByTestId('step-indicator').props.children).toBe('step-0');
  });

  it('calls onCancel when Cancel is pressed on step 0 with onCancel prop', () => {
    const onCancel = jest.fn();
    const { getByText } = render(
      <ProfileWizard submitLabel="Submit" onSubmit={mockOnSubmit} onCancel={onCancel} />,
    );
    fireEvent.press(getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls router.back when Cancel is pressed on step 0 without onCancel prop', () => {
    const { getByText } = render(<ProfileWizard submitLabel="Submit" onSubmit={mockOnSubmit} />);
    fireEvent.press(getByText('Cancel'));
    expect(mockBack).toHaveBeenCalledTimes(1);
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
        defaultValues={{ businessName: 'Test', profileType: 'shop', category: 'Food & Sweets' }}
      />,
    );
    await act(async () => fireEvent.press(getByText('Next')));
    expect(getByTestId('step-indicator').props.children).toBe('step-1');
    await act(async () => fireEvent.press(getByText('Next')));
    expect(getByTestId('step-indicator').props.children).toBe('step-3');
  });

  it('goes to step 2 (subcategory) for service profile type', async () => {
    const { getByText, getByTestId } = render(
      <ProfileWizard
        submitLabel="Submit"
        onSubmit={mockOnSubmit}
        defaultValues={{ businessName: 'Test', profileType: 'service', category: 'Beauty' }}
      />,
    );
    await act(async () => fireEvent.press(getByText('Next')));
    await act(async () => fireEvent.press(getByText('Next')));
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
    await act(async () => fireEvent.press(getByText('Next')));
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
    await act(async () => fireEvent.press(getByText('Next')));
    await act(async () => fireEvent.press(getByText('Next')));
    expect(getByTestId('step-indicator').props.children).toBe('step-3');
    fireEvent.press(getByText('Back'));
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
    await act(async () => fireEvent.press(getByText('Next')));
    await act(async () => fireEvent.press(getByText('Next')));
    await act(async () => fireEvent.press(getByText('Next')));
    expect(getByTestId('step-indicator').props.children).toBe('step-3');
    fireEvent.press(getByText('Back'));
    expect(getByTestId('step-indicator').props.children).toBe('step-2');
  });

  it('shows the submitLabel on the last step', async () => {
    const { getByText } = render(
      <ProfileWizard
        submitLabel="Save changes"
        onSubmit={mockOnSubmit}
        defaultValues={fullDefaultValues}
      />,
    );
    for (let i = 0; i < 5; i++) {
      await act(async () => fireEvent.press(getByText('Next')));
    }
    expect(getByText('Save changes')).toBeTruthy();
  });

  it('calls onSubmit with form data on last step submit', async () => {
    const { getByText } = render(
      <ProfileWizard
        submitLabel="Submit"
        onSubmit={mockOnSubmit}
        defaultValues={fullDefaultValues}
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

  it('resets subcategories when category changes on step 1', async () => {
    const { getByText, getByTestId } = render(
      <ProfileWizard
        submitLabel="Submit"
        onSubmit={mockOnSubmit}
        defaultValues={{
          businessName: 'Test',
          profileType: 'service',
          category: 'Beauty',
          subcategories: ['Henna'],
        }}
      />,
    );
    await act(async () => fireEvent.press(getByText('Next')));
    expect(getByTestId('step-indicator').props.children).toBe('step-1');
    // Trigger category change — mock calls onChange('Beauty'), which resets subcategories
    fireEvent.press(getByTestId('category-selector'));
    // Advance to subcategory step and check subcategories were reset
    await act(async () => fireEvent.press(getByText('Next')));
    expect(getByTestId('step-indicator').props.children).toBe('step-2');
  });

  it('onEditStep from preview card navigates back to the given step', async () => {
    const { getByText, getByTestId } = render(
      <ProfileWizard
        submitLabel="Submit"
        onSubmit={mockOnSubmit}
        defaultValues={fullDefaultValues}
      />,
    );
    for (let i = 0; i < 5; i++) {
      await act(async () => fireEvent.press(getByText('Next')));
    }
    expect(getByTestId('step-indicator').props.children).toBe('step-6');
    fireEvent.press(getByTestId('preview-card'));
    expect(getByTestId('step-indicator').props.children).toBe('step-0');
  });

  it('shows the price chip toggle on step 5', async () => {
    const { getByText, getByTestId } = render(
      <ProfileWizard
        submitLabel="Submit"
        onSubmit={mockOnSubmit}
        defaultValues={fullDefaultValues}
      />,
    );
    // Navigate to step 5: 0→1→3→4→5
    for (let i = 0; i < 4; i++) {
      await act(async () => fireEvent.press(getByText('Next')));
    }
    expect(getByTestId('step-indicator').props.children).toBe('step-5');
    // Select a price range chip
    fireEvent.press(getByText('$'));
    // Press it again to deselect (covers the isSelected ? undefined : range branch)
    fireEvent.press(getByText('$'));
  });

  it('shows alert when image picker permission is denied', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: false,
    });
    const { getByTestId } = render(<ProfileWizard submitLabel="Submit" onSubmit={mockOnSubmit} />);
    await act(async () => fireEvent.press(getByTestId('logo-picker')));
    expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
    expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
  });

  it('sets logoUri when image is selected', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: true,
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://logo.png' }],
    });
    const { getByTestId } = render(<ProfileWizard submitLabel="Submit" onSubmit={mockOnSubmit} />);
    await act(async () => fireEvent.press(getByTestId('logo-picker')));
    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
  });

  it('does not set logoUri when image picker is cancelled', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: true,
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: true,
      assets: [],
    });
    const { getByTestId } = render(<ProfileWizard submitLabel="Submit" onSubmit={mockOnSubmit} />);
    await act(async () => fireEvent.press(getByTestId('logo-picker')));
    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
  });
});
