import { useState, useMemo } from "react";
import { View, Text, FlatList, TextInput } from "react-native";
import { Card } from "@/src/components/ui/Card";
import foodData from "@/src/assets/data/food.json";
import type { FoodItem, FoodSafety } from "@/src/types";
import { clsx } from "clsx";

const foods: FoodItem[] = foodData as FoodItem[];

export default function WikiScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFoods = useMemo(() => {
    if (!searchQuery.trim()) {
      return foods;
    }
    const query = searchQuery.toLowerCase();
    return foods.filter(
      (food) =>
        food.name.toLowerCase().includes(query) ||
        food.category.toLowerCase().includes(query),
    );
  }, [searchQuery]);

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

  const getSafetyLabel = (safety: FoodSafety) => {
    switch (safety) {
      case "safe":
        return "Safe";
      case "caution":
        return "Caution";
      case "danger":
        return "Danger";
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

  const renderFoodItem = ({ item }: { item: FoodItem }) => (
    <Card className={clsx("mb-3 border-l-4", getSafetyColor(item.safety))}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-lg font-semibold text-gray-900">
              {item.name}
            </Text>
            <Text>{getSafetyEmoji(item.safety)}</Text>
          </View>
          <Text className="text-sm text-gray-500 mb-2">{item.category}</Text>
          {item.notes && (
            <Text className="text-sm text-gray-600">{item.notes}</Text>
          )}
        </View>
        <View
          className={clsx(
            "px-2 py-1 rounded-full",
            item.safety === "safe" && "bg-green-200",
            item.safety === "caution" && "bg-yellow-200",
            item.safety === "danger" && "bg-red-200",
          )}
        >
          <Text
            className={clsx(
              "text-xs font-medium",
              getSafetyTextColor(item.safety),
            )}
          >
            {getSafetyLabel(item.safety)}
          </Text>
        </View>
      </View>
    </Card>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Search Bar */}
      <View className="p-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-2">
          <Text className="text-gray-400 mr-2">🔍</Text>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search foods..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-base text-gray-900"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Legend */}
      <View className="flex-row justify-center gap-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-row items-center gap-1">
          <Text>✅</Text>
          <Text className="text-xs text-gray-600">Safe</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Text>⚠️</Text>
          <Text className="text-xs text-gray-600">Caution</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Text>❌</Text>
          <Text className="text-xs text-gray-600">Danger</Text>
        </View>
      </View>

      {/* Food List */}
      <FlatList
        data={filteredFoods}
        keyExtractor={(item) => item.id}
        renderItem={renderFoodItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-gray-500">No foods found</Text>
          </View>
        }
      />
    </View>
  );
}
