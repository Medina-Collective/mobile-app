import { useRecommendationsStore } from '../recommendations.store';

const initialState = {
  typeScores: {},
  signalCount: 0,
  openCounts: {},
};

beforeEach(() => {
  useRecommendationsStore.setState(initialState);
});

describe('recordSignal', () => {
  it('increases typeScores by 3 for a "save" signal', () => {
    useRecommendationsStore.getState().recordSignal('activity_event', 'save');
    expect(useRecommendationsStore.getState().typeScores['activity_event']).toBe(3);
  });

  it('increases typeScores by 5 for a "participate" signal', () => {
    useRecommendationsStore.getState().recordSignal('bazaar', 'participate');
    expect(useRecommendationsStore.getState().typeScores['bazaar']).toBe(5);
  });

  it('increases typeScores by 1 for an "open" signal', () => {
    useRecommendationsStore.getState().recordSignal('halaqa', 'open');
    expect(useRecommendationsStore.getState().typeScores['halaqa']).toBe(1);
  });

  it('accumulates typeScores across multiple signals of the same type', () => {
    useRecommendationsStore.getState().recordSignal('update', 'save');
    useRecommendationsStore.getState().recordSignal('update', 'participate');
    useRecommendationsStore.getState().recordSignal('update', 'open');
    // 3 + 5 + 1 = 9
    expect(useRecommendationsStore.getState().typeScores['update']).toBe(9);
  });

  it('increments signalCount by 1 per signal call', () => {
    useRecommendationsStore.getState().recordSignal('activity_event', 'save');
    expect(useRecommendationsStore.getState().signalCount).toBe(1);
  });

  it('accumulates signalCount across multiple signal calls', () => {
    useRecommendationsStore.getState().recordSignal('activity_event', 'save');
    useRecommendationsStore.getState().recordSignal('bazaar', 'participate');
    useRecommendationsStore.getState().recordSignal('halaqa', 'open');
    expect(useRecommendationsStore.getState().signalCount).toBe(3);
  });

  it('tracks typeScores independently for different types', () => {
    useRecommendationsStore.getState().recordSignal('activity_event', 'save');
    useRecommendationsStore.getState().recordSignal('bazaar', 'participate');
    expect(useRecommendationsStore.getState().typeScores['activity_event']).toBe(3);
    expect(useRecommendationsStore.getState().typeScores['bazaar']).toBe(5);
  });
});

describe('recordOpen', () => {
  it('increments openCounts for the given id', () => {
    useRecommendationsStore.getState().recordOpen('ann-1');
    expect(useRecommendationsStore.getState().openCounts['ann-1']).toBe(1);
  });

  it('accumulates openCounts across multiple opens of the same id', () => {
    useRecommendationsStore.getState().recordOpen('ann-1');
    useRecommendationsStore.getState().recordOpen('ann-1');
    useRecommendationsStore.getState().recordOpen('ann-1');
    expect(useRecommendationsStore.getState().openCounts['ann-1']).toBe(3);
  });

  it('tracks openCounts independently for different ids', () => {
    useRecommendationsStore.getState().recordOpen('ann-1');
    useRecommendationsStore.getState().recordOpen('ann-2');
    useRecommendationsStore.getState().recordOpen('ann-2');
    expect(useRecommendationsStore.getState().openCounts['ann-1']).toBe(1);
    expect(useRecommendationsStore.getState().openCounts['ann-2']).toBe(2);
  });

  it('does not affect signalCount', () => {
    useRecommendationsStore.getState().recordOpen('ann-1');
    expect(useRecommendationsStore.getState().signalCount).toBe(0);
  });
});
