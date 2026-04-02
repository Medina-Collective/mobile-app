import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ServiceTypeSelector } from '../ServiceTypeSelector';

describe('ServiceTypeSelector', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<ServiceTypeSelector value={[]} onChange={jest.fn()} />);
    expect(toJSON()).not.toBeNull();
  });

  it('renders all 4 service type options', () => {
    const { getByText } = render(<ServiceTypeSelector value={[]} onChange={jest.fn()} />);
    expect(getByText('In person')).toBeTruthy();
    expect(getByText('Online')).toBeTruthy();
    expect(getByText('Hybrid')).toBeTruthy();
    expect(getByText('Travels to client')).toBeTruthy();
  });

  it('calls onChange with added value when an unselected chip is pressed', () => {
    const onChange = jest.fn();
    const { getByText } = render(<ServiceTypeSelector value={[]} onChange={onChange} />);
    fireEvent.press(getByText('Online'));
    expect(onChange).toHaveBeenCalledWith(['online']);
  });

  it('calls onChange with removed value when a selected chip is pressed', () => {
    const onChange = jest.fn();
    const { getByText } = render(<ServiceTypeSelector value={['online']} onChange={onChange} />);
    fireEvent.press(getByText('Online'));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('preserves existing selections when adding a new one', () => {
    const onChange = jest.fn();
    const { getByText } = render(<ServiceTypeSelector value={['in_person']} onChange={onChange} />);
    fireEvent.press(getByText('Online'));
    expect(onChange).toHaveBeenCalledWith(['in_person', 'online']);
  });
});
