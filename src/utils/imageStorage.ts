import * as FileSystem from "expo-file-system/legacy";

const IMAGES_DIR = `${FileSystem.documentDirectory}pet_images/`;

/**
 * Ensures the images directory exists
 */
async function ensureImagesDir(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(IMAGES_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(IMAGES_DIR, { intermediates: true });
  }
}

/**
 * Generates a unique filename for a pet image
 */
function generateImageFilename(petId: number | string): string {
  const timestamp = Date.now();
  return `pet_${petId}_${timestamp}.jpg`;
}

/**
 * Copies an image to the app's document directory for persistence
 * @param sourceUri - The temporary URI from ImagePicker
 * @param petId - The pet's ID (or 'new' for new pets)
 * @returns The new persistent URI or undefined if operation fails
 */
export async function saveImageToStorage(
  sourceUri: string,
  petId: number | string = "new",
): Promise<string | undefined> {
  try {
    await ensureImagesDir();

    // If the image is already in our storage, return it as-is
    if (sourceUri.startsWith(IMAGES_DIR)) {
      return sourceUri;
    }

    const filename = generateImageFilename(petId);
    const destUri = `${IMAGES_DIR}${filename}`;

    await FileSystem.copyAsync({
      from: sourceUri,
      to: destUri,
    });

    return destUri;
  } catch (error) {
    if (__DEV__) {
      console.error("Failed to save image to storage:", error);
    }
    return undefined;
  }
}

/**
 * Updates a pet's image, removing the old one if it exists
 * @param newSourceUri - The new image URI from ImagePicker
 * @param petId - The pet's ID
 * @param oldImageUri - The old image URI to delete (optional)
 * @returns The new persistent URI or undefined if operation fails
 */
export async function updatePetImage(
  newSourceUri: string,
  petId: number,
  oldImageUri?: string,
): Promise<string | undefined> {
  try {
    // Save new image first
    const newUri = await saveImageToStorage(newSourceUri, petId);

    // If successful and there's an old image, delete it
    if (newUri && oldImageUri && oldImageUri.startsWith(IMAGES_DIR)) {
      await deleteImageFromStorage(oldImageUri);
    }

    return newUri;
  } catch (error) {
    if (__DEV__) {
      console.error("Failed to update pet image:", error);
    }
    return undefined;
  }
}

/**
 * Deletes an image from storage
 * @param imageUri - The URI of the image to delete
 */
export async function deleteImageFromStorage(
  imageUri: string,
): Promise<boolean> {
  try {
    // Only delete if it's in our images directory
    if (!imageUri.startsWith(IMAGES_DIR)) {
      return true;
    }

    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(imageUri);
    }
    return true;
  } catch (error) {
    if (__DEV__) {
      console.error("Failed to delete image from storage:", error);
    }
    return false;
  }
}

/**
 * Deletes all images for a specific pet
 * @param petId - The pet's ID
 */
export async function deletePetImages(petId: number): Promise<void> {
  try {
    await ensureImagesDir();

    const files = await FileSystem.readDirectoryAsync(IMAGES_DIR);
    const petFiles = files.filter((f) => f.startsWith(`pet_${petId}_`));

    for (const file of petFiles) {
      await FileSystem.deleteAsync(`${IMAGES_DIR}${file}`);
    }
  } catch (error) {
    if (__DEV__) {
      console.error("Failed to delete pet images:", error);
    }
  }
}

/**
 * Checks if an image exists at the given URI
 */
export async function imageExists(imageUri: string): Promise<boolean> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    return fileInfo.exists;
  } catch {
    return false;
  }
}

/**
 * Gets the images directory path
 */
export function getImagesDirectory(): string {
  return IMAGES_DIR;
}
