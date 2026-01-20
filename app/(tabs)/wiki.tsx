import { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Card } from "@/src/components/ui/Card";
import { usePetStore } from "@/src/store/petStore";
import foodData from "@/src/assets/data/food.json";
import type { FoodItem, FoodSafety, PetSpecies } from "@/src/types";
import { clsx } from "clsx";

const foods: FoodItem[] = foodData as FoodItem[];

const SPECIES_EMOJI: Record<PetSpecies, string> = {
  rat: "🐀",
  guinea_pig: "🐹",
};

export default function WikiScreen() {
  const { t } = useTranslation();
  const { pets, loadPets } = usePetStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState<PetSpecies | null>(
    null,
  );

  useEffect(() => {
    loadPets();
  }, [loadPets]);

  // Get unique species from user's pets
  const userSpecies = useMemo(() => {
    const speciesSet = new Set<PetSpecies>();
    pets.forEach((pet) => speciesSet.add(pet.species));
    return Array.from(speciesSet);
  }, [pets]);

  // Auto-select first pet's species if available and none selected
  useEffect(() => {
    if (userSpecies.length > 0 && selectedSpecies === null) {
      setSelectedSpecies(userSpecies[0]);
    }
  }, [userSpecies, selectedSpecies]);

  // Get safety level for a food based on selected species
  const getSafetyForSpecies = (food: FoodItem, species: PetSpecies | null) => {
    if (!species) return food.defaultSafety;
    return food.speciesSafety[species] ?? food.defaultSafety;
  };

  // Filter and sort foods
  const filteredFoods = useMemo(() => {
    let result = [...foods];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((food) => {
        const name = t(`foods.${food.id}`, { defaultValue: food.id });
        const category = t(`food.categories.${food.category}`, {
          defaultValue: food.category,
        });
        return (
          name.toLowerCase().includes(query) ||
          category.toLowerCase().includes(query)
        );
      });
    }

    // If a species is selected, prioritize foods recommended for that species
    if (selectedSpecies) {
      result.sort((a, b) => {
        const aRecommended = a.recommendedFor.includes(selectedSpecies);
        const bRecommended = b.recommendedFor.includes(selectedSpecies);
        if (aRecommended && !bRecommended) return -1;
        if (!aRecommended && bRecommended) return 1;
        return 0;
      });
    }

    return result;
  }, [searchQuery, selectedSpecies, t]);

  const getSafetyColor = (safety: FoodSafety) => {
    switch (safety) {
      case "safe":
        return "bg-green-100 border-green-500";
      case "caution":
        return "bg-yellow-100 border-yellow-500";
      case "danger":
        return "bg-red-100 border-red-500";
    }
  };

  const getSafetyTextColor = (safety: FoodSafety) => {
    switch (safety) {
      case "safe":
        return "text-green-700";
      case "caution":
        return "text-yellow-700";
      case "danger":
        return "text-red-700";
    }
  };

  const getSafetyEmoji = (safety: FoodSafety) => {
    switch (safety) {
      case "safe":
        return "✅";
      case "caution":
        return "⚠️";
      case "danger":
        return "❌";
    }
  };

  const renderFoodItem = ({ item }: { item: FoodItem }) => {
    const safety = getSafetyForSpecies(item, selectedSpecies);
    const isRecommended =
      selectedSpecies && item.recommendedFor.includes(selectedSpecies);
    const foodName = t(`foods.${item.id}`, { defaultValue: item.id });
    const categoryName = t(`food.categories.${item.category}`, {
      defaultValue: item.category,
    });
    const notes = t(`foodNotes.${item.id}`, { defaultValue: "" });

    return (
      <Card className={clsx("mb-3 border-l-4", getSafetyColor(safety))}>
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-lg font-semibold text-gray-900">
                {foodName}
              </Text>
              <Text>{getSafetyEmoji(safety)}</Text>
              {isRecommended && (
                <View className="bg-primary-100 rounded-full px-2 py-0.5">
                  <Text className="text-xs text-primary-600">⭐</Text>
                </View>
              )}
            </View>
            <Text className="text-sm text-gray-500 mb-2">{categoryName}</Text>
            {notes && <Text className="text-sm text-gray-600">{notes}</Text>}
          </View>
          <View
            className={clsx(
              "px-2 py-1 rounded-full",
              safety === "safe" && "bg-green-200",
              safety === "caution" && "bg-yellow-200",
              safety === "danger" && "bg-red-200",
            )}
          >
            <Text
              className={clsx(
                "text-xs font-medium",
                getSafetyTextColor(safety),
              )}
            >
              {t(`food.${safety}`)}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Search Bar */}
      <View className="p-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-2">
          <Text className="text-gray-400 mr-2">🔍</Text>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t("food.searchPlaceholder")}
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-base text-gray-900"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Species Filter */}
      {userSpecies.length > 0 && (
        <View className="bg-white border-b border-gray-200">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
          >
            <TouchableOpacity
              onPress={() => setSelectedSpecies(null)}
              className={clsx(
                "px-4 py-2 rounded-full mr-2",
                selectedSpecies === null ? "bg-primary-500" : "bg-gray-100",
              )}
            >
              <Text
                className={clsx(
                  "font-medium",
                  selectedSpecies === null ? "text-white" : "text-gray-600",
                )}
              >
                {t("common.all")}
              </Text>
            </TouchableOpacity>
            {userSpecies.map((species) => (
              <TouchableOpacity
                key={species}
                onPress={() => setSelectedSpecies(species)}
                className={clsx(
                  "px-4 py-2 rounded-full mr-2 flex-row items-center",
                  selectedSpecies === species
                    ? "bg-primary-500"
                    : "bg-gray-100",
                )}
              >
                <Text className="mr-1">{SPECIES_EMOJI[species]}</Text>
                <Text
                  className={clsx(
                    "font-medium",
                    selectedSpecies === species
                      ? "text-white"
                      : "text-gray-600",
                  )}
                >
                  {t(`species.${species}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Legend */}
      <View className="flex-row justify-center gap-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-row items-center gap-1">
          <Text>✅</Text>
          <Text className="text-xs text-gray-600">{t("food.safe")}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Text>⚠️</Text>
          <Text className="text-xs text-gray-600">{t("food.caution")}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Text>❌</Text>
          <Text className="text-xs text-gray-600">{t("food.danger")}</Text>
        </View>
        {selectedSpecies && (
          <View className="flex-row items-center gap-1">
            <Text>⭐</Text>
            <Text className="text-xs text-gray-600">
              {t("food.speciesNote", {
                species: t(`species.${selectedSpecies}`),
              })}
            </Text>
          </View>
        )}
      </View>

      {/* Food List */}
      <FlatList
        data={filteredFoods}
        keyExtractor={(item) => item.id}
        renderItem={renderFoodItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-gray-500">{t("food.noResults")}</Text>
          </View>
        }
      />
    </View>
  );
}
