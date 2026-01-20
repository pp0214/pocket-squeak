import { useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { usePetStore } from "@/src/store/petStore";
import { Card } from "@/src/components/ui/Card";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function RecordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { pets, isLoading, loadPets } = usePetStore();

  useEffect(() => {
    loadPets();
  }, [loadPets]);

  const handleQuickRecord = (petId: number) => {
    router.push(`/modal/recorder?petId=${petId}`);
  };

  if (isLoading && pets.length === 0) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#ed7a11" />
      </View>
    );
  }

  if (pets.length === 0) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <Text className="text-6xl mb-4">📝</Text>
        <Text className="text-xl font-semibold text-gray-900 mb-2">
          {t("record.noPetsToRecord")}
        </Text>
        <Text className="text-gray-500 text-center">
          {t("record.addPetFirst")}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          {t("record.title")}
        </Text>
        <Text className="text-gray-500 mb-4">
          {t("record.selectPetToRecord")}
        </Text>

        {pets.map((pet) => (
          <Card
            key={pet.id}
            onPress={() => handleQuickRecord(pet.id)}
            className="mb-3"
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-primary-100 items-center justify-center mr-3">
                <Text className="text-2xl">
                  {pet.species === "rat" ? "🐀" : "🐹"}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">
                  {pet.name}
                </Text>
                <Text className="text-sm text-gray-500">
                  {t(`species.${pet.species}`)}
                </Text>
              </View>
              <FontAwesome name="chevron-right" size={16} color="#9CA3AF" />
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}
