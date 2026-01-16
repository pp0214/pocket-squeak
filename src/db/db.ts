import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  db = await SQLite.openDatabaseAsync("pocket-squeak.db");
  await initDatabase(db);
  return db;
}

async function initDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  // Enable foreign keys
  await database.execAsync("PRAGMA foreign_keys = ON;");

  // Create pets table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS pets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      species TEXT NOT NULL,
      gender TEXT NOT NULL DEFAULT 'unknown',
      birthday TEXT NOT NULL,
      photo_uri TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Create weight_logs table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS weight_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pet_id INTEGER NOT NULL,
      weight REAL NOT NULL,
      recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
    );
  `);

  // Create health_logs table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS health_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pet_id INTEGER NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]',
      notes TEXT,
      recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
    );
  `);

  // Create indexes for better query performance
  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_weight_logs_pet_id ON weight_logs(pet_id);
    CREATE INDEX IF NOT EXISTS idx_weight_logs_recorded_at ON weight_logs(recorded_at);
    CREATE INDEX IF NOT EXISTS idx_health_logs_pet_id ON health_logs(pet_id);
    CREATE INDEX IF NOT EXISTS idx_health_logs_recorded_at ON health_logs(recorded_at);
  `);
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
