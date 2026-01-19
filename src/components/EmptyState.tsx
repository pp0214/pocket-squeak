import { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Button } from "./ui/Button";

interface EmptyStateProps {
  onAddPet: () => void;
}

export function EmptyState({ onAddPet }: EmptyStateProps) {
  const scale = useSharedValue(0);
  const bounce = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    // Animate icon entrance
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });

    // Bounce animation loop
    bounce.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(-8, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    );

    // Fade in text
    textOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));

    // Fade in button
    buttonOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
  }, []);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: bounce.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: (1 - textOpacity.value) * 20 }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: (1 - buttonOpacity.value) * 20 }],
  }));

  return (
    <View className="flex-1 items-center justify-center px-8">
      {/* Background decoration */}
      <View className="absolute inset-0 items-center justify-center opacity-5">
        <View className="w-96 h-96 rounded-full bg-primary-500" />
      </View>

      {/* Animated mascot */}
      <Animated.View style={iconAnimatedStyle} className="mb-6">
        <View className="w-32 h-32 rounded-full bg-primary-100 items-center justify-center shadow-lg">
          <Text className="text-7xl">🐹</Text>
        </View>
      </Animated.View>

      {/* Text content */}
      <Animated.View style={textAnimatedStyle} className="items-center">
        <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Welcome to Pocket Squeak!
        </Text>
        <Text className="text-base text-gray-500 text-center leading-6 mb-8 max-w-xs">
          Track your small furry friends' health, weight, and daily care with
          ease.
        </Text>
      </Animated.View>

      {/* CTA Button */}
      <Animated.View style={buttonAnimatedStyle} className="w-full max-w-xs">
        <Button
          title="Add Your First Pet"
          onPress={onAddPet}
          size="lg"
          className="shadow-lg"
        />

        {/* Features preview */}
        <View className="flex-row justify-center mt-8 gap-6">
          <View className="items-center">
            <View className="w-12 h-12 rounded-xl bg-green-100 items-center justify-center mb-2">
              <Text className="text-2xl">📊</Text>
            </View>
            <Text className="text-xs text-gray-500">Weight</Text>
          </View>
          <View className="items-center">
            <View className="w-12 h-12 rounded-xl bg-blue-100 items-center justify-center mb-2">
              <Text className="text-2xl">💊</Text>
            </View>
            <Text className="text-xs text-gray-500">Health</Text>
          </View>
          <View className="items-center">
            <View className="w-12 h-12 rounded-xl bg-purple-100 items-center justify-center mb-2">
              <Text className="text-2xl">📝</Text>
            </View>
            <Text className="text-xs text-gray-500">Notes</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
