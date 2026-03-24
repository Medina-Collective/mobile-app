import React from 'react';
import { ActivityIndicator, TouchableOpacity } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with title', () => {
    const { getByText } = render(<Button title="Press me" />);
    expect(getByText('Press me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Press me" onPress={onPress} />);
    fireEvent.press(getByText('Press me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows ActivityIndicator and hides title when loading', () => {
    const { UNSAFE_getByType, queryByText } = render(<Button title="Press me" loading />);
    expect(queryByText('Press me')).toBeNull();
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('is disabled when loading prop is true', () => {
    const { UNSAFE_getByType } = render(<Button title="Press" loading />);
    expect(UNSAFE_getByType(TouchableOpacity).props.disabled).toBe(true);
  });

  it('is disabled when disabled prop is true', () => {
    const { UNSAFE_getByType } = render(<Button title="Press" disabled />);
    expect(UNSAFE_getByType(TouchableOpacity).props.disabled).toBe(true);
  });

  it('renders outline variant without crashing', () => {
    const { getByText } = render(<Button title="Outline" variant="outline" />);
    expect(getByText('Outline')).toBeTruthy();
  });

  it('renders ghost variant without crashing', () => {
    const { getByText } = render(<Button title="Ghost" variant="ghost" />);
    expect(getByText('Ghost')).toBeTruthy();
  });
});
