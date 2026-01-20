/**
 * Application-wide constants and configuration
 * Centralized to ensure consistency across the codebase
 */

/**
 * Health monitoring thresholds
 * These values determine when health alerts are triggered
 */
export const HEALTH_THRESHOLDS = {
  /**
   * Weight loss percentage that triggers a warning
   * A negative value indicating significant weight loss (e.g., -5 means 5% loss)
   */
  WEIGHT_LOSS_WARNING: -5,

  /**
   * Weight gain percentage considered notable
   * A positive value indicating significant weight gain
   */
  WEIGHT_GAIN_NOTABLE: 5,
} as const;

/**
 * Default data limits and ranges
 */
export const DATA_LIMITS = {
  /** Default number of days for history queries */
  DEFAULT_HISTORY_DAYS: 30,

  /** Maximum years of data to export in backup */
  BACKUP_MAX_YEARS: 10,

  /** Maximum number of weight history entries to fetch */
  WEIGHT_HISTORY_LIMIT: 30,
} as const;

/**
 * Storage keys for AsyncStorage
 */
export const STORAGE_KEYS = {
  LANGUAGE_PREFERENCE: "language_preference",
  NOTIFICATION_SETTINGS: "notification_settings",
  DAILY_REMINDER_SCHEDULED: "daily_reminder_scheduled",
} as const;

/**
 * Notification identifiers
 */
export const NOTIFICATION_IDS = {
  DAILY_REMINDER: "daily-reminder",
} as const;

/**
 * Database configuration
 */
export const DATABASE_CONFIG = {
  DATABASE_NAME: "pocket-squeak.db",
} as const;
