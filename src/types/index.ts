// Pet species types
export type PetSpecies = "rat" | "guinea_pig" | "hamster" | "gerbil" | "mouse";
export type Gender = "male" | "female" | "unknown";

// Preset observation tags (for quick selection)
export type PresetObservation =
  | "sneeze"
  | "porphyrin"
  | "soft_stool"
  | "lethargic"
  | "loss_of_appetite"
  | "normal";

// Food safety levels
export type FoodSafety = "safe" | "caution" | "danger";

// Core entities
export interface Pet {
  id: number;
  name: string;
  species: PetSpecies;
  gender: Gender;
  birthday: string; // ISO date string
  photoUri?: string;
  createdAt: string;
  updatedAt: string;
}

// Daily record - one per pet per day
export interface DailyRecord {
  id: number;
  petId: number;
  recordDate: string; // 'YYYY-MM-DD' format
  weight?: number; // in grams
  observations: string[]; // can be preset tags or custom text
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Legacy types (for backward compatibility)
export interface WeightLog {
  id: number;
  petId: number;
  weight: number;
  recordedAt: string;
}

export interface HealthLog {
  id: number;
  petId: number;
  tags: string[];
  notes?: string;
  recordedAt: string;
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  safety: FoodSafety;
  notes?: string;
}

// Form types
export interface PetFormData {
  name: string;
  species: PetSpecies;
  gender: Gender;
  birthday: string;
  photoUri?: string;
}

export interface RecordFormData {
  petId: number;
  weight?: number;
  observations: string[];
  notes?: string;
}

// UI types
export interface PetWithLatestWeight extends Pet {
  latestWeight?: number;
  weightChange?: number; // percentage change from previous
}

// Species default weights (in grams)
export const SPECIES_DEFAULT_WEIGHTS: Record<PetSpecies, number> = {
  rat: 350,
  guinea_pig: 900,
  hamster: 40,
  gerbil: 70,
  mouse: 25,
};

// Species display names
export const SPECIES_NAMES: Record<PetSpecies, string> = {
  rat: "Rat",
  guinea_pig: "Guinea Pig",
  hamster: "Hamster",
  gerbil: "Gerbil",
  mouse: "Mouse",
};

// Preset observation display info
export const OBSERVATION_PRESETS: Record<
  PresetObservation,
  { label: string; emoji: string; color: string }
> = {
  normal: { label: "Normal", emoji: "✅", color: "green" },
  sneeze: { label: "Sneeze", emoji: "🤧", color: "yellow" },
  porphyrin: { label: "Porphyrin", emoji: "👁️", color: "red" },
  soft_stool: { label: "Soft Stool", emoji: "💩", color: "yellow" },
  lethargic: { label: "Lethargic", emoji: "😴", color: "red" },
  loss_of_appetite: { label: "Loss of Appetite", emoji: "🍽️", color: "red" },
};
