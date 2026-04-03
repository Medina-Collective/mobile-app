import { render, fireEvent } from '@testing-library/react-native';
import { TouchableOpacity, Linking } from 'react-native';
import { LinkButton, normalizeUrl } from '../LinkButton';

describe('normalizeUrl', () => {
  it('leaves https:// URLs untouched', () => {
    expect(normalizeUrl('https://example.com')).toBe('https://example.com');
  });

  it('leaves http:// URLs untouched', () => {
    expect(normalizeUrl('http://example.com')).toBe('http://example.com');
  });

  it('prepends https:// to bare URLs', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com');
  });

  it('prepends https:// to URLs starting with www', () => {
    expect(normalizeUrl('www.example.com/path')).toBe('https://www.example.com/path');
  });
});

describe('LinkButton', () => {
  let openURLSpy: jest.SpyInstance;

  beforeEach(() => {
    openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  });

  afterEach(() => {
    openURLSpy.mockRestore();
  });

  it('renders without crashing', () => {
    const { toJSON } = render(<LinkButton url="https://example.com" />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with custom size', () => {
    const { toJSON } = render(<LinkButton url="https://example.com" size={56} />);
    expect(toJSON()).toBeTruthy();
  });

  it('calls Linking.openURL with the url on press', () => {
    const { UNSAFE_getByType } = render(<LinkButton url="https://example.com" />);
    fireEvent.press(UNSAFE_getByType(TouchableOpacity));
    expect(openURLSpy).toHaveBeenCalledWith('https://example.com');
  });

  it('normalizes bare url before calling Linking.openURL', () => {
    const { UNSAFE_getByType } = render(<LinkButton url="example.com" />);
    fireEvent.press(UNSAFE_getByType(TouchableOpacity));
    expect(openURLSpy).toHaveBeenCalledWith('https://example.com');
  });
});
