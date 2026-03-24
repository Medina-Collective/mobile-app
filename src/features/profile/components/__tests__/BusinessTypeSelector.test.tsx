import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BusinessTypeSelector } from '../BusinessTypeSelector';

describe('BusinessTypeSelector', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(
      <BusinessTypeSelector value={undefined} onChange={jest.fn()} />,
    );
    expect(toJSON()).not.toBeNull();
  });

  it('renders all 4 profile type cards', () => {
    const { getByText } = render(
      <BusinessTypeSelector value={undefined} onChange={jest.fn()} />,
    );
    expect(getByText('Shop')).toBeTruthy();
    expect(getByText('Service')).toBeTruthy();
    expect(getByText('Organizer')).toBeTruthy();
    expect(getByText('Classes & Circles')).toBeTruthy();
  });

  it('calls onChange with the selected type when a card is pressed', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <BusinessTypeSelector value={undefined} onChange={onChange} />,
    );
    fireEvent.press(getByText('Service'));
    expect(onChange).toHaveBeenCalledWith('service');
  });

  it('renders an error message when error prop is provided', () => {
    const { getByText } = render(
      <BusinessTypeSelector value={undefined} onChange={jest.fn()} error="Required" />,
    );
    expect(getByText('Required')).toBeTruthy();
  });

  it('does not render error text when error is undefined', () => {
    const { queryByText } = render(
      <BusinessTypeSelector value={undefined} onChange={jest.fn()} />,
    );
    expect(queryByText('Required')).toBeNull();
  });

  it('renders the "shop" card as selected when value is shop', () => {
    const { getByText } = render(
      <BusinessTypeSelector value="shop" onChange={jest.fn()} />,
    );
    expect(getByText('Shop')).toBeTruthy();
  });
});
