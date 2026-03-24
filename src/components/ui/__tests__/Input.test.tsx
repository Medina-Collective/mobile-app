import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from '../Input';

describe('Input', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<Input />);
    expect(toJSON()).not.toBeNull();
  });

  it('renders the label when provided', () => {
    const { getByText } = render(<Input label="Email" />);
    expect(getByText('Email')).toBeTruthy();
  });

  it('does not render label when omitted', () => {
    const { queryByText } = render(<Input placeholder="Enter value" />);
    expect(queryByText('Email')).toBeNull();
  });

  it('renders error message when error prop is set', () => {
    const { getByText } = render(<Input error="Required field" />);
    expect(getByText('Required field')).toBeTruthy();
  });

  it('does not render error text when error is undefined', () => {
    const { queryByText } = render(<Input placeholder="test" />);
    expect(queryByText('Required field')).toBeNull();
  });

  it('calls onFocus callback when focused', () => {
    const onFocus = jest.fn();
    const { getByPlaceholderText } = render(<Input placeholder="test-input" onFocus={onFocus} />);
    fireEvent(getByPlaceholderText('test-input'), 'focus');
    expect(onFocus).toHaveBeenCalled();
  });

  it('calls onBlur callback when blurred', () => {
    const onBlur = jest.fn();
    const { getByPlaceholderText } = render(<Input placeholder="test-input" onBlur={onBlur} />);
    fireEvent(getByPlaceholderText('test-input'), 'blur');
    expect(onBlur).toHaveBeenCalled();
  });
});
