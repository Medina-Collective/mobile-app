import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { Screen } from '../Screen';

jest.mock('react-native-safe-area-context', () => {
  const ReactModule = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, ...props }) =>
      ReactModule.createElement(View, props, children),
  };
});

describe('Screen', () => {
  it('renders children', () => {
    const { getByText } = render(
      <Screen>
        <Text>Screen content</Text>
      </Screen>,
    );
    expect(getByText('Screen content')).toBeTruthy();
  });

  it('renders with noTopInset', () => {
    const { getByText } = render(
      <Screen noTopInset>
        <Text>Content</Text>
      </Screen>,
    );
    expect(getByText('Content')).toBeTruthy();
  });

  it('renders with noHorizontalPadding', () => {
    const { toJSON } = render(
      <Screen noHorizontalPadding>
        <Text>Content</Text>
      </Screen>,
    );
    expect(toJSON()).not.toBeNull();
  });
});
