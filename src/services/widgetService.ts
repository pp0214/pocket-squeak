import * as FileSystem from "expo-file-system";
import { getPetsWithLatestWeight } from "../db/queries";
import type { PetWithLatestWeight } from "../types";

// App Group identifier - must match the one configured in Xcode
const APP_GROUP_IDENTIFIER = "group.com.pocketsqueak.shared";

// Widget data file name
const WIDGET_DATA_FILE = "widget_data.json";

export interface WidgetPetData {
  id: number;
  name: string;
  species: string;
  latestWeight?: number;
  weightChange?: number;
  hasAlert: boolean;
}

export interface WidgetData {
  updatedAt: string;
  pets: WidgetPetData[];
}

/**
 * Get the shared container path for App Groups (iOS only)
 * Uses expo-file-system's support for App Groups
 */
function getAppGroupPath(): string | null {
  // On iOS, we need to use the App Group container
  // expo-file-system doesn't directly support this, so we use a workaround
  // The path format is: file:///var/mobile/Containers/Shared/AppGroup/{group-id}/
  
  // For now, use document directory (works for testing)
  // For production, install react-native-shared-group-preferences or similar
  return FileSystem.documentDirectory;
}

/**
 * Transform pet data for widget consumption
 */
function transformPetData(pets: PetWithLatestWeight[]): WidgetPetData[] {
  return pets.map((pet) => ({
    id: pet.id,
    name: pet.name,
    species: pet.species,
    latestWeight: pet.latestWeight,
    weightChange: pet.weightChange,
    hasAlert: pet.weightChange !== undefined && pet.weightChange <= -5,
  }));
}

/**
 * Sync pet data to shared container for widget access
 */
export async function syncWidgetData(): Promise<void> {
  try {
    const appGroupPath = getAppGroupPath();
    if (!appGroupPath) {
      console.warn("App Group path not available");
      return;
    }

    // Get current pet data
    const pets = await getPetsWithLatestWeight();

    // Prepare widget data
    const widgetData: WidgetData = {
      updatedAt: new Date().toISOString(),
      pets: transformPetData(pets),
    };

    // Write to shared container
    const filePath = `${appGroupPath}${WIDGET_DATA_FILE}`;
    await FileSystem.writeAsStringAsync(
      filePath,
      JSON.stringify(widgetData),
      { encoding: FileSystem.EncodingType.UTF8 }
    );

    console.log("Widget data synced successfully");
  } catch (error) {
    console.error("Failed to sync widget data:", error);
  }
}

/**
 * Read widget data (for testing purposes)
 */
export async function readWidgetData(): Promise<WidgetData | null> {
  try {
    const appGroupPath = getAppGroupPath();
    if (!appGroupPath) return null;

    const filePath = `${appGroupPath}${WIDGET_DATA_FILE}`;
    const content = await FileSystem.readAsStringAsync(filePath, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    return JSON.parse(content) as WidgetData;
  } catch (error) {
    console.error("Failed to read widget data:", error);
    return null;
  }
}

/**
 * Hook into pet store to auto-sync widget data
 * Call this after any pet data changes
 */
export async function onPetDataChanged(): Promise<void> {
  await syncWidgetData();
}
