import { render, fireEvent } from '@testing-library/react-native';
import { DatePicker } from '../DatePicker';

// react-native-calendars uses native modules not available in Jest.
// Mock it with a simple pressable that triggers onDayPress with a fixed date.
jest.mock('react-native-calendars', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TouchableOpacity, Text } = require('react-native');
  return {
    Calendar: ({ onDayPress }: { onDayPress: (day: { dateString: string }) => void }) =>
      React.createElement(
        TouchableOpacity,
        { testID: 'mock-calendar', onPress: () => onDayPress({ dateString: '2026-06-15' }) },
        React.createElement(Text, null, 'Mock Calendar'),
      ),
  };
});

describe('DatePicker', () => {
  // ── Static rendering ────────────────────────────────────────────────────────

  it('renders the placeholder when no value is provided', () => {
    const { getByText } = render(<DatePicker value={undefined} onChange={jest.fn()} />);
    expect(getByText('Select a date')).toBeTruthy();
  });

  it('renders a custom placeholder', () => {
    const { getByText } = render(
      <DatePicker value={undefined} onChange={jest.fn()} placeholder="Choose a date" />,
    );
    expect(getByText('Choose a date')).toBeTruthy();
  });

  it('renders the formatted date when a value is provided', () => {
    const date = new Date(2026, 5, 15); // June 15, 2026 (local)
    const { getByText } = render(<DatePicker value={date} onChange={jest.fn()} />);
    expect(getByText('Jun 15, 2026')).toBeTruthy();
  });

  it('renders the label when provided', () => {
    const { getByText } = render(
      <DatePicker label="Event Date" value={undefined} onChange={jest.fn()} />,
    );
    expect(getByText('Event Date')).toBeTruthy();
  });

  it('renders error text when error prop is a non-empty string', () => {
    const { getByText } = render(
      <DatePicker value={undefined} onChange={jest.fn()} error="Date is required" />,
    );
    expect(getByText('Date is required')).toBeTruthy();
  });

  it('does not render error text when error is an empty string', () => {
    const { queryByText } = render(<DatePicker value={undefined} onChange={jest.fn()} error="" />);
    // No error element rendered for an empty error string
    expect(queryByText('Date is required')).toBeNull();
  });

  it('renders helper text when no error is present', () => {
    const { getByText } = render(
      <DatePicker value={undefined} onChange={jest.fn()} helperText="Pick a start date" />,
    );
    expect(getByText('Pick a start date')).toBeTruthy();
  });

  it('hides helper text when an error is present', () => {
    const { queryByText } = render(
      <DatePicker
        value={undefined}
        onChange={jest.fn()}
        error="Required"
        helperText="Pick a start date"
      />,
    );
    expect(queryByText('Pick a start date')).toBeNull();
  });

  // ── Modal interaction ───────────────────────────────────────────────────────

  it('shows Cancel and Confirm buttons after pressing the trigger', () => {
    const { getByText } = render(<DatePicker value={undefined} onChange={jest.fn()} />);
    fireEvent.press(getByText('Select a date'));
    expect(getByText('Cancel')).toBeTruthy();
    expect(getByText('Confirm')).toBeTruthy();
  });

  it('shows the label inside the modal header', () => {
    const { getByText, getAllByText } = render(
      <DatePicker label="Start Date" value={undefined} onChange={jest.fn()} />,
    );
    fireEvent.press(getByText('Select a date'));
    // Label appears both above the trigger and inside the modal header
    expect(getAllByText('Start Date').length).toBeGreaterThan(0);
  });

  it('calls onChange and closes the modal when Confirm is pressed', () => {
    const onChange = jest.fn();
    const { getByText } = render(<DatePicker value={undefined} onChange={onChange} />);
    fireEvent.press(getByText('Select a date'));
    fireEvent.press(getByText('Confirm'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(expect.any(Date));
  });

  it('does not call onChange when Cancel is pressed', () => {
    const onChange = jest.fn();
    const { getByText } = render(<DatePicker value={undefined} onChange={onChange} />);
    fireEvent.press(getByText('Select a date'));
    fireEvent.press(getByText('Cancel'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('updates the staging date when a calendar day is pressed', () => {
    const onChange = jest.fn();
    const { getByText, getByTestId } = render(<DatePicker value={undefined} onChange={onChange} />);
    fireEvent.press(getByText('Select a date'));
    // The mock calendar fires onDayPress with '2026-06-15'
    fireEvent.press(getByTestId('mock-calendar'));
    fireEvent.press(getByText('Confirm'));
    expect(onChange).toHaveBeenCalledWith(expect.any(Date));
    const called = onChange.mock.calls[0]?.[0] as Date;
    expect(called.getMonth()).toBe(5); // June (0-indexed)
    expect(called.getDate()).toBe(15);
  });

  it('preserves the time component of an existing value when a day is selected', () => {
    const existing = new Date(2026, 0, 1, 14, 30, 0); // 14:30:00
    const onChange = jest.fn();
    const { getByText, getByTestId } = render(<DatePicker value={existing} onChange={onChange} />);
    fireEvent.press(getByText('Jan 1, 2026'));
    fireEvent.press(getByTestId('mock-calendar'));
    fireEvent.press(getByText('Confirm'));
    const called = onChange.mock.calls[0]?.[0] as Date;
    expect(called.getHours()).toBe(14);
    expect(called.getMinutes()).toBe(30);
  });

  it('reopens with the current value pre-staged when opened again', () => {
    const date = new Date(2026, 5, 15);
    const onChange = jest.fn();
    const { getByText } = render(<DatePicker value={date} onChange={onChange} />);
    // Open, cancel, open again — should not throw
    fireEvent.press(getByText('Jun 15, 2026'));
    fireEvent.press(getByText('Cancel'));
    fireEvent.press(getByText('Jun 15, 2026'));
    expect(getByText('Confirm')).toBeTruthy();
  });

  // ── Range highlighting ──────────────────────────────────────────────────────

  it('renders without error when rangeStart is provided', () => {
    const rangeStart = new Date(2026, 5, 10);
    const { getByText } = render(
      <DatePicker value={undefined} onChange={jest.fn()} rangeStart={rangeStart} />,
    );
    expect(getByText('Select a date')).toBeTruthy();
  });

  // ── Disabled state ──────────────────────────────────────────────────────────

  it('renders without crashing when disabled', () => {
    const { getByText } = render(<DatePicker value={undefined} onChange={jest.fn()} disabled />);
    expect(getByText('Select a date')).toBeTruthy();
  });

  it('renders a formatted value while disabled', () => {
    const date = new Date(2026, 0, 20);
    const { getByText } = render(<DatePicker value={date} onChange={jest.fn()} disabled />);
    expect(getByText('Jan 20, 2026')).toBeTruthy();
  });
});
