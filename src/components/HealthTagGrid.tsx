import { View, Text, TouchableOpacity } from "react-native";
import { clsx } from "clsx";
import * as Haptics from "expo-haptics";
import { HEALTH_TAG_INFO, type HealthTag } from "../types";

interface HealthTagGridProps {
  selectedTags: HealthTag[];
  onToggle: (tag: HealthTag) => void;
}

export function HealthTagGrid({ selectedTags, onToggle }: HealthTagGridProps) {
  const tags: HealthTag[] = ["sneeze", "porphyrin", "soft_stool", "lethargic"];

  const handleToggle = (tag: HealthTag) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(tag);
  };

  return (
    <View className="flex-row flex-wrap gap-3">
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag);
        const info = HEALTH_TAG_INFO[tag];

        return (
          <TouchableOpacity
            key={tag}
            onPress={() => handleToggle(tag)}
            className={clsx(
              "rounded-xl px-4 py-3 flex-row items-center gap-2",
              isSelected
                ? "bg-primary-500 active:bg-primary-600"
                : "bg-gray-100 active:bg-gray-200",
            )}
            activeOpacity={0.8}
          >
            <Text className="text-lg">{info.emoji}</Text>
            <Text
              className={clsx(
                "font-medium",
                isSelected ? "text-white" : "text-gray-700",
              )}
            >
              {info.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
