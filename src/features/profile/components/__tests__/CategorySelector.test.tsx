import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CategorySelector } from '../CategorySelector';

describe('CategorySelector', () => {
  it('shows placeholder when profileType is undefined', () => {
    const { getByText } = render(
      <CategorySelector profileType={undefined} value="" onChange={jest.fn()} />,
    );
    expect(getByText(/Go back and select a profile type first/)).toBeTruthy();
  });

  it('renders categories for the freelancer_service profile type', () => {
    const { getByText } = render(
      <CategorySelector profileType="freelancer_service" value="" onChange={jest.fn()} />,
    );
    expect(getByText('Beauty')).toBeTruthy();
    expect(getByText('Fitness')).toBeTruthy();
  });

  it('renders categories for the business_brand profile type', () => {
    const { getByText } = render(
      <CategorySelector profileType="business_brand" value="" onChange={jest.fn()} />,
    );
    expect(getByText('Clothing')).toBeTruthy();
    expect(getByText('Food & Sweets')).toBeTruthy();
  });

  it('calls onChange with the selected category when pressed', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <CategorySelector profileType="freelancer_service" value="" onChange={onChange} />,
    );
    fireEvent.press(getByText('Beauty'));
    expect(onChange).toHaveBeenCalledWith('Beauty');
  });

  it('renders an error message when error prop is provided', () => {
    const { getByText } = render(
      <CategorySelector
        profileType="freelancer_service"
        value=""
        onChange={jest.fn()}
        error="Please select a category"
      />,
    );
    expect(getByText('Please select a category')).toBeTruthy();
  });

  it('does not render error text when error is undefined', () => {
    const { queryByText } = render(
      <CategorySelector profileType="freelancer_service" value="" onChange={jest.fn()} />,
    );
    expect(queryByText('Please select a category')).toBeNull();
  });
});
