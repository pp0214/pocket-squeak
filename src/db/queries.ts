import { getDatabase } from "./db";
import type {
  Pet,
  PetFormData,
  WeightLog,
  HealthLog,
  HealthTag,
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
  await db.runAsync("DELETE FROM pets WHERE id = ?", [id]);
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

// ============ HEALTH LOGS ============

export async function addHealthLog(
  petId: number,
  tags: HealthTag[],
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
    tags: JSON.parse(row.tags) as HealthTag[],
    notes: row.notes ?? undefined,
    recordedAt: row.recorded_at,
  }));
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
