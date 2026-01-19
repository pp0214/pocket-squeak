import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { getPets } from "@/src/db/queries";
import { exportAndShareCSV } from "@/src/services/exportService";
import type { Pet } from "@/src/types";
import { clsx } from "clsx";

type DateRange = "week" | "month" | "all";

export default function ExportModal() {
  const { t } = useTranslation();
  const router = useRouter();

  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetIds, setSelectedPetIds] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>("month");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const loadPets = async () => {
      try {
        const loadedPets = await getPets();
        setPets(loadedPets);
      } catch (error) {
        console.error("Failed to load pets:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPets();
  }, []);

  const togglePet = (petId: number) => {
    setSelectedPetIds((prev) =>
      prev.includes(petId) ? prev.filter((id) => id !== petId) : [...prev, petId]
    );
  };

  const selectAllPets = () => {
    if (selectedPetIds.length === pets.length) {
      setSelectedPetIds([]);
    } else {
      setSelectedPetIds(pets.map((p) => p.id));
    }
  };

  const getDateRangeValues = (): { start?: string; end?: string } => {
    const end = new Date().toISOString().split("T")[0];
    const start = new Date();

    switch (dateRange) {
      case "week":
        start.setDate(start.getDate() - 7);
        return { start: start.toISOString().split("T")[0], end };
      case "month":
        start.setDate(start.getDate() - 30);
        return { start: start.toISOString().split("T")[0], end };
      case "all":
        return {}; // No date filter
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { start, end } = getDateRangeValues();
      await exportAndShareCSV({
        petIds: selectedPetIds.length > 0 ? selectedPetIds : undefined,
        startDate: start,
        endDate: end,
      });
      Alert.alert(t("common.success"), t("export.success"));
    } catch (error) {
      Alert.alert(
        t("common.error"),
        error instanceof Error ? error.message : t("export.error")
      );
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#ed7a11" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4 gap-4">
        {/* Pet Selection */}
        <Card>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-gray-900">
              {t("export.selectPets")}
            </Text>
            <TouchableOpacity onPress={selectAllPets}>
              <Text className="text-primary-500 font-medium">
                {selectedPetIds.length === pets.length
                  ? t("common.cancel")
                  : t("export.allPets")}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="gap-2">
            {pets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                onPress={() => togglePet(pet.id)}
                className={clsx(
                  "flex-row items-center p-3 rounded-xl",
                  selectedPetIds.includes(pet.id) ? "bg-primary-50" : "bg-gray-50"
                )}
              >
                <View
                  className={clsx(
                    "w-6 h-6 rounded-full border-2 items-center justify-center mr-3",
                    selectedPetIds.includes(pet.id)
                      ? "bg-primary-500 border-primary-500"
                      : "border-gray-300"
                  )}
                >
                  {selectedPetIds.includes(pet.id) && (
                    <FontAwesome name="check" size={12} color="#fff" />
                  )}
                </View>
                <Text className="flex-1 text-gray-900 font-medium">{pet.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {pets.length === 0 && (
            <Text className="text-center text-gray-500 py-4">
              {t("home.noPets")}
            </Text>
          )}
        </Card>

        {/* Date Range Selection */}
        <Card>
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            {t("export.dateRange")}
          </Text>

          <View className="flex-row gap-2">
            {(["week", "month", "all"] as DateRange[]).map((range) => (
              <TouchableOpacity
                key={range}
                onPress={() => setDateRange(range)}
                className={clsx(
                  "flex-1 py-3 rounded-xl items-center",
                  dateRange === range ? "bg-primary-500" : "bg-gray-100"
                )}
              >
                <Text
                  className={clsx(
                    "font-medium",
                    dateRange === range ? "text-white" : "text-gray-700"
                  )}
                >
                  {t(`export.${range === "week" ? "lastWeek" : range === "month" ? "lastMonth" : "allTime"}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Export Button */}
        <Button
          title={isExporting ? t("export.exporting") : t("export.export")}
          onPress={handleExport}
          loading={isExporting}
          disabled={pets.length === 0}
        />
      </View>
    </ScrollView>
  );
}
