import { useState, useEffect } from "react";
import { View, Text, ScrollView, Alert, TextInput } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { usePetStore } from "@/src/store/petStore";
import {
  getLatestWeight,
  getTodayRecord,
  upsertDailyRecord,
} from "@/src/db/queries";
import { WeightStepper } from "@/src/components/WeightStepper";
import { ObservationInput } from "@/src/components/ObservationInput";
import { Button } from "@/src/components/ui/Button";
import { SPECIES_DEFAULT_WEIGHTS } from "@/src/types";

export default function RecorderModal() {
  const router = useRouter();
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const { pets, loadPets } = usePetStore();

  const pet = pets.find((p) => p.id === Number(petId));

  const [weight, setWeight] = useState(0);
  const [previousWeight, setPreviousWeight] = useState<number>();
  const [observations, setObservations] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadExistingData = async () => {
      if (!petId) return;

      setIsLoading(true);
      try {
        // Load today's record if exists
        const todayRecord = await getTodayRecord(Number(petId));
        if (todayRecord) {
          if (todayRecord.weight) {
            setWeight(todayRecord.weight);
            setPreviousWeight(todayRecord.weight);
          }
          setObservations(todayRecord.observations);
          setNotes(todayRecord.notes ?? "");
        } else {
          // No today record, get latest weight
          const latest = await getLatestWeight(Number(petId));
          if (latest) {
            setWeight(latest.weight);
            setPreviousWeight(latest.weight);
          } else if (pet) {
            // Use species default if no previous weight
            setWeight(SPECIES_DEFAULT_WEIGHTS[pet.species]);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingData();
  }, [petId, pet]);

  const handleToggleObservation = (obs: string) => {
    setObservations((prev) =>
      prev.includes(obs) ? prev.filter((o) => o !== obs) : [...prev, obs],
    );
  };

  const handleAddObservation = (obs: string) => {
    if (!observations.includes(obs)) {
      setObservations((prev) => [...prev, obs]);
    }
  };

  const handleRemoveObservation = (obs: string) => {
    setObservations((prev) => prev.filter((o) => o !== obs));
  };

  const handleSave = async () => {
    if (!petId) return;

    setIsSaving(true);
    try {
      // Check weight change warning
      if (previousWeight && weight < previousWeight * 0.95) {
        const weightDrop = (
          ((previousWeight - weight) / previousWeight) *
          100
        ).toFixed(1);
        Alert.alert(
          "Weight Warning",
          `Weight has dropped by ${weightDrop}% from last record. This may indicate a health issue.`,
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => setIsSaving(false),
            },
            {
              text: "Save Anyway",
              style: "destructive",
              onPress: async () => {
                await saveRecord();
              },
            },
          ],
        );
        return;
      }

      await saveRecord();
    } catch (error) {
      Alert.alert("Error", "Failed to save record. Please try again.");
      setIsSaving(false);
    }
  };

  const saveRecord = async () => {
    try {
      await upsertDailyRecord(Number(petId), {
        weight,
        observations,
        notes: notes.trim() || undefined,
      });

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

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      keyboardShouldPersistTaps="handled"
    >
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
          <Text className="text-sm text-gray-500">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </Text>
        </View>

        {/* Weight Section */}
        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Weight
          </Text>
          <WeightStepper
            value={weight}
            onChange={setWeight}
            previousWeight={previousWeight}
          />
        </View>

        {/* Observations Section */}
        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            Health Observations
          </Text>
          <Text className="text-sm text-gray-500 mb-4">
            Select symptoms or add custom notes
          </Text>
          <ObservationInput
            selectedObservations={observations}
            onToggle={handleToggleObservation}
            onAdd={handleAddObservation}
            onRemove={handleRemoveObservation}
          />
        </View>

        {/* Additional Notes Section */}
        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            Additional Notes
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional observations or notes..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            className="bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-900 min-h-[80px]"
            textAlignVertical="top"
          />
        </View>

        {/* Save Button */}
        <Button
          title="Save Record"
          onPress={handleSave}
          loading={isSaving}
          size="lg"
        />

        {/* Info text */}
        <Text className="text-xs text-gray-400 text-center">
          Records are saved per day. Multiple entries today will be merged.
        </Text>
      </View>
    </ScrollView>
  );
}
