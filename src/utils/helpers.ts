/**
 * Pure utility functions that can be easily unit tested
 */

/**
 * Safely parse JSON with a fallback value
 * Prevents app crashes from corrupted or invalid JSON
 *
 * @param jsonString - The JSON string to parse
 * @param fallback - The fallback value to return if parsing fails
 * @returns The parsed value or the fallback
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.warn("Failed to parse JSON, using fallback:", jsonString);
    }
    return fallback;
  }
}

/**
 * Escape a string for CSV format
 * - Escapes embedded quotes by doubling them
 * - Wraps in quotes if contains comma, quote, or newline
 * - Prevents CSV injection by escaping leading special characters
 *
 * @param value - The string value to escape
 * @returns The escaped CSV field
 */
export function escapeCSVField(value: string): string {
  // Prevent CSV injection: escape leading =, +, -, @, tab, carriage return
  let escaped = value;
  if (/^[=+\-@\t\r]/.test(escaped)) {
    escaped = "'" + escaped;
  }

  // Escape embedded quotes by doubling them
  escaped = escaped.replace(/"/g, '""');

  // Wrap in quotes if contains special characters
  if (/[",\n\r]/.test(escaped) || escaped !== value) {
    return `"${escaped}"`;
  }

  return escaped;
}

/**
 * Calculate weight change percentage between two weights
 *
 * @param currentWeight - The current weight
 * @param previousWeight - The previous weight
 * @returns The percentage change or undefined if calculation is not possible
 */
export function calculateWeightChangePercent(
  currentWeight: number | null | undefined,
  previousWeight: number | null | undefined,
): number | undefined {
  if (
    currentWeight === null ||
    currentWeight === undefined ||
    previousWeight === null ||
    previousWeight === undefined ||
    previousWeight === 0
  ) {
    return undefined;
  }

  return ((currentWeight - previousWeight) / previousWeight) * 100;
}
