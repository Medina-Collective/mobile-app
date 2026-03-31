import { render, fireEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ParticipationButton } from '../ParticipationButton';
import { useRecommendationsStore } from '@store/recommendations.store';

import { useParticipation } from '@features/announcements/hooks/useParticipation';

jest.mock('@features/announcements/hooks/useParticipation', () => ({
  useParticipation: jest.fn(),
}));

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

const defaultMock = {
  isParticipating: false,
  toggle: jest.fn(),
  isToggling: false,
};

beforeEach(() => {
  useRecommendationsStore.setState({ typeScores: {}, signalCount: 0, openCounts: {} });
  (useParticipation as jest.Mock).mockReturnValue({ ...defaultMock, toggle: jest.fn() });
});

describe('ParticipationButton', () => {
  it('shows "Participate" when not participating and not full', () => {
    (useParticipation as jest.Mock).mockReturnValue({
      isParticipating: false,
      toggle: jest.fn(),
      isToggling: false,
    });
    const { getByText } = renderWithQuery(
      <ParticipationButton
        announcementId="ann-1"
        announcementType="activity_event"
        participantCount={0}
      />,
    );
    expect(getByText('Participate')).toBeTruthy();
  });

  it('shows "Going" when isParticipating=true', () => {
    (useParticipation as jest.Mock).mockReturnValue({
      isParticipating: true,
      toggle: jest.fn(),
      isToggling: false,
    });
    const { getByText } = renderWithQuery(
      <ParticipationButton
        announcementId="ann-1"
        announcementType="activity_event"
        participantCount={5}
      />,
    );
    expect(getByText('Going')).toBeTruthy();
  });

  it('shows "Full" when maxCapacity is set and participantCount >= maxCapacity and not participating', () => {
    (useParticipation as jest.Mock).mockReturnValue({
      isParticipating: false,
      toggle: jest.fn(),
      isToggling: false,
    });
    const { getByText } = renderWithQuery(
      <ParticipationButton
        announcementId="ann-1"
        announcementType="activity_event"
        participantCount={10}
        maxCapacity={10}
      />,
    );
    expect(getByText('Full')).toBeTruthy();
  });

  it('shows ActivityIndicator when isToggling=true', () => {
    (useParticipation as jest.Mock).mockReturnValue({
      isParticipating: false,
      toggle: jest.fn(),
      isToggling: true,
    });
    const { queryByText } = renderWithQuery(
      <ParticipationButton
        announcementId="ann-1"
        announcementType="activity_event"
        participantCount={0}
      />,
    );
    // When toggling, Participate/Going text is NOT shown
    expect(queryByText('Participate')).toBeNull();
    expect(queryByText('Going')).toBeNull();
  });

  it('shows participant count text', () => {
    (useParticipation as jest.Mock).mockReturnValue({
      isParticipating: false,
      toggle: jest.fn(),
      isToggling: false,
    });
    const { getByText } = renderWithQuery(
      <ParticipationButton
        announcementId="ann-1"
        announcementType="activity_event"
        participantCount={7}
      />,
    );
    expect(getByText('7 going')).toBeTruthy();
  });

  it('shows spots left when maxCapacity is provided', () => {
    (useParticipation as jest.Mock).mockReturnValue({
      isParticipating: false,
      toggle: jest.fn(),
      isToggling: false,
    });
    const { getByText } = renderWithQuery(
      <ParticipationButton
        announcementId="ann-1"
        announcementType="activity_event"
        participantCount={3}
        maxCapacity={10}
      />,
    );
    expect(getByText('3 going · 7 spots left')).toBeTruthy();
  });

  it('pressing when not participating: calls toggle and recordSignal', () => {
    const toggle = jest.fn();
    (useParticipation as jest.Mock).mockReturnValue({
      isParticipating: false,
      toggle,
      isToggling: false,
    });
    const { getByText } = renderWithQuery(
      <ParticipationButton
        announcementId="ann-1"
        announcementType="activity_event"
        participantCount={0}
      />,
    );
    fireEvent.press(getByText('Participate'));
    expect(toggle).toHaveBeenCalledTimes(1);
    expect(useRecommendationsStore.getState().signalCount).toBe(1);
    expect(useRecommendationsStore.getState().typeScores['activity_event']).toBe(5); // 'participate' weight = 5
  });

  it('pressing when not participating: calls recordSignal with correct type', () => {
    const recordSignal = jest.fn();
    useRecommendationsStore.setState({
      typeScores: {},
      signalCount: 0,
      openCounts: {},
      recordSignal,
    });
    const toggle = jest.fn();
    (useParticipation as jest.Mock).mockReturnValue({
      isParticipating: false,
      toggle,
      isToggling: false,
    });
    const { getByText } = renderWithQuery(
      <ParticipationButton announcementId="ann-1" announcementType="halaqa" participantCount={0} />,
    );
    fireEvent.press(getByText('Participate'));
    expect(recordSignal).toHaveBeenCalledWith('halaqa', 'participate');
  });

  it('pressing when already participating: calls toggle but does NOT call recordSignal', () => {
    const recordSignal = jest.fn();
    useRecommendationsStore.setState({
      typeScores: {},
      signalCount: 0,
      openCounts: {},
      recordSignal,
    });
    const toggle = jest.fn();
    (useParticipation as jest.Mock).mockReturnValue({
      isParticipating: true,
      toggle,
      isToggling: false,
    });
    const { getByText } = renderWithQuery(
      <ParticipationButton
        announcementId="ann-1"
        announcementType="activity_event"
        participantCount={5}
      />,
    );
    fireEvent.press(getByText('Going'));
    expect(toggle).toHaveBeenCalledTimes(1);
    expect(recordSignal).not.toHaveBeenCalled();
  });

  it('button is disabled when isFull', () => {
    (useParticipation as jest.Mock).mockReturnValue({
      isParticipating: false,
      toggle: jest.fn(),
      isToggling: false,
    });
    const { getByText } = renderWithQuery(
      <ParticipationButton
        announcementId="ann-1"
        announcementType="activity_event"
        participantCount={5}
        maxCapacity={5}
      />,
    );
    // "Full" is displayed and button is disabled
    const fullText = getByText('Full');
    expect(fullText).toBeTruthy();
    // The parent TouchableOpacity has disabled=true — we verify by checking the component tree
    // fireEvent.press on a disabled button should not trigger toggle
    const toggle = (useParticipation as jest.Mock).mock.results[
      (useParticipation as jest.Mock).mock.results.length - 1
    ].value.toggle as jest.Mock;
    fireEvent.press(fullText);
    expect(toggle).not.toHaveBeenCalled();
  });

  it('compact=true renders without error', () => {
    (useParticipation as jest.Mock).mockReturnValue({
      isParticipating: false,
      toggle: jest.fn(),
      isToggling: false,
    });
    const { toJSON } = renderWithQuery(
      <ParticipationButton
        announcementId="ann-1"
        announcementType="activity_event"
        participantCount={2}
        compact
      />,
    );
    expect(toJSON()).toBeTruthy();
  });
});
