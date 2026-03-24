import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LocationStep } from '../LocationStep';

const defaultProps = {
  basedIn: '',
  onBasedInChange: jest.fn(),
  servesAreas: [],
  onServesAreasChange: jest.fn(),
};

describe('LocationStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { toJSON } = render(<LocationStep {...defaultProps} />);
    expect(toJSON()).not.toBeNull();
  });

  it('renders section labels', () => {
    const { getByText } = render(<LocationStep {...defaultProps} />);
    expect(getByText(/Where are you based/)).toBeTruthy();
    expect(getByText(/Where do you serve/)).toBeTruthy();
  });

  it('renders Montreal as a based-in option', () => {
    const { getAllByText } = render(<LocationStep {...defaultProps} />);
    expect(getAllByText('Montreal').length).toBeGreaterThan(0);
  });

  it('renders Online as a serves area option', () => {
    const { getByText } = render(<LocationStep {...defaultProps} />);
    expect(getByText('Online')).toBeTruthy();
  });

  it('calls onBasedInChange with the selected city', () => {
    const onBasedInChange = jest.fn();
    const { getAllByText } = render(
      <LocationStep {...defaultProps} onBasedInChange={onBasedInChange} />,
    );
    // Laval appears in both "Based in" and "Serves areas" — press the first instance
    fireEvent.press(getAllByText('Laval')[0]);
    expect(onBasedInChange).toHaveBeenCalledWith('Laval');
  });

  it('calls onServesAreasChange with added area when an unselected chip is pressed', () => {
    const onServesAreasChange = jest.fn();
    const { getByText } = render(
      <LocationStep {...defaultProps} onServesAreasChange={onServesAreasChange} />,
    );
    fireEvent.press(getByText('Online'));
    expect(onServesAreasChange).toHaveBeenCalledWith(['Online']);
  });

  it('calls onServesAreasChange with removed area when a selected chip is pressed', () => {
    const onServesAreasChange = jest.fn();
    const { getByText } = render(
      <LocationStep
        {...defaultProps}
        servesAreas={['Online']}
        onServesAreasChange={onServesAreasChange}
      />,
    );
    fireEvent.press(getByText('Online'));
    expect(onServesAreasChange).toHaveBeenCalledWith([]);
  });

  it('shows basedIn error when provided', () => {
    const { getByText } = render(
      <LocationStep {...defaultProps} basedInError="Please select where you are based" />,
    );
    expect(getByText('Please select where you are based')).toBeTruthy();
  });

  it('does not show basedIn error when undefined', () => {
    const { queryByText } = render(<LocationStep {...defaultProps} />);
    expect(queryByText('Please select where you are based')).toBeNull();
  });
});
