import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SubcategorySelector } from '../SubcategorySelector';

describe('SubcategorySelector', () => {
  it('returns null when category has no subcategories', () => {
    const { toJSON } = render(
      <SubcategorySelector category="Clothing" value={[]} onChange={jest.fn()} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('returns null for an unknown category', () => {
    const { toJSON } = render(
      <SubcategorySelector category="Unknown" value={[]} onChange={jest.fn()} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('renders subcategory chips for Beauty', () => {
    const { getByText } = render(
      <SubcategorySelector category="Beauty" value={[]} onChange={jest.fn()} />,
    );
    expect(getByText('Henna')).toBeTruthy();
    expect(getByText('Makeup')).toBeTruthy();
  });

  it('calls onChange with added item when an unselected chip is pressed', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <SubcategorySelector category="Beauty" value={[]} onChange={onChange} />,
    );
    fireEvent.press(getByText('Henna'));
    expect(onChange).toHaveBeenCalledWith(['Henna']);
  });

  it('calls onChange with removed item when a selected chip is pressed', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <SubcategorySelector category="Beauty" value={['Henna']} onChange={onChange} />,
    );
    fireEvent.press(getByText('Henna'));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('renders Fitness subcategories correctly', () => {
    const { getByText } = render(
      <SubcategorySelector category="Fitness" value={[]} onChange={jest.fn()} />,
    );
    expect(getByText('Hijama')).toBeTruthy();
  });
});
