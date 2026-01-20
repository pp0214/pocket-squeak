import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { useTranslation } from "react-i18next";
import { clsx } from "clsx";
import * as Haptics from "expo-haptics";
import { HEALTH_THRESHOLDS } from "../config/constants";

interface WeightStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  previousWeight?: number;
}

export function WeightStepper({
  value,
  onChange,
  min = 1,
  max = 9999,
  previousWeight,
}: WeightStepperProps) {
  const { t } = useTranslation();

  const handleStep = (step: number) => {
    const newValue = Math.max(min, Math.min(max, value + step));
    if (newValue !== value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(newValue);
    }
  };

  const handleTextChange = (text: string) => {
    const num = parseInt(text, 10);
    if (!isNaN(num) && num >= min && num <= max) {
      onChange(num);
    } else if (text === "") {
      onChange(min);
    }
  };

  // Calculate weight change percentage
  const weightChangePercent =
    previousWeight && previousWeight > 0
      ? ((value - previousWeight) / previousWeight) * 100
      : undefined;

  const hasWarning =
    weightChangePercent !== undefined &&
    weightChangePercent < HEALTH_THRESHOLDS.WEIGHT_LOSS_WARNING;

  return (
    <View className="items-center">
      {/* Stepper Controls */}
      <View className="flex-row items-center gap-2">
        <StepButton label="-10" onPress={() => handleStep(-10)} />
        <StepButton label="-1" onPress={() => handleStep(-1)} />

        {/* Weight Display */}
        <View className="bg-gray-100 rounded-xl px-4 py-3 min-w-[100px] items-center">
          <TextInput
            value={value.toString()}
            onChangeText={handleTextChange}
            keyboardType="numeric"
            className="text-2xl font-bold text-gray-900 text-center"
            selectTextOnFocus
          />
          <Text className="text-sm text-gray-500">{t("record.grams")}</Text>
        </View>

        <StepButton label="+1" onPress={() => handleStep(1)} />
        <StepButton label="+10" onPress={() => handleStep(10)} />
      </View>

      {/* Weight Change Warning */}
      {weightChangePercent !== undefined && (
        <View className="mt-3">
          <Text
            className={clsx(
              "text-sm font-medium",
              hasWarning ? "text-red-500" : "text-gray-500",
            )}
          >
            {weightChangePercent > 0 ? "+" : ""}
            {weightChangePercent.toFixed(1)}% {t("record.fromLastRecord")}
            {hasWarning && ` ⚠️ ${t("record.significantWeightLoss")}`}
          </Text>
        </View>
      )}
    </View>
  );
}

interface StepButtonProps {
  label: string;
  onPress: () => void;
}

function StepButton({ label, onPress }: StepButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-primary-100 rounded-xl px-4 py-3 active:bg-primary-200"
      activeOpacity={0.8}
    >
      <Text className="text-lg font-semibold text-primary-600">{label}</Text>
    </TouchableOpacity>
  );
}
