import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { getPetById, updatePet } from "@/src/db/queries";
import { updatePetImage } from "@/src/utils/imageStorage";
import { usePetStore } from "@/src/store/petStore";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import {
  type PetSpecies,
  type Gender,
  type Pet,
  SPECIES_NAMES,
} from "@/src/types";
import { clsx } from "clsx";

const SPECIES_OPTIONS: { value: PetSpecies; emoji: string }[] = [
  { value: "rat", emoji: "🐀" },
  { value: "guinea_pig", emoji: "🐹" },
  { value: "hamster", emoji: "🐹" },
  { value: "gerbil", emoji: "🐭" },
  { value: "mouse", emoji: "🐭" },
];

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "unknown", label: "Unknown" },
];

export default function EditPetModal() {
  const router = useRouter();
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const { loadPets } = usePetStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pet, setPet] = useState<Pet | null>(null);

  const [name, setName] = useState("");
  const [species, setSpecies] = useState<PetSpecies>("rat");
  const [gender, setGender] = useState<Gender>("unknown");
  const [birthday, setBirthday] = useState("");
  const [photoUri, setPhotoUri] = useState<string>();
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadPet = async () => {
      if (!petId) return;

      try {
        const petData = await getPetById(Number(petId));
        if (petData) {
          setPet(petData);
          setName(petData.name);
          setSpecies(petData.species);
          setGender(petData.gender);
          setBirthday(petData.birthday);
          setPhotoUri(petData.photoUri);
        }
      } catch (error) {
        console.error("Failed to load pet:", error);
        Alert.alert("Error", "Failed to load pet data.");
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    loadPet();
  }, [petId, router]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!birthday.trim()) {
      newErrors.birthday = "Birthday is required";
    } else {
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(birthday)) {
        newErrors.birthday = "Use format: YYYY-MM-DD";
      } else {
        const date = new Date(birthday);
        if (isNaN(date.getTime())) {
          newErrors.birthday = "Invalid date";
        } else if (date > new Date()) {
          newErrors.birthday = "Birthday cannot be in the future";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm() || !petId) return;

    setIsSaving(true);
    try {
      let finalPhotoUri = photoUri;

      // If photo changed, update with persistent storage
      if (photoUri && photoUri !== pet?.photoUri) {
        const newPhotoUri = await updatePetImage(
          photoUri,
          Number(petId),
          pet?.photoUri
        );
        finalPhotoUri = newPhotoUri ?? photoUri;
      }

      await updatePet(Number(petId), {
        name: name.trim(),
        species,
        gender,
        birthday,
        photoUri: finalPhotoUri,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await loadPets(); // Refresh home list
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to update pet. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#ed7a11" />
      </View>
    );
  }

  if (!pet) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Pet not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView className="flex-1 bg-gray-50">
        <View className="p-4 gap-4">
          {/* Photo Picker */}
          <TouchableOpacity
            onPress={handlePickImage}
            className="self-center w-24 h-24 rounded-full bg-primary-100 items-center justify-center overflow-hidden"
          >
            {photoUri ? (
              <View className="w-full h-full">
                <Text className="text-4xl text-center leading-[96px]">📷</Text>
              </View>
            ) : (
              <View className="items-center">
                <Text className="text-3xl mb-1">📷</Text>
                <Text className="text-xs text-primary-600">Change Photo</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Name Input */}
          <Input
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter pet name"
            error={errors.name}
            autoCapitalize="words"
          />

          {/* Species Selection */}
          <View className="gap-1">
            <Text className="text-sm font-medium text-gray-700">Species</Text>
            <View className="flex-row flex-wrap gap-2">
              {SPECIES_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSpecies(option.value);
                  }}
                  className={clsx(
                    "px-4 py-2 rounded-xl flex-row items-center gap-2",
                    species === option.value ? "bg-primary-500" : "bg-gray-100",
                  )}
                >
                  <Text className="text-lg">{option.emoji}</Text>
                  <Text
                    className={clsx(
                      "font-medium",
                      species === option.value ? "text-white" : "text-gray-700",
                    )}
                  >
                    {SPECIES_NAMES[option.value]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Gender Selection */}
          <View className="gap-1">
            <Text className="text-sm font-medium text-gray-700">Gender</Text>
            <View className="flex-row gap-2">
              {GENDER_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setGender(option.value);
                  }}
                  className={clsx(
                    "flex-1 py-3 rounded-xl items-center",
                    gender === option.value ? "bg-primary-500" : "bg-gray-100",
                  )}
                >
                  <Text
                    className={clsx(
                      "font-medium",
                      gender === option.value ? "text-white" : "text-gray-700",
                    )}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Birthday Input */}
          <Input
            label="Birthday"
            value={birthday}
            onChangeText={setBirthday}
            placeholder="YYYY-MM-DD"
            error={errors.birthday}
            keyboardType="numbers-and-punctuation"
          />

          {/* Submit Button */}
          <Button
            title="Save Changes"
            onPress={handleSubmit}
            loading={isSaving}
            className="mt-4"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
