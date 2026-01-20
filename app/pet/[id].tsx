import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Alert,
  Pressable,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { LineChart } from "react-native-chart-kit";
import Animated, { FadeInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  getPetById,
  getTodayRecord,
  getDailyRecords,
  upsertDailyRecord,
  getLatestWeight,
  seedMockHistory,
} from "@/src/db/queries";
import { usePetStore } from "@/src/store/petStore";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { ObservationInput } from "@/src/components/ObservationInput";
import { WeightStepper } from "@/src/components/WeightStepper";
import { useToast } from "@/src/contexts/ToastContext";
import { calculateAge, formatDate } from "@/src/utils/date";
import {
  SPECIES_DEFAULT_WEIGHTS,
  OBSERVATION_PRESETS,
  type Pet,
  type DailyRecord,
  type PresetObservation,
} from "@/src/types";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { clsx } from "clsx";

const screenWidth = Dimensions.get("window").width;

type TimeRange = "week" | "month";

// Simple toggle component using StyleSheet to avoid NativeWind/Navigation context issues
function TimeRangeToggle({
  value,
  onChange,
  labels,
}: {
  value: TimeRange;
  onChange: (v: TimeRange) => void;
  labels: { week: string; month: string };
}) {
  return (
    <View style={toggleStyles.container}>
      <Pressable onPress={() => onChange("week")} style={toggleStyles.button}>
        <View
          style={[
            toggleStyles.buttonInner,
            value === "week" && toggleStyles.buttonActive,
          ]}
        >
          <Text
            style={[
              toggleStyles.text,
              value === "week" && toggleStyles.textActive,
            ]}
          >
            {labels.week}
          </Text>
        </View>
      </Pressable>
      <Pressable onPress={() => onChange("month")} style={toggleStyles.button}>
        <View
          style={[
            toggleStyles.buttonInner,
            value === "month" && toggleStyles.buttonActive,
          ]}
        >
          <Text
            style={[
              toggleStyles.text,
              value === "month" && toggleStyles.textActive,
            ]}
          >
            {labels.month}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const toggleStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 2,
  },
  button: {},
  buttonInner: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  buttonActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  textActive: {
    color: "#ed7a11",
  },
});

const SPECIES_EMOJI: Record<string, string> = {
  rat: "🐀",
  guinea_pig: "🐹",
  hamster: "🐹",
  gerbil: "🐭",
  mouse: "🐭",
};

function ObservationChip({
  observation,
  t,
}: {
  observation: string;
  t: (key: string) => string;
}) {
  const preset = OBSERVATION_PRESETS[observation as PresetObservation];
  if (preset) {
    const colorClasses = {
      green: "bg-green-100 text-green-700",
      yellow: "bg-yellow-100 text-yellow-700",
      red: "bg-red-100 text-red-700",
    };

    // Map observation key to i18n key
    const observationKeyMap: Record<PresetObservation, string> = {
      normal: "normal",
      sneeze: "sneeze",
      porphyrin: "porphyrin",
      soft_stool: "softStool",
      lethargic: "lethargic",
      loss_of_appetite: "lossOfAppetite",
    };

    const i18nKey = observationKeyMap[observation as PresetObservation];
    const label = i18nKey ? t(`observations.${i18nKey}`) : preset.label;

    return (
      <View
        className={clsx(
          "rounded-full px-2 py-0.5 flex-row items-center gap-1",
          colorClasses[preset.color as keyof typeof colorClasses],
        )}
      >
        <Text className="text-xs">{preset.emoji}</Text>
        <Text className="text-xs font-medium">{label}</Text>
      </View>
    );
  }
  return (
    <View className="bg-gray-100 rounded-full px-2 py-0.5">
      <Text className="text-xs text-gray-600">{observation}</Text>
    </View>
  );
}

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const { deletePet, loadPets } = usePetStore();

  const [pet, setPet] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Today's record state (editable)
  const [todayWeight, setTodayWeight] = useState(0);
  const [previousWeight, setPreviousWeight] = useState<number>();
  const [todayObservations, setTodayObservations] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // History state
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [history, setHistory] = useState<DailyRecord[]>([]);

  const formatRecordDate = useCallback(
    (dateStr: string): string => {
      const date = new Date(dateStr + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.getTime() === today.getTime()) return t("record.today");
      if (date.getTime() === yesterday.getTime()) return t("record.yesterday");

      const locale = i18n.language === "zh" ? "zh-CN" : "en-US";
      return date.toLocaleDateString(locale, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    },
    [t, i18n.language],
  );

  const getSpeciesName = useCallback(
    (species: string): string => {
      const speciesKey = species === "guinea_pig" ? "guineaPig" : species;
      return t(`species.${speciesKey}`);
    },
    [t],
  );

  const getGenderName = useCallback(
    (gender: string): string => {
      return t(`pet.${gender}`);
    },
    [t],
  );

  const loadData = useCallback(async () => {
    if (!id) return;

    try {
      const [petData, todayRecord, latestWeight] = await Promise.all([
        getPetById(Number(id)),
        getTodayRecord(Number(id)),
        getLatestWeight(Number(id)),
      ]);

      setPet(petData);

      // Set today's data
      if (todayRecord) {
        setTodayWeight(todayRecord.weight ?? latestWeight?.weight ?? 0);
        setTodayObservations(todayRecord.observations);
      } else if (latestWeight) {
        setTodayWeight(latestWeight.weight);
        setTodayObservations([]);
      } else if (petData) {
        setTodayWeight(SPECIES_DEFAULT_WEIGHTS[petData.species]);
        setTodayObservations([]);
      }

      setPreviousWeight(latestWeight?.weight);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Failed to load pet data:", error);
    }
  }, [id]);

  const loadHistory = useCallback(async () => {
    if (!id) return;
    const days = timeRange === "week" ? 7 : 30;
    const records = await getDailyRecords(Number(id), days);
    // Filter out today's record from history
    const today = new Date().toISOString().split("T")[0];
    setHistory(records.filter((r) => r.recordDate !== today));
  }, [id, timeRange]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadData();
      await loadHistory();
      setIsLoading(false);
    };
    init();
  }, [loadData, loadHistory]);

  useEffect(() => {
    loadHistory();
  }, [timeRange, loadHistory]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    await loadHistory();
    setIsRefreshing(false);
  };

  const handleToggleObservation = (obs: string) => {
    setTodayObservations((prev) =>
      prev.includes(obs) ? prev.filter((o) => o !== obs) : [...prev, obs],
    );
    setHasUnsavedChanges(true);
  };

  const handleAddObservation = (obs: string) => {
    if (!todayObservations.includes(obs)) {
      setTodayObservations((prev) => [...prev, obs]);
      setHasUnsavedChanges(true);
    }
  };

  const handleRemoveObservation = (obs: string) => {
    setTodayObservations((prev) => prev.filter((o) => o !== obs));
    setHasUnsavedChanges(true);
  };

  const handleWeightChange = (newWeight: number) => {
    setTodayWeight(newWeight);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!id) return;

    setIsSaving(true);
    try {
      await upsertDailyRecord(Number(id), {
        weight: todayWeight,
        observations: todayObservations,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setHasUnsavedChanges(false);
      await loadPets(); // Refresh home list
      await loadHistory();
    } catch (error) {
      toast.error(t("errors.failedToSave"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t("pet.deletePet"),
      t("pet.deleteConfirm", { name: pet?.name }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            if (id) {
              await deletePet(Number(id));
              router.back();
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#ed7a11" />
      </View>
    );
  }

  if (!pet) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">{t("pet.notFound")}</Text>
      </View>
    );
  }

  // Chart data from history
  const chartRecords = history
    .filter((r) => r.weight)
    .slice(0, 7)
    .reverse();
  const chartData =
    chartRecords.length > 1
      ? {
          labels: chartRecords.map((r) => {
            const date = new Date(r.recordDate);
            return `${date.getMonth() + 1}/${date.getDate()}`;
          }),
          datasets: [
            { data: chartRecords.map((r) => r.weight!), strokeWidth: 2 },
          ],
        }
      : null;

  const handleEdit = () => {
    router.push(`/modal/edit-pet?petId=${id}`);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: pet.name,
          headerRight: () => (
            <TouchableOpacity onPress={handleEdit} className="p-2">
              <FontAwesome name="pencil" size={20} color="#ed7a11" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        className="flex-1 bg-gray-50"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#ed7a11"
          />
        }
      >
        <View className="p-4 gap-4">
          {/* Pet Info Card */}
          <Card>
            <View className="items-center">
              <View className="w-20 h-20 rounded-full bg-primary-100 items-center justify-center mb-3">
                <Text className="text-4xl">{SPECIES_EMOJI[pet.species]}</Text>
              </View>
              <Text className="text-2xl font-bold text-gray-900">
                {pet.name}
              </Text>
              <Text className="text-gray-500">
                {getSpeciesName(pet.species)} · {getGenderName(pet.gender)}
              </Text>
              <View className="flex-row gap-6 mt-3">
                <View className="items-center">
                  <Text className="text-lg font-semibold text-gray-900">
                    {calculateAge(pet.birthday)}
                  </Text>
                  <Text className="text-xs text-gray-500">{t("pet.age")}</Text>
                </View>
                <View className="items-center">
                  <Text className="text-lg font-semibold text-gray-900">
                    {formatDate(pet.birthday)}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {t("pet.birthday")}
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Today's Record - Editable */}
          <Card>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-gray-900">
                {t("record.todayRecord")}
              </Text>
              {hasUnsavedChanges && (
                <View className="bg-primary-100 rounded-full px-2 py-0.5">
                  <Text className="text-xs text-primary-600">
                    {t("record.unsaved")}
                  </Text>
                </View>
              )}
            </View>

            {/* Weight */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                {t("record.weight")}
              </Text>
              <WeightStepper
                value={todayWeight}
                onChange={handleWeightChange}
                previousWeight={previousWeight}
              />
            </View>

            {/* Observations */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                {t("record.observations")}
              </Text>
              <ObservationInput
                selectedObservations={todayObservations}
                onToggle={handleToggleObservation}
                onAdd={handleAddObservation}
                onRemove={handleRemoveObservation}
              />
            </View>

            {/* Save Button */}
            <Button
              title={
                hasUnsavedChanges ? t("record.saveChanges") : t("record.saved")
              }
              onPress={handleSave}
              loading={isSaving}
              disabled={!hasUnsavedChanges}
              variant={hasUnsavedChanges ? "primary" : "secondary"}
            />
          </Card>

          {/* Weight Chart */}
          {chartData && (
            <Animated.View entering={FadeInUp.delay(200).springify()}>
              <Card>
                <Text className="text-lg font-semibold text-gray-900 mb-4">
                  {t("record.weightTrend")}
                </Text>
                <LineChart
                  data={chartData}
                  width={screenWidth - 64}
                  height={180}
                  chartConfig={{
                    backgroundColor: "#fff",
                    backgroundGradientFrom: "#fff",
                    backgroundGradientTo: "#fff",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(237, 122, 17, ${opacity})`,
                    labelColor: (opacity = 1) =>
                      `rgba(107, 114, 128, ${opacity})`,
                    propsForDots: {
                      r: "4",
                      strokeWidth: "2",
                      stroke: "#ed7a11",
                    },
                  }}
                  bezier
                  style={{ borderRadius: 16 }}
                />
              </Card>
            </Animated.View>
          )}

          {/* History Section */}
          <Card>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-gray-900">
                {t("record.history")}
              </Text>

              {/* Week/Month Toggle */}
              <TimeRangeToggle
                value={timeRange}
                onChange={setTimeRange}
                labels={{
                  week: t("record.week"),
                  month: t("record.month"),
                }}
              />
            </View>

            {history.length === 0 ? (
              <View className="items-center py-6">
                <FontAwesome name="calendar-o" size={32} color="#D1D5DB" />
                <Text className="text-gray-400 mt-2">
                  {t("record.noHistory")}
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {history.map((record) => (
                  <View
                    key={record.id}
                    className="border-l-2 border-primary-200 pl-3 py-1"
                  >
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-sm font-medium text-gray-900">
                        {formatRecordDate(record.recordDate)}
                      </Text>
                      {record.weight && (
                        <Text className="text-sm text-gray-600">
                          {record.weight}g
                        </Text>
                      )}
                    </View>
                    {record.observations.length > 0 && (
                      <View className="flex-row flex-wrap gap-1">
                        {record.observations.map((obs, i) => (
                          <ObservationChip key={i} observation={obs} t={t} />
                        ))}
                      </View>
                    )}
                    {record.notes && (
                      <Text className="text-xs text-gray-500 mt-1 italic">
                        "{record.notes}"
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </Card>

          {/* Delete Button */}
          <Button
            title={t("pet.deletePet")}
            onPress={handleDelete}
            variant="danger"
            className="mt-4"
          />

          {/* DEV: Add Mock Data */}
          {__DEV__ && (
            <Button
              title="[DEV] Add Mock History"
              onPress={async () => {
                await seedMockHistory(Number(id));
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success,
                );
                await loadHistory();
              }}
              variant="ghost"
              className="mt-2"
            />
          )}
        </View>
      </ScrollView>
    </>
  );
}
