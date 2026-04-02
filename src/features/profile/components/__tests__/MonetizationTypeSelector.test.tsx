import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MonetizationTypeSelector } from '../MonetizationTypeSelector';

describe('MonetizationTypeSelector', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<MonetizationTypeSelector value={undefined} onChange={jest.fn()} />);
    expect(toJSON()).not.toBeNull();
  });

  it('renders both monetization type options', () => {
    const { getByText } = render(
      <MonetizationTypeSelector value={undefined} onChange={jest.fn()} />,
    );
    expect(getByText('Nonprofit / community-based')).toBeTruthy();
    expect(getByText('For-profit / paid')).toBeTruthy();
  });

  it('calls onChange with nonprofit when that card is pressed', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <MonetizationTypeSelector value={undefined} onChange={onChange} />,
    );
    fireEvent.press(getByText('Nonprofit / community-based'));
    expect(onChange).toHaveBeenCalledWith('nonprofit');
  });

  it('calls onChange with for_profit when that card is pressed', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <MonetizationTypeSelector value={undefined} onChange={onChange} />,
    );
    fireEvent.press(getByText('For-profit / paid'));
    expect(onChange).toHaveBeenCalledWith('for_profit');
  });

  it('renders an error message when error prop is provided', () => {
    const { getByText } = render(
      <MonetizationTypeSelector value={undefined} onChange={jest.fn()} error="Required" />,
    );
    expect(getByText('Required')).toBeTruthy();
  });

  it('does not render error text when error is undefined', () => {
    const { queryByText } = render(
      <MonetizationTypeSelector value={undefined} onChange={jest.fn()} />,
    );
    expect(queryByText('Required')).toBeNull();
  });

  it('renders descriptions for each option', () => {
    const { getByText } = render(
      <MonetizationTypeSelector value={undefined} onChange={jest.fn()} />,
    );
    expect(getByText('Free or donation-based, no profit goal')).toBeTruthy();
    expect(getByText('Charge for products or services')).toBeTruthy();
  });
});
