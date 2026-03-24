import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ProfilePreviewCard } from '../ProfilePreviewCard';
import type { ProfessionalProfileFormData } from '../../schemas/professional-profile.schema';

const baseData: ProfessionalProfileFormData = {
  businessName: 'Henna by Fatima',
  profileType: 'service',
  category: 'Beauty',
  subcategories: ['Henna', 'Makeup'],
  serviceTypes: ['at_home', 'travels_to_client'],
  basedIn: 'Montreal',
  servesAreas: ['Laval'],
  description: 'Specialised henna artist serving the Montreal community.',
  inquiryEmail: 'hello@henna.com',
  instagram: 'hennabyfattima',
  phone: '+1 514 000 0000',
  website: 'https://henna.com',
  bookingLink: 'https://calendly.com/henna',
  priceRange: '$$',
  startingPrice: '$50',
};

describe('ProfilePreviewCard', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<ProfilePreviewCard data={baseData} onEditStep={jest.fn()} />);
    expect(toJSON()).not.toBeNull();
  });

  it('displays the business name', () => {
    const { getByText } = render(<ProfilePreviewCard data={baseData} onEditStep={jest.fn()} />);
    expect(getByText('Henna by Fatima')).toBeTruthy();
  });

  it('displays the profile type label', () => {
    const { getAllByText } = render(<ProfilePreviewCard data={baseData} onEditStep={jest.fn()} />);
    expect(getAllByText('Service').length).toBeGreaterThan(0);
  });

  it('displays the category', () => {
    const { getByText } = render(<ProfilePreviewCard data={baseData} onEditStep={jest.fn()} />);
    expect(getByText('Beauty')).toBeTruthy();
  });

  it('displays subcategories', () => {
    const { getByText } = render(<ProfilePreviewCard data={baseData} onEditStep={jest.fn()} />);
    expect(getByText('Henna')).toBeTruthy();
    expect(getByText('Makeup')).toBeTruthy();
  });

  it('displays service type labels', () => {
    const { getByText } = render(<ProfilePreviewCard data={baseData} onEditStep={jest.fn()} />);
    expect(getByText('At home')).toBeTruthy();
    expect(getByText('Travels to client')).toBeTruthy();
  });

  it('displays basedIn location', () => {
    const { getByText } = render(<ProfilePreviewCard data={baseData} onEditStep={jest.fn()} />);
    expect(getByText(/Based in Montreal/)).toBeTruthy();
  });

  it('displays the description', () => {
    const { getByText } = render(<ProfilePreviewCard data={baseData} onEditStep={jest.fn()} />);
    expect(getByText(/Specialised henna artist/)).toBeTruthy();
  });

  it('displays the price range and starting price', () => {
    const { getByText } = render(<ProfilePreviewCard data={baseData} onEditStep={jest.fn()} />);
    expect(getByText(/\$\$.*Starting at \$50/)).toBeTruthy();
  });

  it('displays the inquiry email', () => {
    const { getByText } = render(<ProfilePreviewCard data={baseData} onEditStep={jest.fn()} />);
    expect(getByText('hello@henna.com')).toBeTruthy();
  });

  it('calls onEditStep with step 1 when Category Edit is pressed', () => {
    const onEditStep = jest.fn();
    const { getAllByText } = render(<ProfilePreviewCard data={baseData} onEditStep={onEditStep} />);
    const editButtons = getAllByText('Edit');
    // Category section is the second Edit button (after Profile Type)
    fireEvent.press(editButtons[1]);
    expect(onEditStep).toHaveBeenCalledWith(1);
  });

  it('shows empty state when category is not set', () => {
    const { getByText } = render(
      <ProfilePreviewCard
        data={{ ...baseData, category: '', subcategories: [] }}
        onEditStep={jest.fn()}
      />,
    );
    expect(getByText('No category selected')).toBeTruthy();
  });

  it('shows empty state when basedIn is not set', () => {
    const { getByText } = render(
      <ProfilePreviewCard data={{ ...baseData, basedIn: '' }} onEditStep={jest.fn()} />,
    );
    expect(getByText('No location selected')).toBeTruthy();
  });

  it('does not show service type section when serviceTypes is empty', () => {
    const { queryByText } = render(
      <ProfilePreviewCard data={{ ...baseData, serviceTypes: [] }} onEditStep={jest.fn()} />,
    );
    expect(queryByText('Service Type')).toBeNull();
  });
});
