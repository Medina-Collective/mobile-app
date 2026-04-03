import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { LocationAutocomplete } from '../LocationAutocomplete';

// EXPO_PUBLIC_GOOGLE_PLACES_API_KEY is set to 'test-api-key' in jest.setup.ts
// so the module does not short-circuit its fetch path.

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

function makePlacesResponse(descriptions: string[]) {
  return {
    ok: true,
    json: () =>
      Promise.resolve({
        suggestions: descriptions.map((d, i) => ({
          placePrediction: { placeId: `place-${i}`, text: { text: d } },
        })),
      }),
  };
}

describe('LocationAutocomplete', () => {
  // ── Static rendering ────────────────────────────────────────────────────────

  it('renders the label', () => {
    const { getByText } = render(
      <LocationAutocomplete label="Location" value={undefined} onChange={jest.fn()} />,
    );
    expect(getByText('Location')).toBeTruthy();
  });

  it('renders the placeholder when no value', () => {
    const { getByPlaceholderText } = render(
      <LocationAutocomplete label="Location" value={undefined} onChange={jest.fn()} />,
    );
    expect(getByPlaceholderText('Search for a place…')).toBeTruthy();
  });

  it('renders a custom placeholder', () => {
    const { getByPlaceholderText } = render(
      <LocationAutocomplete
        label="Location"
        value={undefined}
        onChange={jest.fn()}
        placeholder="Type an address"
      />,
    );
    expect(getByPlaceholderText('Type an address')).toBeTruthy();
  });

  it('renders initial value in the text input', () => {
    const { getByDisplayValue } = render(
      <LocationAutocomplete label="Location" value="Montreal, QC" onChange={jest.fn()} />,
    );
    expect(getByDisplayValue('Montreal, QC')).toBeTruthy();
  });

  it('renders error text when error prop is a non-empty string', () => {
    const { getByText } = render(
      <LocationAutocomplete
        label="Location"
        value={undefined}
        onChange={jest.fn()}
        error="Location is required"
      />,
    );
    expect(getByText('Location is required')).toBeTruthy();
  });

  it('does not render error text when error is empty string', () => {
    const { queryByText } = render(
      <LocationAutocomplete label="Location" value={undefined} onChange={jest.fn()} error="" />,
    );
    expect(queryByText('Location is required')).toBeNull();
  });

  it('renders helper text when no error is present', () => {
    const { getByText } = render(
      <LocationAutocomplete
        label="Location"
        value={undefined}
        onChange={jest.fn()}
        helperText="Enter the event venue"
      />,
    );
    expect(getByText('Enter the event venue')).toBeTruthy();
  });

  it('hides helper text when an error is present', () => {
    const { queryByText } = render(
      <LocationAutocomplete
        label="Location"
        value={undefined}
        onChange={jest.fn()}
        error="Required"
        helperText="Enter the event venue"
      />,
    );
    expect(queryByText('Enter the event venue')).toBeNull();
  });

  // ── Text input interaction ──────────────────────────────────────────────────

  it('calls onChange with empty string when input is cleared', () => {
    const onChange = jest.fn();
    const { getByDisplayValue } = render(
      <LocationAutocomplete label="Location" value="Montreal" onChange={onChange} />,
    );
    fireEvent.changeText(getByDisplayValue('Montreal'), '');
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('does not trigger fetch when input is fewer than 2 chars', () => {
    mockFetch.mockResolvedValue(makePlacesResponse(['Result A']));
    const { getByPlaceholderText } = render(
      <LocationAutocomplete label="Location" value={undefined} onChange={jest.fn()} />,
    );
    fireEvent.changeText(getByPlaceholderText('Search for a place…'), 'M');
    act(() => jest.runAllTimers());
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('triggers a debounced fetch after typing 2+ chars', async () => {
    mockFetch.mockResolvedValue(makePlacesResponse(['Montreal, QC', 'Montréal-Nord']));
    const { getByPlaceholderText } = render(
      <LocationAutocomplete label="Location" value={undefined} onChange={jest.fn()} />,
    );
    fireEvent.changeText(getByPlaceholderText('Search for a place…'), 'Mo');
    await act(async () => {
      jest.runAllTimers();
      await Promise.resolve();
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('displays prediction results after a successful fetch', async () => {
    mockFetch.mockResolvedValue(makePlacesResponse(['Montreal, QC', 'Montréal-Nord']));
    const { getByPlaceholderText, findByText } = render(
      <LocationAutocomplete label="Location" value={undefined} onChange={jest.fn()} />,
    );
    fireEvent.changeText(getByPlaceholderText('Search for a place…'), 'Mon');
    await act(async () => {
      jest.runAllTimers();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(await findByText('Montreal, QC')).toBeTruthy();
    expect(await findByText('Montréal-Nord')).toBeTruthy();
  });

  it('calls onChange and hides list when a prediction is selected', async () => {
    mockFetch.mockResolvedValue(makePlacesResponse(['Montreal, QC']));
    const onChange = jest.fn();
    const { getByPlaceholderText, findByText, queryByText } = render(
      <LocationAutocomplete label="Location" value={undefined} onChange={onChange} />,
    );
    fireEvent.changeText(getByPlaceholderText('Search for a place…'), 'Mon');
    await act(async () => {
      jest.runAllTimers();
      await Promise.resolve();
      await Promise.resolve();
    });
    fireEvent.press(await findByText('Montreal, QC'));
    expect(onChange).toHaveBeenCalledWith('Montreal, QC');
    expect(queryByText('Montreal, QC')).toBeNull();
  });

  it('handles API error response gracefully (no crash, no predictions)', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () =>
        Promise.resolve({ error: { status: 'INVALID_ARGUMENT', message: 'Bad request' } }),
    });
    const { getByPlaceholderText } = render(
      <LocationAutocomplete label="Location" value={undefined} onChange={jest.fn()} />,
    );
    fireEvent.changeText(getByPlaceholderText('Search for a place…'), 'Mon');
    await act(async () => {
      jest.runAllTimers();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(getByPlaceholderText('Search for a place…')).toBeTruthy();
  });

  it('handles fetch network error gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    const { getByPlaceholderText } = render(
      <LocationAutocomplete label="Location" value={undefined} onChange={jest.fn()} />,
    );
    fireEvent.changeText(getByPlaceholderText('Search for a place…'), 'Mon');
    await act(async () => {
      jest.runAllTimers();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(getByPlaceholderText('Search for a place…')).toBeTruthy();
  });

  it('hides prediction list when input is cleared after results appear', async () => {
    mockFetch.mockResolvedValue(makePlacesResponse(['Montreal, QC']));
    const { getByPlaceholderText, findByText, queryByText } = render(
      <LocationAutocomplete label="Location" value={undefined} onChange={jest.fn()} />,
    );
    fireEvent.changeText(getByPlaceholderText('Search for a place…'), 'Mon');
    await act(async () => {
      jest.runAllTimers();
      await Promise.resolve();
      await Promise.resolve();
    });
    await findByText('Montreal, QC');
    fireEvent.changeText(getByPlaceholderText('Search for a place…'), '');
    expect(queryByText('Montreal, QC')).toBeNull();
  });

  it('hides list on submit editing', async () => {
    mockFetch.mockResolvedValue(makePlacesResponse(['Montreal, QC']));
    const { getByPlaceholderText, findByText, queryByText } = render(
      <LocationAutocomplete label="Location" value={undefined} onChange={jest.fn()} />,
    );
    fireEvent.changeText(getByPlaceholderText('Search for a place…'), 'Mon');
    await act(async () => {
      jest.runAllTimers();
      await Promise.resolve();
      await Promise.resolve();
    });
    await findByText('Montreal, QC');
    fireEvent(getByPlaceholderText('Search for a place…'), 'submitEditing');
    expect(queryByText('Montreal, QC')).toBeNull();
  });

  // ── External value sync ─────────────────────────────────────────────────────

  it('syncs input text when external value changes via re-render', () => {
    const onChange = jest.fn();
    const { getByDisplayValue, rerender } = render(
      <LocationAutocomplete label="Location" value="Montreal" onChange={onChange} />,
    );
    expect(getByDisplayValue('Montreal')).toBeTruthy();
    rerender(<LocationAutocomplete label="Location" value="Toronto" onChange={onChange} />);
    expect(getByDisplayValue('Toronto')).toBeTruthy();
  });

  it('clears input when external value becomes undefined on re-render', () => {
    const onChange = jest.fn();
    const { rerender, getByDisplayValue } = render(
      <LocationAutocomplete label="Location" value="Montreal" onChange={onChange} />,
    );
    rerender(<LocationAutocomplete label="Location" value={undefined} onChange={onChange} />);
    expect(getByDisplayValue('')).toBeTruthy();
  });

  // ── Debounce cancellation ───────────────────────────────────────────────────

  it('cancels previous debounce when a new character is typed rapidly', async () => {
    mockFetch.mockResolvedValue(makePlacesResponse(['Result']));
    const { getByPlaceholderText } = render(
      <LocationAutocomplete label="Location" value={undefined} onChange={jest.fn()} />,
    );
    fireEvent.changeText(getByPlaceholderText('Search for a place…'), 'Mo');
    fireEvent.changeText(getByPlaceholderText('Search for a place…'), 'Mon');
    await act(async () => {
      jest.runAllTimers();
      await Promise.resolve();
      await Promise.resolve();
    });
    // Only the last debounced call fires
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('updates input text as user types', () => {
    const { getByPlaceholderText, getByDisplayValue } = render(
      <LocationAutocomplete label="Location" value={undefined} onChange={jest.fn()} />,
    );
    fireEvent.changeText(getByPlaceholderText('Search for a place…'), 'Mont');
    expect(getByDisplayValue('Mont')).toBeTruthy();
  });

  // ── Predictions list with multiple items ────────────────────────────────────

  it('renders up to 6 predictions', async () => {
    const descriptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    mockFetch.mockResolvedValue(makePlacesResponse(descriptions));
    const { getByPlaceholderText, queryByText, findByText } = render(
      <LocationAutocomplete label="Location" value={undefined} onChange={jest.fn()} />,
    );
    fireEvent.changeText(getByPlaceholderText('Search for a place…'), 'Mon');
    await act(async () => {
      jest.runAllTimers();
      await Promise.resolve();
      await Promise.resolve();
    });
    await findByText('A');
    // 7th item should not be rendered (sliced to 6)
    expect(queryByText('G')).toBeNull();
  });
});
