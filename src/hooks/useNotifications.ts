import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  NotificationSettings,
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermissions,
  scheduleDailyReminder,
  cancelDailyReminder,
} from "../services/notificationService";

export function useNotifications() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [loadedSettings, permission] = await Promise.all([
          getNotificationSettings(),
          requestNotificationPermissions(),
        ]);
        setSettings(loadedSettings);
        setHasPermission(permission);
      } catch (error) {
        console.error("Failed to load notification settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = useCallback(
    async (updates: Partial<NotificationSettings>) => {
      if (!settings) return;

      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);

      try {
        await saveNotificationSettings(updates);

        // Update daily reminder if relevant settings changed
        if (
          updates.dailyReminderEnabled !== undefined ||
          updates.dailyReminderHour !== undefined ||
          updates.dailyReminderMinute !== undefined
        ) {
          if (newSettings.dailyReminderEnabled) {
            await scheduleDailyReminder(
              newSettings.dailyReminderHour,
              newSettings.dailyReminderMinute,
              t("notifications.dailyReminderTitle"),
              t("notifications.dailyReminderBody")
            );
          } else {
            await cancelDailyReminder();
          }
        }
      } catch (error) {
        // Revert on error
        setSettings(settings);
        throw error;
      }
    },
    [settings, t]
  );

  const toggleDailyReminder = useCallback(async () => {
    if (!hasPermission) {
      const granted = await requestNotificationPermissions();
      setHasPermission(granted);
      if (!granted) return;
    }
    await updateSettings({ dailyReminderEnabled: !settings?.dailyReminderEnabled });
  }, [settings, hasPermission, updateSettings]);

  const setReminderTime = useCallback(
    async (hour: number, minute: number) => {
      await updateSettings({
        dailyReminderHour: hour,
        dailyReminderMinute: minute,
      });
    },
    [updateSettings]
  );

  const toggleHealthAlerts = useCallback(async () => {
    await updateSettings({ healthAlertsEnabled: !settings?.healthAlertsEnabled });
  }, [settings, updateSettings]);

  return {
    settings,
    isLoading,
    hasPermission,
    toggleDailyReminder,
    setReminderTime,
    toggleHealthAlerts,
    updateSettings,
  };
}
