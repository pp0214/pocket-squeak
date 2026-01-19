import { useEffect, useCallback } from "react";
import { View, FlatList, Pressable, RefreshControl } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { usePetStore } from "@/src/store/petStore";
import { PetCard } from "@/src/components/PetCard";
import { EmptyState } from "@/src/components/EmptyState";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function DashboardScreen() {
  const router = useRouter();
  const { pets, isLoading, loadPets, deletePet } = usePetStore();
  const fabScale = useSharedValue(0);

  useEffect(() => {
    loadPets();
  }, [loadPets]);

  useEffect(() => {
    if (pets.length > 0) {
      fabScale.value = withSpring(1, { damping: 12 });
    }
  }, [pets.length]);

  const handleRefresh = useCallback(() => {
    loadPets();
  }, [loadPets]);

  const handlePetPress = (petId: number) => {
    router.push(`/pet/${petId}`);
  };

  const handleAddPet = () => {
    router.push("/modal/add-pet");
  };

  const handleDeletePet = useCallback(
    async (petId: number) => {
      await deletePet(petId);
    },
    [deletePet]
  );

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-gray-50">
        {/* Subtle gradient-like background */}
        <View className="absolute inset-0 bg-gradient-to-b from-primary-50 to-gray-50" />
        <View className="absolute top-0 left-0 right-0 h-32 bg-primary-50 opacity-50" />

      {isLoading && pets.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Animated.View entering={FadeIn.duration(300)}>
            <View className="w-16 h-16 rounded-full bg-primary-100 items-center justify-center">
              <FontAwesome name="paw" size={28} color="#ed7a11" />
            </View>
          </Animated.View>
        </View>
      ) : pets.length === 0 ? (
        <EmptyState onAddPet={handleAddPet} />
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
              <PetCard
                pet={item}
                onPress={() => handlePetPress(item.id)}
                onDelete={handleDeletePet}
              />
            </Animated.View>
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              tintColor="#ed7a11"
            />
          }
        />
      )}

      {/* Animated FAB */}
      {pets.length > 0 && (
        <AnimatedPressable
          onPress={handleAddPet}
          style={[
            fabAnimatedStyle,
            { position: "absolute", right: 24, bottom: 24 },
          ]}
        >
          <View className="w-16 h-16 bg-primary-500 rounded-full items-center justify-center shadow-xl">
            <FontAwesome name="plus" size={26} color="#fff" />
          </View>
        </AnimatedPressable>
      )}
      </View>
    </GestureHandlerRootView>
  );
}
