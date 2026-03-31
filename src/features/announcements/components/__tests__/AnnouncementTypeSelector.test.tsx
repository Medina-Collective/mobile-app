import { render, fireEvent } from '@testing-library/react-native';
import { AnnouncementTypeSelector } from '../AnnouncementTypeSelector';
import { ANNOUNCEMENT_TYPE_OPTIONS } from '@features/announcements/schemas/announcement.schema';
import type { AnnouncementType } from '@app-types/announcement';

describe('AnnouncementTypeSelector', () => {
  it('renders all announcement type option labels', () => {
    const { getByText } = render(
      <AnnouncementTypeSelector value={undefined} onChange={jest.fn()} />,
    );
    for (const option of ANNOUNCEMENT_TYPE_OPTIONS) {
      expect(getByText(option.label)).toBeTruthy();
    }
  });

  it('calls onChange with the correct value when a type card is pressed', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <AnnouncementTypeSelector value={undefined} onChange={onChange} />,
    );
    fireEvent.press(getByText('Activity Event'));
    expect(onChange).toHaveBeenCalledWith('activity_event');
  });

  it('calls onChange with the correct value for each option', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <AnnouncementTypeSelector value={undefined} onChange={onChange} />,
    );

    fireEvent.press(getByText('Bazaar'));
    expect(onChange).toHaveBeenLastCalledWith('bazaar');

    fireEvent.press(getByText('Update'));
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
    // Empty string should not render any error node
    // We check there's no text with "error" related content shown
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
    const selectedType: AnnouncementType = 'halaqa';
    const { getByText } = render(
      <AnnouncementTypeSelector value={selectedType} onChange={onChange} />,
    );
    // Pressing the already-selected card still fires onChange
    fireEvent.press(getByText('Halaqa'));
    expect(onChange).toHaveBeenCalledWith('halaqa');
  });

  it('renders option descriptions', () => {
    const { getByText } = render(
      <AnnouncementTypeSelector value={undefined} onChange={jest.fn()} />,
    );
    expect(getByText('A gathering or activity for the community')).toBeTruthy();
    expect(getByText('A special promotion or sale')).toBeTruthy();
  });
});
