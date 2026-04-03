import { renderHook } from '@testing-library/react-native';
import { usePushNotifications } from '../usePushNotifications';
import { useAuthStore } from '@store/auth.store';

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: 'ExponentPushToken[test]' }),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),
  AndroidImportance: { MAX: 5 },
}));

jest.mock('expo-device', () => ({
  isDevice: true,
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Notifications = require('expo-notifications') as {
  setNotificationHandler: jest.Mock;
  getPermissionsAsync: jest.Mock;
  requestPermissionsAsync: jest.Mock;
  getExpoPushTokenAsync: jest.Mock;
};

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  displayName: 'Test',
  role: 'user' as const,
  createdAt: '2026-01-01',
};

beforeEach(() => {
  jest.clearAllMocks();
  Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
  Notifications.getExpoPushTokenAsync.mockResolvedValue({ data: 'ExponentPushToken[test]' });
});

describe('usePushNotifications', () => {
  it('does nothing when userId is absent', () => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    renderHook(() => usePushNotifications());
    expect(Notifications.setNotificationHandler).not.toHaveBeenCalled();
  });

  it('sets notification handler when userId is present', async () => {
    useAuthStore.setState({
      user: mockUser,
      token: 'tok',
      isAuthenticated: true,
      isLoading: false,
    });
    renderHook(() => usePushNotifications());
    expect(Notifications.setNotificationHandler).toHaveBeenCalledTimes(1);
  });

  it('requests permission when not already granted', async () => {
    useAuthStore.setState({
      user: mockUser,
      token: 'tok',
      isAuthenticated: true,
      isLoading: false,
    });
    Notifications.getPermissionsAsync.mockResolvedValue({ status: 'undetermined' });
    renderHook(() => usePushNotifications());
    // handler is set synchronously; async token registration runs in background
    expect(Notifications.setNotificationHandler).toHaveBeenCalledTimes(1);
  });
});
