import { render, fireEvent } from '@testing-library/react-native';
import { AnnouncementTypeSelector } from '../AnnouncementTypeSelector';
import { ANNOUNCEMENT_FORM_TYPES } from '@features/announcements/schemas/announcement.schema';
import type { AnnouncementFormType } from '@features/announcements/schemas/announcement.schema';

describe('AnnouncementTypeSelector', () => {
  it('renders all announcement form type labels', () => {
    const { getByText } = render(
      <AnnouncementTypeSelector value={undefined} onChange={jest.fn()} />,
    );
    for (const option of ANNOUNCEMENT_FORM_TYPES) {
      expect(getByText(option.label)).toBeTruthy();
    }
  });

  it('calls onChange with the correct value when a type card is pressed', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <AnnouncementTypeSelector value={undefined} onChange={onChange} />,
    );
    fireEvent.press(getByText('Event / Activity'));
    expect(onChange).toHaveBeenCalledWith('event');
  });

  it('calls onChange with the correct value for each option', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <AnnouncementTypeSelector value={undefined} onChange={onChange} />,
    );

    fireEvent.press(getByText('Offer / Promotion'));
    expect(onChange).toHaveBeenLastCalledWith('offer');

    fireEvent.press(getByText('Community Update'));
    expect(onChange).toHaveBeenLastCalledWith('update');
  });

  it('shows error text when error prop is provided', () => {
    const { getByText } = render(
      <AnnouncementTypeSelector
        value={undefined}
        onChange={jest.fn()}
        error="Please select a type"
      />,
    );
    expect(getByText('Please select a type')).toBeTruthy();
  });

  it('does NOT show error text when error is an empty string', () => {
    const { queryByText } = render(
      <AnnouncementTypeSelector value={undefined} onChange={jest.fn()} error="" />,
    );
    expect(queryByText('')).toBeNull();
  });

  it('does NOT show error text when error is undefined', () => {
    const { queryByText } = render(
      <AnnouncementTypeSelector value={undefined} onChange={jest.fn()} />,
    );
    expect(queryByText('Please select a type')).toBeNull();
  });

  it('the selected card calls onChange with the matching value', () => {
    const onChange = jest.fn();
    const selectedType: AnnouncementFormType = 'event';
    const { getByText } = render(
      <AnnouncementTypeSelector value={selectedType} onChange={onChange} />,
    );
    fireEvent.press(getByText('Event / Activity'));
    expect(onChange).toHaveBeenCalledWith('event');
  });

  it('renders option descriptions', () => {
    const { getByText } = render(
      <AnnouncementTypeSelector value={undefined} onChange={jest.fn()} />,
    );
    expect(getByText('Gatherings, classes, workshops')).toBeTruthy();
    expect(getByText('Sales, deals, launches')).toBeTruthy();
  });
});
