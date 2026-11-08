import { useEffect } from 'react';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

// Shows reminders while the app is open too, so they are never silently dropped.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/**
 * Asks for permission (only ever triggered by a user tap), registers this device's
 * Expo push token with our server, and reports the outcome in plain words.
 * Returns { ok, reason } and never throws for an expected outcome.
 */
export async function enablePushNotifications(authedRequest) {
  if (!Device.isDevice) {
    return { ok: false, reason: 'Push reminders need a physical phone. Your inbox still receives reminders here.' };
  }

  const current = await Notifications.getPermissionsAsync();
  let status = current.status;
  if (status !== 'granted') {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== 'granted') {
    return { ok: false, reason: 'Notifications are off for Solace. You can change this in your phone settings.' };
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
  if (!projectId) {
    return { ok: false, reason: 'Push setup is missing its project ID. Reminders still appear in your inbox.' };
  }

  const { data: expoToken } = await Notifications.getExpoPushTokenAsync({ projectId });
  await authedRequest('/notifications/devices', {
    method: 'POST',
    body: { expoToken, platform: Platform.OS === 'ios' ? 'ios' : 'android' },
  });
  return { ok: true, reason: '' };
}

/**
 * Opens the screen a reminder points to when the user taps it. Only in-app paths
 * starting with "/" are followed, so a malformed payload cannot navigate elsewhere.
 */
export function useNotificationLinks() {
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const link = response.notification.request.content.data?.deepLink;
      if (typeof link === 'string' && link.startsWith('/')) {
        router.push(link);
      }
    });
    return () => sub.remove();
  }, []);
}
