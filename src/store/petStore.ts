import { create } from "zustand";
import type { PetWithLatestWeight, Pet } from "../types";
import {
  getPetsWithLatestWeight,
  addPet as dbAddPet,
  deletePet as dbDeletePet,
  addWeightLog as dbAddWeightLog,
  addHealthLog as dbAddHealthLog,
} from "../db/queries";
import type { PetFormData, HealthTag } from "../types";

interface PetState {
  pets: PetWithLatestWeight[];
  selectedPetId: number | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadPets: () => Promise<void>;
  addPet: (data: PetFormData) => Promise<Pet>;
  deletePet: (id: number) => Promise<void>;
  selectPet: (id: number | null) => void;
  recordWeight: (petId: number, weight: number) => Promise<void>;
  recordHealth: (
    petId: number,
    tags: HealthTag[],
    notes?: string,
  ) => Promise<void>;
  clearError: () => void;
}

export const usePetStore = create<PetState>((set, get) => ({
  pets: [],
  selectedPetId: null,
  isLoading: false,
  error: null,

  loadPets: async () => {
    set({ isLoading: true, error: null });
    try {
      const pets = await getPetsWithLatestWeight();
      set({ pets, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load pets",
        isLoading: false,
      });
    }
  },

  addPet: async (data: PetFormData) => {
    set({ isLoading: true, error: null });
    try {
      const pet = await dbAddPet(data);
      await get().loadPets(); // Refresh the list
      return pet;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to add pet",
        isLoading: false,
      });
      throw error;
    }
  },

  deletePet: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await dbDeletePet(id);
      const { selectedPetId } = get();
      if (selectedPetId === id) {
        set({ selectedPetId: null });
      }
      await get().loadPets(); // Refresh the list
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to delete pet",
        isLoading: false,
      });
      throw error;
    }
  },

  selectPet: (id: number | null) => {
    set({ selectedPetId: id });
  },

  recordWeight: async (petId: number, weight: number) => {
    set({ error: null });
    try {
      await dbAddWeightLog(petId, weight);
      await get().loadPets(); // Refresh to update latest weight
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to record weight",
      });
      throw error;
    }
  },

  recordHealth: async (petId: number, tags: HealthTag[], notes?: string) => {
    set({ error: null });
    try {
      await dbAddHealthLog(petId, tags, notes);
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to record health",
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
