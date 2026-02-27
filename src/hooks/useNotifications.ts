import { useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { supabase } from '@/config/supabase';

const REMINDER_HOUR = 18;
const REMINDER_MINUTE = 0;
const NOTIFICATION_ID_KEY = '@aiklubben_notification_id';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyReminder(title: string, body: string): Promise<string | null> {
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return null;

    await cancelDailyReminder();

    const id = await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: REMINDER_HOUR,
        minute: REMINDER_MINUTE,
      },
    });

    await AsyncStorage.setItem(NOTIFICATION_ID_KEY, id);
    return id;
  } catch (err) {
    console.error('[useNotifications] scheduleDailyReminder error:', err);
    return null;
  }
}

export async function cancelDailyReminder(): Promise<void> {
  try {
    const id = await AsyncStorage.getItem(NOTIFICATION_ID_KEY);
    if (id) {
      await Notifications.cancelScheduledNotificationAsync(id);
      await AsyncStorage.removeItem(NOTIFICATION_ID_KEY);
    }
  } catch (err) {
    console.error('[useNotifications] cancelDailyReminder error:', err);
  }
}

export async function registerPushToken(userId: string): Promise<void> {
  try {
    if (Platform.OS !== 'ios') return;

    const granted = await requestNotificationPermission();
    if (!granted) return;

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;
    if (!token) return;

    await supabase.from('push_tokens').upsert(
      { user_id: userId, token, platform: 'ios' },
      { onConflict: 'user_id,token' },
    );
  } catch (err) {
    console.error('[useNotifications] registerPushToken error:', err);
  }
}

export function useNotifications(enabled: boolean, title: string, body: string) {
  const schedule = useCallback(async () => {
    if (enabled) {
      await scheduleDailyReminder(title, body);
    } else {
      await cancelDailyReminder();
    }
  }, [enabled, title, body]);

  useEffect(() => {
    schedule();
  }, [schedule]);
}
