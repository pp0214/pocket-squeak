import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { getDatabase } from "../db/db";
import { getPets, getDailyRecords } from "../db/queries";
import type { Pet, DailyRecord } from "../types";

interface BackupData {
  version: number;
  createdAt: string;
  pets: Pet[];
  dailyRecords: DailyRecord[];
}

const BACKUP_VERSION = 1;

/**
 * Create a full backup of all data
 */
export async function createBackup(): Promise<string> {
  // Get all pets
  const pets = await getPets();

  // Get all daily records for all pets
  const allRecords: DailyRecord[] = [];
  for (const pet of pets) {
    const records = await getDailyRecords(pet.id, 365 * 10); // Get up to 10 years of data
    allRecords.push(...records);
  }

  const backup: BackupData = {
    version: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    pets,
    dailyRecords: allRecords,
  };

  const filename = `pocket_squeak_backup_${new Date().toISOString().split("T")[0]}.json`;
  const filepath = `${FileSystem.documentDirectory}${filename}`;

  await FileSystem.writeAsStringAsync(filepath, JSON.stringify(backup, null, 2), {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return filepath;
}

/**
 * Share backup file
 */
export async function shareBackup(filepath: string): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error("Sharing is not available on this device");
  }

  await Sharing.shareAsync(filepath, {
    mimeType: "application/json",
    dialogTitle: "Backup Data",
  });
}

/**
 * Create and share backup
 */
export async function createAndShareBackup(): Promise<void> {
  const filepath = await createBackup();
  await shareBackup(filepath);
}

/**
 * Pick a backup file to restore
 */
export async function pickBackupFile(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: "application/json",
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.[0]) {
    return null;
  }

  return result.assets[0].uri;
}

/**
 * Validate backup data structure
 */
function validateBackup(data: unknown): data is BackupData {
  if (!data || typeof data !== "object") return false;

  const backup = data as BackupData;
  if (typeof backup.version !== "number") return false;
  if (!Array.isArray(backup.pets)) return false;
  if (!Array.isArray(backup.dailyRecords)) return false;

  return true;
}

/**
 * Restore data from a backup file
 */
export async function restoreBackup(filepath: string): Promise<void> {
  // Read backup file
  const content = await FileSystem.readAsStringAsync(filepath, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  let backup: BackupData;
  try {
    backup = JSON.parse(content);
  } catch {
    throw new Error("Invalid backup file format");
  }

  if (!validateBackup(backup)) {
    throw new Error("Invalid backup data structure");
  }

  const db = await getDatabase();

  // Start transaction
  await db.execAsync("BEGIN TRANSACTION");

  try {
    // Clear existing data
    await db.execAsync("DELETE FROM daily_records");
    await db.execAsync("DELETE FROM weight_logs");
    await db.execAsync("DELETE FROM health_logs");
    await db.execAsync("DELETE FROM pets");

    // Restore pets
    for (const pet of backup.pets) {
      await db.runAsync(
        `INSERT INTO pets (id, name, species, gender, birthday, photo_uri, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          pet.id,
          pet.name,
          pet.species,
          pet.gender,
          pet.birthday,
          pet.photoUri ?? null,
          pet.createdAt,
          pet.updatedAt,
        ]
      );
    }

    // Restore daily records
    for (const record of backup.dailyRecords) {
      await db.runAsync(
        `INSERT INTO daily_records (id, pet_id, record_date, weight, observations, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          record.id,
          record.petId,
          record.recordDate,
          record.weight ?? null,
          JSON.stringify(record.observations),
          record.notes ?? null,
          record.createdAt,
          record.updatedAt,
        ]
      );
    }

    await db.execAsync("COMMIT");
  } catch (error) {
    await db.execAsync("ROLLBACK");
    throw error;
  }
}

/**
 * Pick and restore from backup file
 */
export async function pickAndRestoreBackup(): Promise<boolean> {
  const filepath = await pickBackupFile();
  if (!filepath) {
    return false;
  }

  await restoreBackup(filepath);
  return true;
}
