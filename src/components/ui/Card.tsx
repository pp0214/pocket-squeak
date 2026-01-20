import { View, Pressable } from "react-native";
import Animated from "react-native-reanimated";
import { clsx } from "clsx";
import { useAnimatedPress } from "@/src/hooks/useAnimatedPress";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  haptic?: boolean;
}

export function Card({
  children,
  className,
  onPress,
  onLongPress,
  haptic = true,
}: CardProps) {
  const { animatedStyle, onPressIn, onPressOut, triggerHaptic } =
    useAnimatedPress({
      scaleValue: 0.98,
      hapticEnabled: haptic,
    });

  const baseStyles = "bg-white rounded-2xl p-4 shadow-sm";

  const handlePress = () => {
    triggerHaptic();
    onPress?.();
  };

  const handleLongPress = () => {
    triggerHaptic();
    onLongPress?.();
  };

  if (onPress || onLongPress) {
    return (
      <AnimatedPressable
        onPress={onPress ? handlePress : undefined}
        onLongPress={onLongPress ? handleLongPress : undefined}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        delayLongPress={500}
        style={animatedStyle}
      >
        <View className={clsx(baseStyles, className)}>{children}</View>
      </AnimatedPressable>
    );
  }

  return <View className={clsx(baseStyles, className)}>{children}</View>;
}
