import { render, fireEvent } from '@testing-library/react-native';
import { TouchableOpacity } from 'react-native';
import { SaveButton } from '../SaveButton';
import { useSavedStore } from '@store/saved.store';
import { useRecommendationsStore } from '@store/recommendations.store';

beforeEach(() => {
  useSavedStore.setState({ savedIds: [] });
  useRecommendationsStore.setState({ typeScores: {}, signalCount: 0, openCounts: {} });
});

describe('SaveButton', () => {
  it('renders without crashing (heart iconType, not saved)', () => {
    const { toJSON } = render(
      <SaveButton announcementId="ann-1" announcementType="activity_event" iconType="heart" />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders without crashing (bookmark iconType, not saved)', () => {
    const { toJSON } = render(
      <SaveButton announcementId="ann-1" announcementType="activity_event" iconType="bookmark" />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('pressing when not saved: toggles savedIds and records signal with "save"', () => {
    const { UNSAFE_getByType } = render(
      <SaveButton announcementId="ann-1" announcementType="activity_event" iconType="bookmark" />,
    );
    fireEvent.press(UNSAFE_getByType(TouchableOpacity));

    expect(useSavedStore.getState().savedIds).toContain('ann-1');
    // recordSignal increments signalCount; 'save' weight = 3
    expect(useRecommendationsStore.getState().signalCount).toBe(1);
    expect(useRecommendationsStore.getState().typeScores['activity_event']).toBe(3);
  });

  it('pressing when not saved: calls recordSignal with "save"', () => {
    const recordSignal = jest.fn();
    useRecommendationsStore.setState({
      typeScores: {},
      signalCount: 0,
      openCounts: {},
      recordSignal,
    });

    const { UNSAFE_getByType } = render(
      <SaveButton announcementId="ann-2" announcementType="halaqa" iconType="heart" />,
    );
    fireEvent.press(UNSAFE_getByType(TouchableOpacity));
    expect(recordSignal).toHaveBeenCalledWith('halaqa', 'save');
  });

  it('pressing when already saved: does NOT call recordSignal', () => {
    useSavedStore.setState({ savedIds: ['ann-1'] });
    const recordSignal = jest.fn();
    useRecommendationsStore.setState({
      typeScores: {},
      signalCount: 0,
      openCounts: {},
      recordSignal,
    });

    const { UNSAFE_getByType } = render(
      <SaveButton announcementId="ann-1" announcementType="activity_event" iconType="bookmark" />,
    );
    fireEvent.press(UNSAFE_getByType(TouchableOpacity));
    expect(recordSignal).not.toHaveBeenCalled();
  });

  it('pressing when already saved: toggles savedIds (removes id)', () => {
    useSavedStore.setState({ savedIds: ['ann-1'] });

    const { UNSAFE_getByType } = render(
      <SaveButton announcementId="ann-1" announcementType="activity_event" iconType="bookmark" />,
    );
    fireEvent.press(UNSAFE_getByType(TouchableOpacity));
    expect(useSavedStore.getState().savedIds).not.toContain('ann-1');
  });

  it('after pressing twice, savedIds ends up empty (toggle twice)', () => {
    const { UNSAFE_getByType } = render(
      <SaveButton announcementId="ann-1" announcementType="activity_event" iconType="heart" />,
    );
    const btn = UNSAFE_getByType(TouchableOpacity);
    fireEvent.press(btn);
    expect(useSavedStore.getState().savedIds).toContain('ann-1');
    fireEvent.press(btn);
    expect(useSavedStore.getState().savedIds).not.toContain('ann-1');
  });

  it('iconType defaults to heart (renders without crash when iconType omitted)', () => {
    const { toJSON } = render(<SaveButton announcementId="ann-1" announcementType="update" />);
    expect(toJSON()).toBeTruthy();
  });
});
