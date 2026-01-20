import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Storage keys
const DAILY_REMINDER_ENABLED_KEY = "@pocket_squeak_daily_reminder_enabled";
const DAILY_REMINDER_HOUR_KEY = "@pocket_squeak_daily_reminder_hour";
const DAILY_REMINDER_MINUTE_KEY = "@pocket_squeak_daily_reminder_minute";
const HEALTH_ALERTS_ENABLED_KEY = "@pocket_squeak_health_alerts_enabled";

// Notification identifiers
const DAILY_REMINDER_ID = "daily-health-reminder";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationSettings {
  dailyReminderEnabled: boolean;
  dailyReminderHour: number;
  dailyReminderMinute: number;
  healthAlertsEnabled: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  dailyReminderEnabled: false,
  dailyReminderHour: 20, // 8 PM
  dailyReminderMinute: 0,
  healthAlertsEnabled: true,
};

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#ed7a11",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === "granted") {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

/**
 * Get current notification settings
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const [enabled, hour, minute, healthAlerts] = await Promise.all([
      AsyncStorage.getItem(DAILY_REMINDER_ENABLED_KEY),
      AsyncStorage.getItem(DAILY_REMINDER_HOUR_KEY),
      AsyncStorage.getItem(DAILY_REMINDER_MINUTE_KEY),
      AsyncStorage.getItem(HEALTH_ALERTS_ENABLED_KEY),
    ]);

    return {
      dailyReminderEnabled: enabled === "true",
      dailyReminderHour: hour
        ? parseInt(hour, 10)
        : DEFAULT_SETTINGS.dailyReminderHour,
      dailyReminderMinute: minute
        ? parseInt(minute, 10)
        : DEFAULT_SETTINGS.dailyReminderMinute,
      healthAlertsEnabled: healthAlerts !== "false", // Default to true
    };
  } catch (error) {
    if (__DEV__) {
      console.error("Failed to load notification settings:", error);
    }
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save notification settings
 */
export async function saveNotificationSettings(
  settings: Partial<NotificationSettings>,
): Promise<void> {
  try {
    const updates: Promise<void>[] = [];

    if (settings.dailyReminderEnabled !== undefined) {
      updates.push(
        AsyncStorage.setItem(
          DAILY_REMINDER_ENABLED_KEY,
          String(settings.dailyReminderEnabled),
        ),
      );
    }
    if (settings.dailyReminderHour !== undefined) {
      updates.push(
        AsyncStorage.setItem(
          DAILY_REMINDER_HOUR_KEY,
          String(settings.dailyReminderHour),
        ),
      );
    }
    if (settings.dailyReminderMinute !== undefined) {
      updates.push(
        AsyncStorage.setItem(
          DAILY_REMINDER_MINUTE_KEY,
          String(settings.dailyReminderMinute),
        ),
      );
    }
    if (settings.healthAlertsEnabled !== undefined) {
      updates.push(
        AsyncStorage.setItem(
          HEALTH_ALERTS_ENABLED_KEY,
          String(settings.healthAlertsEnabled),
        ),
      );
    }

    await Promise.all(updates);
  } catch (error) {
    if (__DEV__) {
      console.error("Failed to save notification settings:", error);
    }
    throw error;
  }
}

/**
 * Check if notification permissions are granted
 */
export async function hasNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
}

/**
 * Schedule daily reminder notification
 * @throws Error if notification permissions are not granted
 */
export async function scheduleDailyReminder(
  hour: number,
  minute: number,
  title: string,
  body: string,
): Promise<void> {
  // Check permissions before scheduling
  const hasPermission = await hasNotificationPermission();
  if (!hasPermission) {
    throw new Error("Notification permissions not granted");
  }

  // Cancel existing daily reminder
  await cancelDailyReminder();

  // Schedule new daily reminder
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
    identifier: DAILY_REMINDER_ID,
  });
}

/**
 * Cancel daily reminder notification
 */
export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID);
}

/**
 * Send immediate health alert notification
 */
export async function sendHealthAlert(
  title: string,
  body: string,
): Promise<void> {
  const settings = await getNotificationSettings();
  if (!settings.healthAlertsEnabled) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: null, // Immediate
  });
}

/**
 * Update daily reminder based on current settings
 */
export async function updateDailyReminderFromSettings(
  title: string,
  body: string,
): Promise<void> {
  const settings = await getNotificationSettings();

  if (settings.dailyReminderEnabled) {
    await scheduleDailyReminder(
      settings.dailyReminderHour,
      settings.dailyReminderMinute,
      title,
      body,
    );
  } else {
    await cancelDailyReminder();
  }
}

/**
 * Get all scheduled notifications (for debugging)
 */
export async function getScheduledNotifications(): Promise<
  Notifications.NotificationRequest[]
> {
  return await Notifications.getAllScheduledNotificationsAsync();
}
