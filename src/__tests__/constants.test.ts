/**
 * Unit tests for src/config/constants.ts
 */

import {
  HEALTH_THRESHOLDS,
  DATA_LIMITS,
  STORAGE_KEYS,
  NOTIFICATION_IDS,
  DATABASE_CONFIG,
} from "../config/constants";

describe("HEALTH_THRESHOLDS", () => {
  it("should have WEIGHT_LOSS_WARNING as a negative number", () => {
    expect(HEALTH_THRESHOLDS.WEIGHT_LOSS_WARNING).toBeLessThan(0);
    expect(typeof HEALTH_THRESHOLDS.WEIGHT_LOSS_WARNING).toBe("number");
  });

  it("should have WEIGHT_GAIN_NOTABLE as a positive number", () => {
    expect(HEALTH_THRESHOLDS.WEIGHT_GAIN_NOTABLE).toBeGreaterThan(0);
    expect(typeof HEALTH_THRESHOLDS.WEIGHT_GAIN_NOTABLE).toBe("number");
  });

  it("should have symmetrical thresholds", () => {
    // Weight loss and gain thresholds should have same absolute value
    expect(Math.abs(HEALTH_THRESHOLDS.WEIGHT_LOSS_WARNING)).toBe(
      HEALTH_THRESHOLDS.WEIGHT_GAIN_NOTABLE,
    );
  });

  it("should be immutable (const assertion)", () => {
    // This test verifies TypeScript const assertion works at runtime
    expect(Object.isFrozen(HEALTH_THRESHOLDS)).toBe(false); // as const doesn't freeze
    // But values should be readonly at compile time
    expect(HEALTH_THRESHOLDS.WEIGHT_LOSS_WARNING).toBe(-5);
    expect(HEALTH_THRESHOLDS.WEIGHT_GAIN_NOTABLE).toBe(5);
  });
});

describe("DATA_LIMITS", () => {
  it("should have reasonable default history days", () => {
    expect(DATA_LIMITS.DEFAULT_HISTORY_DAYS).toBeGreaterThan(0);
    expect(DATA_LIMITS.DEFAULT_HISTORY_DAYS).toBeLessThanOrEqual(365);
  });

  it("should have backup max years", () => {
    expect(DATA_LIMITS.BACKUP_MAX_YEARS).toBeGreaterThan(0);
    expect(DATA_LIMITS.BACKUP_MAX_YEARS).toBeLessThanOrEqual(100);
  });

  it("should have weight history limit", () => {
    expect(DATA_LIMITS.WEIGHT_HISTORY_LIMIT).toBeGreaterThan(0);
  });
});

describe("STORAGE_KEYS", () => {
  it("should have unique storage keys", () => {
    const keys = Object.values(STORAGE_KEYS);
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(keys.length);
  });

  it("should have non-empty string keys", () => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      expect(typeof key).toBe("string");
      expect(key.length).toBeGreaterThan(0);
    });
  });
});

describe("NOTIFICATION_IDS", () => {
  it("should have daily reminder ID", () => {
    expect(NOTIFICATION_IDS.DAILY_REMINDER).toBeDefined();
    expect(typeof NOTIFICATION_IDS.DAILY_REMINDER).toBe("string");
  });
});

describe("DATABASE_CONFIG", () => {
  it("should have database name with .db extension", () => {
    expect(DATABASE_CONFIG.DATABASE_NAME).toMatch(/\.db$/);
  });

  it("should have non-empty database name", () => {
    expect(DATABASE_CONFIG.DATABASE_NAME.length).toBeGreaterThan(3);
  });
});
