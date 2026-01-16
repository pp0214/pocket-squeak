import { useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { usePetStore } from "@/src/store/petStore";
import { PetCard } from "@/src/components/PetCard";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function DashboardScreen() {
  const router = useRouter();
  const { pets, isLoading, loadPets } = usePetStore();

  useEffect(() => {
    loadPets();
  }, [loadPets]);

  const handleRefresh = useCallback(() => {
    loadPets();
  }, [loadPets]);

  const handlePetPress = (petId: number) => {
    router.push(`/pet/${petId}`);
  };

  const handleAddPet = () => {
    router.push("/modal/add-pet");
  };

  return (
    <View className="flex-1 bg-gray-50">
      {isLoading && pets.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ed7a11" />
        </View>
      ) : pets.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-6xl mb-4">🐭</Text>
          <Text className="text-xl font-semibold text-gray-900 mb-2">
            No pets yet
          </Text>
          <Text className="text-gray-500 text-center mb-6">
            Add your first furry friend to start tracking their health
          </Text>
          <TouchableOpacity
            onPress={handleAddPet}
            className="bg-primary-500 px-6 py-3 rounded-xl active:bg-primary-600"
          >
            <Text className="text-white font-semibold text-lg">Add Pet</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PetCard pet={item} onPress={() => handlePetPress(item.id)} />
          )}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              tintColor="#ed7a11"
            />
          }
        />
      )}

      {/* FAB */}
      {pets.length > 0 && (
        <TouchableOpacity
          onPress={handleAddPet}
          className="absolute right-6 bottom-6 w-14 h-14 bg-primary-500 rounded-full items-center justify-center shadow-lg active:bg-primary-600"
        >
          <FontAwesome name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}
