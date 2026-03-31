import { render, fireEvent } from '@testing-library/react-native';
import { FollowButton } from '../FollowButton';

import { useFollow } from '@features/follows/hooks/useFollow';

const mockToggle = jest.fn();

jest.mock('@features/follows/hooks/useFollow', () => ({
  useFollow: jest.fn(),
}));

function setFollowState(state: { isFollowing: boolean; isToggling: boolean }) {
  (useFollow as jest.Mock).mockReturnValue({ ...state, toggle: mockToggle });
}

beforeEach(() => {
  mockToggle.mockClear();
  setFollowState({ isFollowing: false, isToggling: false });
});

describe('FollowButton — pill variant (default)', () => {
  it('renders "Follow" when not following', () => {
    const { getByText } = render(<FollowButton professionalId="pro-1" />);
    expect(getByText('Follow')).toBeTruthy();
  });

  it('renders "Following" when already following', () => {
    setFollowState({ isFollowing: true, isToggling: false });
    const { getByText } = render(<FollowButton professionalId="pro-1" />);
    expect(getByText('Following')).toBeTruthy();
  });

  it('calls toggle when pressed', () => {
    const { getByText } = render(<FollowButton professionalId="pro-1" />);
    fireEvent.press(getByText('Follow'));
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it('shows ActivityIndicator instead of label when toggling', () => {
    setFollowState({ isFollowing: false, isToggling: true });
    const { queryByText } = render(<FollowButton professionalId="pro-1" />);
    expect(queryByText('Follow')).toBeNull();
    expect(queryByText('Following')).toBeNull();
  });

  it('shows ActivityIndicator when toggling in following state', () => {
    setFollowState({ isFollowing: true, isToggling: true });
    const { queryByText } = render(<FollowButton professionalId="pro-1" />);
    expect(queryByText('Following')).toBeNull();
  });
});

describe('FollowButton — icon variant', () => {
  it('renders without crashing', () => {
    const { UNSAFE_root } = render(<FollowButton professionalId="pro-1" variant="icon" />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('shows ActivityIndicator when toggling in icon variant', () => {
    setFollowState({ isFollowing: false, isToggling: true });
    const { UNSAFE_root } = render(<FollowButton professionalId="pro-1" variant="icon" />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('calls stopPropagation and toggle when icon pressed', () => {
    const { UNSAFE_getAllByType } = render(<FollowButton professionalId="pro-1" variant="icon" />);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { TouchableOpacity } = require('react-native');
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    expect(buttons.length).toBeGreaterThan(0);
    const mockEvent = { stopPropagation: jest.fn() };
    buttons[0].props.onPress(mockEvent);
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(mockToggle).toHaveBeenCalled();
  });

  it('renders in following state without crashing', () => {
    setFollowState({ isFollowing: true, isToggling: false });
    const { UNSAFE_root } = render(<FollowButton professionalId="pro-1" variant="icon" />);
    expect(UNSAFE_root).toBeTruthy();
  });
});
