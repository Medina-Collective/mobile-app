import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BusinessLogoPicker } from '../BusinessLogoPicker';

describe('BusinessLogoPicker', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(
      <BusinessLogoPicker businessName="Henna Studio" onPress={jest.fn()} />,
    );
    expect(toJSON()).not.toBeNull();
  });

  it('displays initials derived from businessName', () => {
    const { getByText } = render(
      <BusinessLogoPicker businessName="Henna Studio" onPress={jest.fn()} />,
    );
    expect(getByText('HS')).toBeTruthy();
  });

  it('displays initials for a single-word name', () => {
    const { getByText } = render(
      <BusinessLogoPicker businessName="Fatima" onPress={jest.fn()} />,
    );
    expect(getByText('F')).toBeTruthy();
  });

  it('displays ? when businessName is empty', () => {
    const { getByText } = render(
      <BusinessLogoPicker businessName="" onPress={jest.fn()} />,
    );
    expect(getByText('?')).toBeTruthy();
  });

  it('calls onPress when the picker is tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <BusinessLogoPicker businessName="Henna Studio" onPress={onPress} />,
    );
    fireEvent.press(getByText('HS'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
