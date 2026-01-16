import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { LineChart } from "react-native-chart-kit";
import {
  getPetById,
  getPetWeightHistory,
  getPetHealthHistory,
} from "@/src/db/queries";
import { usePetStore } from "@/src/store/petStore";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { calculateAge, formatDate, getRelativeTime } from "@/src/utils/date";
import {
  SPECIES_NAMES,
  HEALTH_TAG_INFO,
  type Pet,
  type WeightLog,
  type HealthLog,
} from "@/src/types";

const screenWidth = Dimensions.get("window").width;

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { deletePet } = usePetStore();

  const [pet, setPet] = useState<Pet | null>(null);
  const [weightHistory, setWeightHistory] = useState<WeightLog[]>([]);
  const [healthHistory, setHealthHistory] = useState<HealthLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const [petData, weights, health] = await Promise.all([
          getPetById(Number(id)),
          getPetWeightHistory(Number(id), 30),
          getPetHealthHistory(Number(id), 10),
        ]);

        setPet(petData);
        setWeightHistory(weights);
        setHealthHistory(health);
      } catch (error) {
        console.error("Failed to load pet data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Pet",
      `Are you sure you want to delete ${pet?.name}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
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

  const handleRecord = () => {
    router.push(`/modal/recorder?petId=${id}`);
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
        <Text className="text-gray-500">Pet not found</Text>
      </View>
    );
  }

  // Prepare chart data
  const chartData =
    weightHistory.length > 1
      ? {
          labels: weightHistory
            .slice(0, 7)
            .reverse()
            .map((w) => {
              const date = new Date(w.recordedAt);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }),
          datasets: [
            {
              data: weightHistory
                .slice(0, 7)
                .reverse()
                .map((w) => w.weight),
              strokeWidth: 2,
            },
          ],
        }
      : null;

  return (
    <>
      <Stack.Screen options={{ title: pet.name }} />
      <ScrollView className="flex-1 bg-gray-50">
        <View className="p-4 gap-4">
          {/* Pet Info Card */}
          <Card>
            <View className="items-center">
              <View className="w-20 h-20 rounded-full bg-primary-100 items-center justify-center mb-3">
                <Text className="text-4xl">
                  {pet.species === "rat" && "🐀"}
                  {pet.species === "guinea_pig" && "🐹"}
                  {pet.species === "hamster" && "🐹"}
                  {pet.species === "gerbil" && "🐭"}
                  {pet.species === "mouse" && "🐭"}
                </Text>
              </View>
              <Text className="text-2xl font-bold text-gray-900">
                {pet.name}
              </Text>
              <Text className="text-gray-500">
                {SPECIES_NAMES[pet.species]} · {pet.gender}
              </Text>
              <View className="flex-row gap-4 mt-3">
                <View className="items-center">
                  <Text className="text-lg font-semibold text-gray-900">
                    {calculateAge(pet.birthday)}
                  </Text>
                  <Text className="text-xs text-gray-500">Age</Text>
                </View>
                <View className="items-center">
                  <Text className="text-lg font-semibold text-gray-900">
                    {formatDate(pet.birthday)}
                  </Text>
                  <Text className="text-xs text-gray-500">Birthday</Text>
                </View>
                {weightHistory[0] && (
                  <View className="items-center">
                    <Text className="text-lg font-semibold text-gray-900">
                      {weightHistory[0].weight}g
                    </Text>
                    <Text className="text-xs text-gray-500">Weight</Text>
                  </View>
                )}
              </View>
            </View>
          </Card>

          {/* Quick Record Button */}
          <Button
            title="Record Weight & Health"
            onPress={handleRecord}
            size="lg"
          />

          {/* Weight Chart */}
          {chartData && (
            <Card>
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Weight Trend
              </Text>
              <LineChart
                data={chartData}
                width={screenWidth - 64}
                height={200}
                chartConfig={{
                  backgroundColor: "#fff",
                  backgroundGradientFrom: "#fff",
                  backgroundGradientTo: "#fff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(237, 122, 17, ${opacity})`,
                  labelColor: (opacity = 1) =>
                    `rgba(107, 114, 128, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: "4",
                    strokeWidth: "2",
                    stroke: "#ed7a11",
                  },
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
            </Card>
          )}

          {/* Weight History */}
          <Card>
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Weight History
            </Text>
            {weightHistory.length === 0 ? (
              <Text className="text-gray-500 text-center py-4">
                No weight records yet
              </Text>
            ) : (
              <View className="gap-2">
                {weightHistory.slice(0, 10).map((log) => (
                  <View
                    key={log.id}
                    className="flex-row justify-between items-center py-2 border-b border-gray-100"
                  >
                    <Text className="text-gray-500">
                      {getRelativeTime(log.recordedAt)}
                    </Text>
                    <Text className="font-semibold text-gray-900">
                      {log.weight}g
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Card>

          {/* Health History */}
          <Card>
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Health Observations
            </Text>
            {healthHistory.length === 0 ? (
              <Text className="text-gray-500 text-center py-4">
                No health observations recorded
              </Text>
            ) : (
              <View className="gap-3">
                {healthHistory.map((log) => (
                  <View key={log.id} className="py-2 border-b border-gray-100">
                    <Text className="text-xs text-gray-500 mb-1">
                      {getRelativeTime(log.recordedAt)}
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {log.tags.map((tag) => (
                        <View
                          key={tag}
                          className="bg-primary-100 px-2 py-1 rounded-full flex-row items-center gap-1"
                        >
                          <Text>{HEALTH_TAG_INFO[tag].emoji}</Text>
                          <Text className="text-xs text-primary-700">
                            {HEALTH_TAG_INFO[tag].label}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Card>

          {/* Delete Button */}
          <Button
            title="Delete Pet"
            onPress={handleDelete}
            variant="danger"
            className="mt-4"
          />
        </View>
      </ScrollView>
    </>
  );
}
