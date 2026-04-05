import { useEffect } from 'react';
import type * as NotificationsModule from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '@services/supabase.client';
import { useAuthStore } from '@store/auth.store';

// Dynamic require so a missing native module (ExpoPushTokenManager) doesn't
// crash the app at import time. This happens when the dev client was built
// before expo-notifications was added, or when running in Expo Go.
let Notifications: typeof NotificationsModule | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Notifications = require('expo-notifications') as typeof NotificationsModule;
} catch {
  // Native module unavailable — push notifications silently disabled
}

/**
 * Call once near the root of the authenticated app.
 * Requests push permission, gets the Expo push token,
 * and upserts it to push_tokens in Supabase.
 */
export function usePushNotifications() {
  const userId = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    if (!userId || Notifications === null) return;

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    void registerAndSaveToken(userId);
  }, [userId]);
}

async function registerAndSaveToken(userId: string) {
  if (Notifications === null) return;
  if (!Device.isDevice) return; // push tokens don't work on simulators

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    await supabase
      .from('push_tokens')
      .upsert({ user_id: userId, token }, { onConflict: 'user_id, token' });
  } catch {
    // Silently skip — happens on personal-team dev builds that lack
    // the aps-environment entitlement. Push will work in production.
  }
}
