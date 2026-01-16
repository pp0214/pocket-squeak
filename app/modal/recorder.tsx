import { useState, useEffect } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { usePetStore } from "@/src/store/petStore";
import { getLatestWeight } from "@/src/db/queries";
import { WeightStepper } from "@/src/components/WeightStepper";
import { HealthTagGrid } from "@/src/components/HealthTagGrid";
import { Button } from "@/src/components/ui/Button";
import { SPECIES_DEFAULT_WEIGHTS, type HealthTag } from "@/src/types";

export default function RecorderModal() {
  const router = useRouter();
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const { pets, recordWeight, recordHealth, loadPets } = usePetStore();

  const pet = pets.find((p) => p.id === Number(petId));

  const [weight, setWeight] = useState(0);
  const [previousWeight, setPreviousWeight] = useState<number>();
  const [healthTags, setHealthTags] = useState<HealthTag[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadPreviousWeight = async () => {
      if (!petId) return;

      const latest = await getLatestWeight(Number(petId));
      if (latest) {
        setWeight(latest.weight);
        setPreviousWeight(latest.weight);
      } else if (pet) {
        // Use species default if no previous weight
        setWeight(SPECIES_DEFAULT_WEIGHTS[pet.species]);
      }
    };

    loadPreviousWeight();
  }, [petId, pet]);

  const handleToggleTag = (tag: HealthTag) => {
    setHealthTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSave = async () => {
    if (!petId) return;

    setIsSaving(true);
    try {
      // Record weight
      await recordWeight(Number(petId), weight);

      // Record health tags if any selected
      if (healthTags.length > 0) {
        await recordHealth(Number(petId), healthTags);
      }

      // Success feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Refresh pet list and go back
      await loadPets();
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to save record. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!pet) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Pet not found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4 gap-6">
        {/* Pet Info */}
        <View className="items-center">
          <View className="w-16 h-16 rounded-full bg-primary-100 items-center justify-center mb-2">
            <Text className="text-3xl">
              {pet.species === "rat" && "🐀"}
              {pet.species === "guinea_pig" && "🐹"}
              {pet.species === "hamster" && "🐹"}
              {pet.species === "gerbil" && "🐭"}
              {pet.species === "mouse" && "🐭"}
            </Text>
          </View>
          <Text className="text-xl font-semibold text-gray-900">
            {pet.name}
          </Text>
        </View>

        {/* Weight Section */}
        <View className="bg-white rounded-2xl p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Weight
          </Text>
          <WeightStepper
            value={weight}
            onChange={setWeight}
            previousWeight={previousWeight}
          />
        </View>

        {/* Health Tags Section */}
        <View className="bg-white rounded-2xl p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            Health Observations
          </Text>
          <Text className="text-sm text-gray-500 mb-4">
            Select any symptoms observed today (optional)
          </Text>
          <HealthTagGrid selectedTags={healthTags} onToggle={handleToggleTag} />
        </View>

        {/* Save Button */}
        <Button
          title="Save Record"
          onPress={handleSave}
          loading={isSaving}
          size="lg"
        />
      </View>
    </ScrollView>
  );
}
