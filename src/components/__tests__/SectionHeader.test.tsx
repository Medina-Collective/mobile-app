import { render, fireEvent } from '@testing-library/react-native';
import { SectionHeader } from '../SectionHeader';

describe('SectionHeader', () => {
  it('renders the title', () => {
    const { getByText } = render(<SectionHeader title="Community Events" />);
    expect(getByText('Community Events')).toBeTruthy();
  });

  it('renders subtitle when provided', () => {
    const { getByText } = render(
      <SectionHeader title="Community Events" subtitle="This week's picks" />,
    );
    expect(getByText("This week's picks")).toBeTruthy();
  });

  it('does not render subtitle when not provided', () => {
    const { queryByText } = render(<SectionHeader title="Community Events" />);
    expect(queryByText("This week's picks")).toBeNull();
  });

  it('renders "See all" button when onSeeAll is provided', () => {
    const { getByText } = render(<SectionHeader title="Community Events" onSeeAll={jest.fn()} />);
    expect(getByText('See all')).toBeTruthy();
  });

  it('does not render "See all" when onSeeAll is not provided', () => {
    const { queryByText } = render(<SectionHeader title="Community Events" />);
    expect(queryByText('See all')).toBeNull();
  });

  it('calls onSeeAll when "See all" is pressed', () => {
    const onSeeAll = jest.fn();
    const { getByText } = render(<SectionHeader title="Community Events" onSeeAll={onSeeAll} />);
    fireEvent.press(getByText('See all'));
    expect(onSeeAll).toHaveBeenCalledTimes(1);
  });
});
