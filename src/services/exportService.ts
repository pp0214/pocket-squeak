import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { getPets, getDailyRecords, getAllPetRecordsForDateRange } from "../db/queries";
import type { Pet, DailyRecord } from "../types";

export interface ExportOptions {
  petIds?: number[]; // If empty, export all pets
  startDate?: string; // YYYY-MM-DD format
  endDate?: string; // YYYY-MM-DD format
}

/**
 * Generate CSV content from daily records
 */
function generateCSV(
  records: (DailyRecord & { petName: string; petSpecies: string })[]
): string {
  const headers = ["Date", "Pet Name", "Species", "Weight (g)", "Observations", "Notes"];
  const rows = records.map((record) => [
    record.recordDate,
    `"${record.petName}"`,
    record.petSpecies,
    record.weight?.toString() ?? "",
    `"${record.observations.join(", ")}"`,
    `"${record.notes ?? ""}"`,
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

/**
 * Export health records as CSV
 */
export async function exportToCSV(options: ExportOptions = {}): Promise<string> {
  const { petIds, startDate, endDate } = options;

  // Calculate date range
  const end = endDate ?? new Date().toISOString().split("T")[0];
  const start =
    startDate ??
    (() => {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      return d.toISOString().split("T")[0];
    })();

  // Get all records in date range
  let records = await getAllPetRecordsForDateRange(start, end);

  // Filter by pet IDs if specified
  if (petIds && petIds.length > 0) {
    records = records.filter((r) => petIds.includes(r.petId));
  }

  if (records.length === 0) {
    throw new Error("No records found for the selected criteria");
  }

  // Generate CSV
  const csv = generateCSV(records);

  // Save to file
  const filename = `pocket_squeak_export_${start}_${end}.csv`;
  const filepath = `${FileSystem.documentDirectory}${filename}`;

  await FileSystem.writeAsStringAsync(filepath, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return filepath;
}

/**
 * Share exported file
 */
export async function shareFile(filepath: string): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error("Sharing is not available on this device");
  }

  await Sharing.shareAsync(filepath, {
    mimeType: "text/csv",
    dialogTitle: "Export Health Records",
  });
}

/**
 * Export and share CSV
 */
export async function exportAndShareCSV(options: ExportOptions = {}): Promise<void> {
  const filepath = await exportToCSV(options);
  await shareFile(filepath);
}
