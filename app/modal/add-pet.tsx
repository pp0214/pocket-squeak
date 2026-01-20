import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { usePetStore } from "@/src/store/petStore";
import { saveImageToStorage } from "@/src/utils/imageStorage";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/contexts/ToastContext";
import {
  type PetSpecies,
  type Gender,
  SPECIES_DEFAULT_WEIGHTS,
} from "@/src/types";
import { clsx } from "clsx";

const SPECIES_OPTIONS: { value: PetSpecies; emoji: string }[] = [
  { value: "rat", emoji: "🐀" },
  { value: "guinea_pig", emoji: "🐹" },
];

const GENDER_OPTIONS: Gender[] = ["male", "female", "unknown"];

export default function AddPetModal() {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const { addPet, recordWeight, isLoading } = usePetStore();

  const [name, setName] = useState("");
  const [species, setSpecies] = useState<PetSpecies>("rat");
  const [gender, setGender] = useState<Gender>("unknown");
  const [birthday, setBirthday] = useState("");
  const [photoUri, setPhotoUri] = useState<string>();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = t("validation.nameRequired");
    }

    if (!birthday.trim()) {
      newErrors.birthday = t("validation.birthdayRequired");
    } else {
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(birthday)) {
        newErrors.birthday = t("validation.invalidDateFormat");
      } else {
        const date = new Date(birthday);
        if (isNaN(date.getTime())) {
          newErrors.birthday = t("validation.invalidDate");
        } else if (date > new Date()) {
          newErrors.birthday = t("validation.futureBirthday");
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
    if (!validateForm()) return;

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Save photo to persistent storage if provided
      let persistentPhotoUri: string | undefined;
      if (photoUri) {
        persistentPhotoUri = await saveImageToStorage(photoUri, "new");
      }

      const pet = await addPet({
        name: name.trim(),
        species,
        gender,
        birthday,
        photoUri: persistentPhotoUri,
      });

      // Update photo path with actual pet ID if we saved one
      if (persistentPhotoUri && photoUri) {
        const finalPhotoUri = await saveImageToStorage(photoUri, pet.id);
        if (finalPhotoUri && finalPhotoUri !== persistentPhotoUri) {
          // Update pet record with final photo URI
          const { updatePet } = await import("@/src/db/queries");
          await updatePet(pet.id, { photoUri: finalPhotoUri });
        }
      }

      // Add initial weight based on species default
      const defaultWeight = SPECIES_DEFAULT_WEIGHTS[species];
      await recordWeight(pet.id, defaultWeight);

      router.back();
    } catch (error) {
      toast.error(t("errors.failedToAddPet"));
    }
  };

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
                <Text className="text-xs text-primary-600">
                  {t("pet.addPhoto")}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Name Input */}
          <Input
            label={t("pet.name")}
            value={name}
            onChangeText={setName}
            placeholder={t("pet.enterName")}
            error={errors.name}
            autoCapitalize="words"
          />

          {/* Species Selection */}
          <View className="gap-1">
            <Text className="text-sm font-medium text-gray-700">
              {t("pet.species")}
            </Text>
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
                    {t(`species.${option.value}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Gender Selection */}
          <View className="gap-1">
            <Text className="text-sm font-medium text-gray-700">
              {t("pet.gender")}
            </Text>
            <View className="flex-row gap-2">
              {GENDER_OPTIONS.map((genderOption) => (
                <TouchableOpacity
                  key={genderOption}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setGender(genderOption);
                  }}
                  className={clsx(
                    "flex-1 py-3 rounded-xl items-center",
                    gender === genderOption ? "bg-primary-500" : "bg-gray-100",
                  )}
                >
                  <Text
                    className={clsx(
                      "font-medium",
                      gender === genderOption ? "text-white" : "text-gray-700",
                    )}
                  >
                    {t(`pet.${genderOption}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Birthday Input */}
          <Input
            label={t("pet.birthday")}
            value={birthday}
            onChangeText={setBirthday}
            placeholder={t("pet.birthdayFormat")}
            error={errors.birthday}
            keyboardType="numbers-and-punctuation"
          />

          {/* Default Weight Info */}
          <View className="bg-primary-50 p-4 rounded-xl">
            <Text className="text-sm text-primary-800">
              {t("pet.initialWeight", {
                weight: SPECIES_DEFAULT_WEIGHTS[species],
                species: t(`species.${species}`).toLowerCase(),
              })}
            </Text>
          </View>

          {/* Submit Button */}
          <Button
            title={t("pet.addPetButton")}
            onPress={handleSubmit}
            loading={isLoading}
            className="mt-4"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
