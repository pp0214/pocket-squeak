// Pet species types
export type PetSpecies = "rat" | "guinea_pig" | "hamster" | "gerbil" | "mouse";
export type Gender = "male" | "female" | "unknown";

// Health tag types
export type HealthTag = "sneeze" | "porphyrin" | "soft_stool" | "lethargic";

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

export interface WeightLog {
  id: number;
  petId: number;
  weight: number; // in grams
  recordedAt: string; // ISO datetime string
}

export interface HealthLog {
  id: number;
  petId: number;
  tags: HealthTag[];
  notes?: string;
  recordedAt: string; // ISO datetime string
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
  weight: number;
  healthTags: HealthTag[];
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

// Health tag display info
export const HEALTH_TAG_INFO: Record<
  HealthTag,
  { label: string; emoji: string }
> = {
  sneeze: { label: "Sneeze", emoji: "🤧" },
  porphyrin: { label: "Porphyrin", emoji: "👁️" },
  soft_stool: { label: "Soft Stool", emoji: "💩" },
  lethargic: { label: "Lethargic", emoji: "😴" },
};
