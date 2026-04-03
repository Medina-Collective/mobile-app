import { render, fireEvent } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { TimePicker } from '../TimePicker';

// @react-native-community/datetimepicker is a native module — mock it.
jest.mock('@react-native-community/datetimepicker', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  function MockDateTimePicker() {
    return React.createElement(View, { testID: 'mock-datetimepicker' });
  }
  return MockDateTimePicker;
});

// Platform.OS is 'ios' by default in jest-expo; use Object.defineProperty for android.
afterEach(() => {
  Object.defineProperty(Platform, 'OS', { value: 'ios', writable: true, configurable: true });
});

describe('TimePicker', () => {
  // ── Static rendering ────────────────────────────────────────────────────────

  it('renders the placeholder when no value is provided', () => {
    const { getByText } = render(<TimePicker value={undefined} onChange={jest.fn()} />);
    expect(getByText('Select a time')).toBeTruthy();
  });

  it('renders a custom placeholder', () => {
    const { getByText } = render(
      <TimePicker value={undefined} onChange={jest.fn()} placeholder="Choose a time" />,
    );
    expect(getByText('Choose a time')).toBeTruthy();
  });

  it('renders the formatted time when a value is provided', () => {
    const time = new Date(2026, 0, 1, 14, 30, 0); // 2:30 PM
    const { getByText } = render(<TimePicker value={time} onChange={jest.fn()} />);
    expect(getByText('2:30 PM')).toBeTruthy();
  });

  it('renders the label when provided', () => {
    const { getByText } = render(
      <TimePicker label="Event Time" value={undefined} onChange={jest.fn()} />,
    );
    expect(getByText('Event Time')).toBeTruthy();
  });

  it('renders error text when error prop is a non-empty string', () => {
    const { getByText } = render(
      <TimePicker value={undefined} onChange={jest.fn()} error="Time is required" />,
    );
    expect(getByText('Time is required')).toBeTruthy();
  });

  it('does not render error text when error is empty string', () => {
    const { queryByText } = render(<TimePicker value={undefined} onChange={jest.fn()} error="" />);
    expect(queryByText('Time is required')).toBeNull();
  });

  it('renders helper text when no error is present', () => {
    const { getByText } = render(
      <TimePicker value={undefined} onChange={jest.fn()} helperText="When does it start?" />,
    );
    expect(getByText('When does it start?')).toBeTruthy();
  });

  it('hides helper text when error is present', () => {
    const { queryByText } = render(
      <TimePicker
        value={undefined}
        onChange={jest.fn()}
        error="Required"
        helperText="When does it start?"
      />,
    );
    expect(queryByText('When does it start?')).toBeNull();
  });

  // ── iOS modal interaction (Platform.OS === 'ios' by default in jest-expo) ───

  it('shows Cancel and Confirm buttons after pressing the trigger on iOS', () => {
    const { getByText } = render(<TimePicker value={undefined} onChange={jest.fn()} />);
    fireEvent.press(getByText('Select a time'));
    expect(getByText('Cancel')).toBeTruthy();
    expect(getByText('Confirm')).toBeTruthy();
  });

  it('does not call onChange when Cancel is pressed on iOS', () => {
    const onChange = jest.fn();
    const { getByText } = render(<TimePicker value={undefined} onChange={onChange} />);
    fireEvent.press(getByText('Select a time'));
    fireEvent.press(getByText('Cancel'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('calls onChange when Confirm is pressed on iOS', () => {
    const onChange = jest.fn();
    const { getByText } = render(<TimePicker value={undefined} onChange={onChange} />);
    fireEvent.press(getByText('Select a time'));
    fireEvent.press(getByText('Confirm'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(expect.any(Date));
  });

  it('shows label in iOS modal header', () => {
    const { getByText, getAllByText } = render(
      <TimePicker label="Start Time" value={undefined} onChange={jest.fn()} />,
    );
    fireEvent.press(getByText('Select a time'));
    expect(getAllByText('Start Time').length).toBeGreaterThan(0);
  });

  it('reopens after cancel without throwing on iOS', () => {
    const { getByText } = render(<TimePicker value={undefined} onChange={jest.fn()} />);
    fireEvent.press(getByText('Select a time'));
    fireEvent.press(getByText('Cancel'));
    fireEvent.press(getByText('Select a time'));
    expect(getByText('Confirm')).toBeTruthy();
  });

  it('resets stagingDate to current value when reopened on iOS', () => {
    const time = new Date(2026, 0, 1, 9, 0, 0);
    const onChange = jest.fn();
    const { getByText } = render(<TimePicker value={time} onChange={onChange} />);
    fireEvent.press(getByText('9:00 AM'));
    fireEvent.press(getByText('Confirm'));
    expect(onChange).toHaveBeenCalledWith(time);
  });

  // ── Android behavior ────────────────────────────────────────────────────────

  it('renders without crashing on Android', () => {
    Object.defineProperty(Platform, 'OS', { value: 'android', writable: true, configurable: true });
    const { getByText } = render(<TimePicker value={undefined} onChange={jest.fn()} />);
    expect(getByText('Select a time')).toBeTruthy();
  });

  it('shows inline picker when trigger is pressed on Android', () => {
    Object.defineProperty(Platform, 'OS', { value: 'android', writable: true, configurable: true });
    const { getByText, getByTestId } = render(
      <TimePicker value={undefined} onChange={jest.fn()} />,
    );
    fireEvent.press(getByText('Select a time'));
    expect(getByTestId('mock-datetimepicker')).toBeTruthy();
  });
});
