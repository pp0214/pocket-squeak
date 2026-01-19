import { useRef } from "react";
import { View, Text, Image, Alert, TouchableOpacity } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Card } from "./ui/Card";
import { calculateAge } from "../utils/date";
import { SPECIES_NAMES, type PetWithLatestWeight } from "../types";
import { clsx } from "clsx";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface PetCardProps {
  pet: PetWithLatestWeight;
  onPress: () => void;
  onDelete?: (petId: number) => void;
}

const SPECIES_EMOJI: Record<string, string> = {
  rat: "🐀",
  guinea_pig: "🐹",
  hamster: "🐹",
  gerbil: "🐭",
  mouse: "🐭",
};

const SPECIES_COLORS: Record<string, { bg: string; border: string }> = {
  rat: { bg: "bg-orange-100", border: "border-orange-200" },
  guinea_pig: { bg: "bg-amber-100", border: "border-amber-200" },
  hamster: { bg: "bg-yellow-100", border: "border-yellow-200" },
  gerbil: { bg: "bg-lime-100", border: "border-lime-200" },
  mouse: { bg: "bg-cyan-100", border: "border-cyan-200" },
};

export function PetCard({ pet, onPress, onDelete }: PetCardProps) {
  const swipeableRef = useRef<Swipeable>(null);
  const age = calculateAge(pet.birthday);
  const hasWeightWarning =
    pet.weightChange !== undefined && pet.weightChange < -5;
  const hasWeightGain = pet.weightChange !== undefined && pet.weightChange > 5;
  const colors = SPECIES_COLORS[pet.species] || SPECIES_COLORS.rat;

  const handleDelete = () => {
    swipeableRef.current?.close();
    Alert.alert(
      "Delete Pet",
      `Are you sure you want to delete ${pet.name}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete?.(pet.id),
        },
      ]
    );
  };

  const handleLongPress = () => {
    Alert.alert(pet.name, "What would you like to do?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: handleDelete,
      },
    ]);
  };

  const renderRightActions = () => {
    if (!onDelete) return null;
    return (
      <TouchableOpacity
        onPress={handleDelete}
        className="bg-red-500 justify-center items-center px-6 rounded-r-2xl mb-4"
      >
        <FontAwesome name="trash" size={24} color="#fff" />
        <Text className="text-white text-xs mt-1">Delete</Text>
      </TouchableOpacity>
    );
  };

  const cardContent = (
    <Card
      onPress={onPress}
      onLongPress={onDelete ? handleLongPress : undefined}
      className="mb-4 border border-gray-100"
    >
      <View className="flex-row items-center">
        {/* Avatar with species-specific color */}
        <View
          className={clsx(
            "w-16 h-16 rounded-2xl items-center justify-center mr-4 overflow-hidden border-2",
            colors.bg,
            colors.border,
          )}
        >
          {pet.photoUri ? (
            <Image
              source={{ uri: pet.photoUri }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-3xl">
              {SPECIES_EMOJI[pet.species] || "🐾"}
            </Text>
          )}
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900">{pet.name}</Text>
          <View className="flex-row items-center mt-1">
            <View className="bg-gray-100 rounded-full px-2 py-0.5 mr-2">
              <Text className="text-xs text-gray-600">
                {SPECIES_NAMES[pet.species]}
              </Text>
            </View>
            <Text className="text-xs text-gray-400">{age}</Text>
          </View>
        </View>

        {/* Weight with trend indicator */}
        <View className="items-end">
          {pet.latestWeight !== undefined ? (
            <View className="items-end">
              <View className="flex-row items-center">
                <Text className="text-xl font-bold text-gray-900">
                  {pet.latestWeight}
                </Text>
                <Text className="text-sm text-gray-500 ml-0.5">g</Text>
              </View>
              {pet.weightChange !== undefined && (
                <View
                  className={clsx(
                    "flex-row items-center mt-1 px-2 py-0.5 rounded-full",
                    hasWeightWarning && "bg-red-100",
                    hasWeightGain && "bg-green-100",
                    !hasWeightWarning && !hasWeightGain && "bg-gray-100",
                  )}
                >
                  <FontAwesome
                    name={
                      pet.weightChange > 0
                        ? "arrow-up"
                        : pet.weightChange < 0
                          ? "arrow-down"
                          : "minus"
                    }
                    size={8}
                    color={
                      hasWeightWarning
                        ? "#ef4444"
                        : hasWeightGain
                          ? "#22c55e"
                          : "#6b7280"
                    }
                  />
                  <Text
                    className={clsx(
                      "text-xs font-semibold ml-1",
                      hasWeightWarning && "text-red-600",
                      hasWeightGain && "text-green-600",
                      !hasWeightWarning && !hasWeightGain && "text-gray-500",
                    )}
                  >
                    {Math.abs(pet.weightChange).toFixed(1)}%
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View className="bg-gray-100 rounded-full px-3 py-1">
              <Text className="text-xs text-gray-400">No data</Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );

  if (!onDelete) {
    return cardContent;
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
    >
      {cardContent}
    </Swipeable>
  );
}
