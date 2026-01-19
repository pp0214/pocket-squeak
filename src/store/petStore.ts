import { create } from "zustand";
import type { PetWithLatestWeight, Pet, PetFormData } from "../types";
import {
  getPetsWithLatestWeight,
  addPet as dbAddPet,
  deletePet as dbDeletePet,
  addWeightLog as dbAddWeightLog,
  addHealthLog as dbAddHealthLog,
} from "../db/queries";
import { sendHealthAlert, getNotificationSettings } from "../services/notificationService";
import { onPetDataChanged } from "../services/widgetService";
import i18n from "../i18n";

// Threshold for weight loss alert (percentage)
const WEIGHT_LOSS_ALERT_THRESHOLD = -5;

interface HealthAlert {
  petId: number;
  petName: string;
  type: "weight_loss";
  value: number;
}

interface PetState {
  pets: PetWithLatestWeight[];
  selectedPetId: number | null;
  isLoading: boolean;
  error: string | null;
  healthAlerts: HealthAlert[];

  // Actions
  loadPets: () => Promise<void>;
  addPet: (data: PetFormData) => Promise<Pet>;
  deletePet: (id: number) => Promise<void>;
  selectPet: (id: number | null) => void;
  recordWeight: (petId: number, weight: number) => Promise<void>;
  recordHealth: (
    petId: number,
    tags: string[],
    notes?: string,
  ) => Promise<void>;
  clearError: () => void;
  checkHealthAlerts: (pets: PetWithLatestWeight[]) => Promise<void>;
  clearAlert: (petId: number) => void;
}

export const usePetStore = create<PetState>((set, get) => ({
  pets: [],
  selectedPetId: null,
  isLoading: false,
  error: null,
  healthAlerts: [],

  checkHealthAlerts: async (pets: PetWithLatestWeight[]) => {
    const alerts: HealthAlert[] = [];
    const settings = await getNotificationSettings();

    for (const pet of pets) {
      if (
        pet.weightChange !== undefined &&
        pet.weightChange <= WEIGHT_LOSS_ALERT_THRESHOLD
      ) {
        alerts.push({
          petId: pet.id,
          petName: pet.name,
          type: "weight_loss",
          value: pet.weightChange,
        });

        // Send notification if health alerts are enabled
        if (settings.healthAlertsEnabled) {
          await sendHealthAlert(
            i18n.t("notifications.weightAlertTitle"),
            i18n.t("notifications.weightAlertBody", {
              name: pet.name,
              percent: Math.abs(pet.weightChange).toFixed(1),
            })
          );
        }
      }
    }

    set({ healthAlerts: alerts });
  },

  clearAlert: (petId: number) => {
    set((state) => ({
      healthAlerts: state.healthAlerts.filter((a) => a.petId !== petId),
    }));
  },

  loadPets: async () => {
    set({ isLoading: true, error: null });
    try {
      const pets = await getPetsWithLatestWeight();
      set({ pets, isLoading: false });
      // Check for health alerts after loading
      await get().checkHealthAlerts(pets);
      // Sync widget data
      await onPetDataChanged();
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

  recordHealth: async (petId: number, tags: string[], notes?: string) => {
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
