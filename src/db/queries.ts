import { getDatabase } from "./db";
import type {
  Pet,
  PetFormData,
  WeightLog,
  HealthLog,
  DailyRecord,
  PetWithLatestWeight,
} from "../types";

// ============ PET CRUD ============

export async function addPet(data: PetFormData): Promise<Pet> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  const result = await db.runAsync(
    `INSERT INTO pets (name, species, gender, birthday, photo_uri, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name,
      data.species,
      data.gender,
      data.birthday,
      data.photoUri ?? null,
      now,
      now,
    ],
  );

  return {
    id: result.lastInsertRowId,
    name: data.name,
    species: data.species,
    gender: data.gender,
    birthday: data.birthday,
    photoUri: data.photoUri,
    createdAt: now,
    updatedAt: now,
  };
}

export async function getPets(): Promise<Pet[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: number;
    name: string;
    species: string;
    gender: string;
    birthday: string;
    photo_uri: string | null;
    created_at: string;
    updated_at: string;
  }>("SELECT * FROM pets ORDER BY created_at DESC");

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    species: row.species as Pet["species"],
    gender: row.gender as Pet["gender"],
    birthday: row.birthday,
    photoUri: row.photo_uri ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function getPetById(id: number): Promise<Pet | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{
    id: number;
    name: string;
    species: string;
    gender: string;
    birthday: string;
    photo_uri: string | null;
    created_at: string;
    updated_at: string;
  }>("SELECT * FROM pets WHERE id = ?", [id]);

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    species: row.species as Pet["species"],
    gender: row.gender as Pet["gender"],
    birthday: row.birthday,
    photoUri: row.photo_uri ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function updatePet(
  id: number,
  data: Partial<PetFormData>,
): Promise<void> {
  const db = await getDatabase();
  const updates: string[] = [];
  const values: (string | null)[] = [];

  if (data.name !== undefined) {
    updates.push("name = ?");
    values.push(data.name);
  }
  if (data.species !== undefined) {
    updates.push("species = ?");
    values.push(data.species);
  }
  if (data.gender !== undefined) {
    updates.push("gender = ?");
    values.push(data.gender);
  }
  if (data.birthday !== undefined) {
    updates.push("birthday = ?");
    values.push(data.birthday);
  }
  if (data.photoUri !== undefined) {
    updates.push("photo_uri = ?");
    values.push(data.photoUri ?? null);
  }

  if (updates.length === 0) return;

  updates.push("updated_at = ?");
  values.push(new Date().toISOString());
  values.push(id.toString());

  await db.runAsync(
    `UPDATE pets SET ${updates.join(", ")} WHERE id = ?`,
    values,
  );
}

export async function deletePet(id: number): Promise<void> {
  const db = await getDatabase();

  // Get pet data to clean up photo
  const pet = await getPetById(id);

  await db.runAsync("DELETE FROM pets WHERE id = ?", [id]);

  // Clean up pet images if any
  if (pet?.photoUri) {
    const { deletePetImages } = await import("../utils/imageStorage");
    await deletePetImages(id);
  }
}

// ============ WEIGHT LOGS ============

export async function addWeightLog(
  petId: number,
  weight: number,
): Promise<WeightLog> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  const result = await db.runAsync(
    "INSERT INTO weight_logs (pet_id, weight, recorded_at) VALUES (?, ?, ?)",
    [petId, weight, now],
  );

  return {
    id: result.lastInsertRowId,
    petId,
    weight,
    recordedAt: now,
  };
}

export async function getLatestWeight(
  petId: number,
): Promise<WeightLog | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{
    id: number;
    pet_id: number;
    weight: number;
    recorded_at: string;
  }>(
    "SELECT * FROM weight_logs WHERE pet_id = ? ORDER BY recorded_at DESC LIMIT 1",
    [petId],
  );

  if (!row) return null;

  return {
    id: row.id,
    petId: row.pet_id,
    weight: row.weight,
    recordedAt: row.recorded_at,
  };
}

export async function getPetWeightHistory(
  petId: number,
  limit = 30,
): Promise<WeightLog[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: number;
    pet_id: number;
    weight: number;
    recorded_at: string;
  }>(
    "SELECT * FROM weight_logs WHERE pet_id = ? ORDER BY recorded_at DESC LIMIT ?",
    [petId, limit],
  );

  return rows.map((row) => ({
    id: row.id,
    petId: row.pet_id,
    weight: row.weight,
    recordedAt: row.recorded_at,
  }));
}

export async function getWeightChange(
  petId: number,
): Promise<number | undefined> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ weight: number }>(
    "SELECT weight FROM weight_logs WHERE pet_id = ? ORDER BY recorded_at DESC LIMIT 2",
    [petId],
  );

  if (rows.length < 2) return undefined;

  const [latest, previous] = rows;
  if (previous.weight === 0) return undefined;

  return ((latest.weight - previous.weight) / previous.weight) * 100;
}

// ============ DAILY RECORDS ============

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

export async function upsertDailyRecord(
  petId: number,
  data: { weight?: number; observations?: string[]; notes?: string },
): Promise<DailyRecord> {
  const db = await getDatabase();
  const recordDate = getTodayDate();
  const now = new Date().toISOString();

  // Check if record exists for today
  const existing = await db.getFirstAsync<{
    id: number;
    weight: number | null;
    observations: string;
    notes: string | null;
  }>(
    "SELECT id, weight, observations, notes FROM daily_records WHERE pet_id = ? AND record_date = ?",
    [petId, recordDate],
  );

  if (existing) {
    // Update existing record
    const newWeight = data.weight ?? existing.weight;
    const existingObs = JSON.parse(existing.observations) as string[];
    const newObs = data.observations
      ? [...new Set([...existingObs, ...data.observations])]
      : existingObs;
    const newNotes = data.notes ?? existing.notes;

    await db.runAsync(
      `UPDATE daily_records SET weight = ?, observations = ?, notes = ?, updated_at = ?
       WHERE id = ?`,
      [
        newWeight ?? null,
        JSON.stringify(newObs),
        newNotes ?? null,
        now,
        existing.id,
      ],
    );

    return {
      id: existing.id,
      petId,
      recordDate,
      weight: newWeight ?? undefined,
      observations: newObs,
      notes: newNotes ?? undefined,
      createdAt: now,
      updatedAt: now,
    };
  } else {
    // Insert new record
    const result = await db.runAsync(
      `INSERT INTO daily_records (pet_id, record_date, weight, observations, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        petId,
        recordDate,
        data.weight ?? null,
        JSON.stringify(data.observations ?? []),
        data.notes ?? null,
        now,
        now,
      ],
    );

    return {
      id: result.lastInsertRowId,
      petId,
      recordDate,
      weight: data.weight,
      observations: data.observations ?? [],
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    };
  }
}

export async function getTodayRecord(
  petId: number,
): Promise<DailyRecord | null> {
  const db = await getDatabase();
  const recordDate = getTodayDate();

  const row = await db.getFirstAsync<{
    id: number;
    pet_id: number;
    record_date: string;
    weight: number | null;
    observations: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
  }>("SELECT * FROM daily_records WHERE pet_id = ? AND record_date = ?", [
    petId,
    recordDate,
  ]);

  if (!row) return null;

  return {
    id: row.id,
    petId: row.pet_id,
    recordDate: row.record_date,
    weight: row.weight ?? undefined,
    observations: JSON.parse(row.observations) as string[],
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getDailyRecords(
  petId: number,
  days = 30,
): Promise<DailyRecord[]> {
  const db = await getDatabase();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split("T")[0];

  const rows = await db.getAllAsync<{
    id: number;
    pet_id: number;
    record_date: string;
    weight: number | null;
    observations: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
  }>(
    `SELECT * FROM daily_records
     WHERE pet_id = ? AND record_date >= ?
     ORDER BY record_date DESC`,
    [petId, startDateStr],
  );

  return rows.map((row) => ({
    id: row.id,
    petId: row.pet_id,
    recordDate: row.record_date,
    weight: row.weight ?? undefined,
    observations: JSON.parse(row.observations) as string[],
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function getAllPetRecordsForDateRange(
  startDate: string,
  endDate: string,
): Promise<(DailyRecord & { petName: string; petSpecies: string })[]> {
  const db = await getDatabase();

  const rows = await db.getAllAsync<{
    id: number;
    pet_id: number;
    record_date: string;
    weight: number | null;
    observations: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
    pet_name: string;
    pet_species: string;
  }>(
    `SELECT dr.*, p.name as pet_name, p.species as pet_species
     FROM daily_records dr
     JOIN pets p ON dr.pet_id = p.id
     WHERE dr.record_date >= ? AND dr.record_date <= ?
     ORDER BY dr.record_date DESC, p.name ASC`,
    [startDate, endDate],
  );

  return rows.map((row) => ({
    id: row.id,
    petId: row.pet_id,
    recordDate: row.record_date,
    weight: row.weight ?? undefined,
    observations: JSON.parse(row.observations) as string[],
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    petName: row.pet_name,
    petSpecies: row.pet_species,
  }));
}

// ============ LEGACY HEALTH LOGS (for backward compatibility) ============

export async function addHealthLog(
  petId: number,
  tags: string[],
  notes?: string,
): Promise<HealthLog> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  const result = await db.runAsync(
    "INSERT INTO health_logs (pet_id, tags, notes, recorded_at) VALUES (?, ?, ?, ?)",
    [petId, JSON.stringify(tags), notes ?? null, now],
  );

  return {
    id: result.lastInsertRowId,
    petId,
    tags,
    notes,
    recordedAt: now,
  };
}

export async function getPetHealthHistory(
  petId: number,
  limit = 30,
): Promise<HealthLog[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: number;
    pet_id: number;
    tags: string;
    notes: string | null;
    recorded_at: string;
  }>(
    "SELECT * FROM health_logs WHERE pet_id = ? ORDER BY recorded_at DESC LIMIT ?",
    [petId, limit],
  );

  return rows.map((row) => ({
    id: row.id,
    petId: row.pet_id,
    tags: JSON.parse(row.tags) as string[],
    notes: row.notes ?? undefined,
    recordedAt: row.recorded_at,
  }));
}

// ============ DEV: SEED MOCK DATA ============

export async function seedMockHistory(petId: number): Promise<void> {
  const db = await getDatabase();
  const now = new Date();

  const mockData = [
    { daysAgo: 1, weight: 352, observations: ["normal"], notes: null },
    {
      daysAgo: 2,
      weight: 350,
      observations: ["normal"],
      notes: "Active and eating well",
    },
    { daysAgo: 3, weight: 348, observations: ["sneeze"], notes: null },
    { daysAgo: 4, weight: 351, observations: ["normal"], notes: null },
    {
      daysAgo: 5,
      weight: 349,
      observations: ["soft_stool"],
      notes: "Changed bedding",
    },
    {
      daysAgo: 6,
      weight: 347,
      observations: ["normal", "porphyrin"],
      notes: "Mild stress signs",
    },
    { daysAgo: 7, weight: 350, observations: ["normal"], notes: null },
  ];

  for (const data of mockData) {
    const date = new Date(now);
    date.setDate(date.getDate() - data.daysAgo);
    const recordDate = date.toISOString().split("T")[0];
    const timestamp = date.toISOString();

    // Check if record exists
    const existing = await db.getFirstAsync(
      "SELECT id FROM daily_records WHERE pet_id = ? AND record_date = ?",
      [petId, recordDate],
    );

    if (!existing) {
      await db.runAsync(
        `INSERT INTO daily_records (pet_id, record_date, weight, observations, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          petId,
          recordDate,
          data.weight,
          JSON.stringify(data.observations),
          data.notes,
          timestamp,
          timestamp,
        ],
      );
    }
  }
}

// ============ COMBINED QUERIES ============

export async function getPetsWithLatestWeight(): Promise<
  PetWithLatestWeight[]
> {
  const pets = await getPets();

  const results: PetWithLatestWeight[] = await Promise.all(
    pets.map(async (pet) => {
      const latestWeight = await getLatestWeight(pet.id);
      const weightChange = await getWeightChange(pet.id);
      return {
        ...pet,
        latestWeight: latestWeight?.weight,
        weightChange,
      };
    }),
  );

  return results;
}
