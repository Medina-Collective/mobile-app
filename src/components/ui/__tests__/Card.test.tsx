import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { Card } from '../Card';

describe('Card', () => {
  it('renders children', () => {
    const { getByText } = render(
      <Card>
        <Text>Card content</Text>
      </Card>,
    );
    expect(getByText('Card content')).toBeTruthy();
  });

  it('renders with custom padding', () => {
    const { toJSON } = render(
      <Card padding={6}>
        <Text>Content</Text>
      </Card>,
    );
    expect(toJSON()).not.toBeNull();
  });
});
