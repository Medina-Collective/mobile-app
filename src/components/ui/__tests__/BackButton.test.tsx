import React from 'react';
import { TouchableOpacity } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { BackButton } from '../BackButton';

const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

describe('BackButton', () => {
  beforeEach(() => mockBack.mockClear());

  it('renders without crashing', () => {
    const { toJSON } = render(<BackButton />);
    expect(toJSON()).not.toBeNull();
  });

  it('calls router.back() when pressed', () => {
    const { UNSAFE_getByType } = render(<BackButton />);
    fireEvent.press(UNSAFE_getByType(TouchableOpacity));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
