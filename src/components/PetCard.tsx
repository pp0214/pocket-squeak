import { View, Text, Image } from "react-native";
import { Card } from "./ui/Card";
import { calculateAge } from "../utils/date";
import { SPECIES_NAMES, type PetWithLatestWeight } from "../types";
import { clsx } from "clsx";

interface PetCardProps {
  pet: PetWithLatestWeight;
  onPress: () => void;
}

export function PetCard({ pet, onPress }: PetCardProps) {
  const age = calculateAge(pet.birthday);
  const hasWeightWarning =
    pet.weightChange !== undefined && pet.weightChange < -5;

  return (
    <Card onPress={onPress} className="mb-3">
      <View className="flex-row items-center">
        {/* Avatar */}
        <View className="w-16 h-16 rounded-full bg-primary-100 items-center justify-center mr-4 overflow-hidden">
          {pet.photoUri ? (
            <Image
              source={{ uri: pet.photoUri }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-3xl">
              {pet.species === "rat" && "🐀"}
              {pet.species === "guinea_pig" && "🐹"}
              {pet.species === "hamster" && "🐹"}
              {pet.species === "gerbil" && "🐭"}
              {pet.species === "mouse" && "🐭"}
            </Text>
          )}
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">
            {pet.name}
          </Text>
          <Text className="text-sm text-gray-500">
            {SPECIES_NAMES[pet.species]} · {age}
          </Text>
        </View>

        {/* Weight */}
        <View className="items-end">
          {pet.latestWeight !== undefined ? (
            <>
              <Text className="text-lg font-semibold text-gray-900">
                {pet.latestWeight}g
              </Text>
              {pet.weightChange !== undefined && (
                <Text
                  className={clsx(
                    "text-xs",
                    hasWeightWarning
                      ? "text-red-500 font-semibold"
                      : "text-gray-500",
                  )}
                >
                  {pet.weightChange > 0 ? "+" : ""}
                  {pet.weightChange.toFixed(1)}%
                </Text>
              )}
            </>
          ) : (
            <Text className="text-sm text-gray-400">No weight</Text>
          )}
        </View>
      </View>
    </Card>
  );
}
