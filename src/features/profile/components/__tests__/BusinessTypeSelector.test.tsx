import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BusinessTypeSelector } from '../BusinessTypeSelector';

describe('BusinessTypeSelector', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<BusinessTypeSelector value={undefined} onChange={jest.fn()} />);
    expect(toJSON()).not.toBeNull();
  });

  it('renders all 4 profile type cards', () => {
    const { getByText } = render(<BusinessTypeSelector value={undefined} onChange={jest.fn()} />);
    expect(getByText('Community organizer')).toBeTruthy();
    expect(getByText('Mosque / association')).toBeTruthy();
    expect(getByText('Business / brand')).toBeTruthy();
    expect(getByText('Freelancer / service provider')).toBeTruthy();
  });

  it('calls onChange with the selected type when a card is pressed', () => {
    const onChange = jest.fn();
    const { getByText } = render(<BusinessTypeSelector value={undefined} onChange={onChange} />);
    fireEvent.press(getByText('Freelancer / service provider'));
    expect(onChange).toHaveBeenCalledWith('freelancer_service');
  });

  it('renders an error message when error prop is provided', () => {
    const { getByText } = render(
      <BusinessTypeSelector value={undefined} onChange={jest.fn()} error="Required" />,
    );
    expect(getByText('Required')).toBeTruthy();
  });

  it('does not render error text when error is undefined', () => {
    const { queryByText } = render(<BusinessTypeSelector value={undefined} onChange={jest.fn()} />);
    expect(queryByText('Required')).toBeNull();
  });

  it('renders the "community_organizer" card as selected when value is community_organizer', () => {
    const { getByText } = render(
      <BusinessTypeSelector value="community_organizer" onChange={jest.fn()} />,
    );
    expect(getByText('Community organizer')).toBeTruthy();
  });
});
