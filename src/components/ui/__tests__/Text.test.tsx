import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from '../Text';

describe('Text', () => {
  it('renders text content with default variant', () => {
    const { getByText } = render(<Text>Hello world</Text>);
    expect(getByText('Hello world')).toBeTruthy();
  });

  it('renders with heading1 variant', () => {
    const { getByText } = render(<Text variant="heading1">Title</Text>);
    expect(getByText('Title')).toBeTruthy();
  });

  it('renders with caption variant', () => {
    const { getByText } = render(<Text variant="caption">Small text</Text>);
    expect(getByText('Small text')).toBeTruthy();
  });
});
