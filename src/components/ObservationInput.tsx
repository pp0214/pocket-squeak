import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { clsx } from "clsx";
import * as Haptics from "expo-haptics";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { OBSERVATION_PRESETS, type PresetObservation } from "../types";

interface ObservationInputProps {
  selectedObservations: string[];
  onToggle: (observation: string) => void;
  onAdd: (observation: string) => void;
  onRemove: (observation: string) => void;
}

const PRESET_TAGS: PresetObservation[] = [
  "normal",
  "sneeze",
  "porphyrin",
  "soft_stool",
  "lethargic",
  "loss_of_appetite",
];

// Map observation key to i18n key
const OBSERVATION_I18N_MAP: Record<PresetObservation, string> = {
  normal: "normal",
  sneeze: "sneeze",
  porphyrin: "porphyrin",
  soft_stool: "softStool",
  lethargic: "lethargic",
  loss_of_appetite: "lossOfAppetite",
};

export function ObservationInput({
  selectedObservations,
  onToggle,
  onAdd,
  onRemove,
}: ObservationInputProps) {
  const { t } = useTranslation();
  const [customInput, setCustomInput] = useState("");
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  const handleTogglePreset = (tag: PresetObservation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(tag);
  };

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed && !selectedObservations.includes(trimmed)) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onAdd(trimmed);
      setCustomInput("");
      setIsAddingCustom(false);
    }
  };

  const handleRemoveCustom = (obs: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRemove(obs);
  };

  // Get custom observations (non-preset ones)
  const customObservations = selectedObservations.filter(
    (obs) => !PRESET_TAGS.includes(obs as PresetObservation),
  );

  const getObservationLabel = (tag: PresetObservation): string => {
    const i18nKey = OBSERVATION_I18N_MAP[tag];
    return t(`observations.${i18nKey}`);
  };

  return (
    <View className="gap-4">
      {/* Preset Tags */}
      <View>
        <View className="flex-row flex-wrap gap-2">
          {PRESET_TAGS.map((tag) => {
            const isSelected = selectedObservations.includes(tag);
            const info = OBSERVATION_PRESETS[tag];
            const colorClasses = {
              green: isSelected
                ? "bg-green-500"
                : "bg-green-50 border-green-200",
              yellow: isSelected
                ? "bg-yellow-500"
                : "bg-yellow-50 border-yellow-200",
              red: isSelected ? "bg-red-500" : "bg-red-50 border-red-200",
            };

            return (
              <TouchableOpacity
                key={tag}
                onPress={() => handleTogglePreset(tag)}
                className={clsx(
                  "rounded-xl px-3 py-2 flex-row items-center gap-1.5 border",
                  colorClasses[info.color as keyof typeof colorClasses],
                  isSelected && "border-transparent",
                )}
                activeOpacity={0.8}
              >
                <Text className="text-base">{info.emoji}</Text>
                <Text
                  className={clsx(
                    "font-medium text-sm",
                    isSelected ? "text-white" : "text-gray-700",
                  )}
                >
                  {getObservationLabel(tag)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Custom Observations */}
      <View>
        {/* Display custom observations as removable chips */}
        {customObservations.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3"
          >
            <View className="flex-row gap-2">
              {customObservations.map((obs) => (
                <View
                  key={obs}
                  className="flex-row items-center bg-primary-100 rounded-full px-3 py-1.5 gap-2"
                >
                  <Text className="text-sm text-primary-700">{obs}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveCustom(obs)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <FontAwesome name="times" size={12} color="#b84609" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        {/* Add custom input */}
        {isAddingCustom ? (
          <View className="flex-row items-center gap-2">
            <TextInput
              value={customInput}
              onChangeText={setCustomInput}
              placeholder={t("record.notes")}
              placeholderTextColor="#9CA3AF"
              className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-900"
              autoFocus
              onSubmitEditing={handleAddCustom}
              returnKeyType="done"
            />
            <TouchableOpacity
              onPress={handleAddCustom}
              className="bg-primary-500 rounded-xl px-4 py-3"
              disabled={!customInput.trim()}
            >
              <Text className="text-white font-semibold">
                {t("common.add")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setIsAddingCustom(false);
                setCustomInput("");
              }}
              className="px-2 py-3"
            >
              <FontAwesome name="times" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setIsAddingCustom(true)}
            className="flex-row items-center gap-2 bg-gray-100 rounded-xl px-4 py-3"
          >
            <FontAwesome name="plus" size={14} color="#6B7280" />
            <Text className="text-gray-500">{t("record.notes")}...</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
