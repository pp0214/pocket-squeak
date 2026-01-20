import { Text, ActivityIndicator, Pressable } from "react-native";
import Animated from "react-native-reanimated";
import { clsx } from "clsx";
import { useAnimatedPress } from "@/src/hooks/useAnimatedPress";
import * as Haptics from "expo-haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  haptic?: boolean;
  className?: string;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  haptic = true,
  className,
}: ButtonProps) {
  const { animatedStyle, onPressIn, onPressOut } = useAnimatedPress({
    hapticEnabled: haptic,
    hapticStyle: Haptics.ImpactFeedbackStyle.Light,
  });

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  const baseStyles = "rounded-xl items-center justify-center flex-row";

  const variantStyles = {
    primary: "bg-primary-500",
    secondary: "bg-gray-200",
    danger: "bg-red-500",
    ghost: "bg-transparent",
  };

  const sizeStyles = {
    sm: "px-3 py-2",
    md: "px-4 py-3",
    lg: "px-6 py-4",
  };

  const textVariantStyles = {
    primary: "text-white",
    secondary: "text-gray-900",
    danger: "text-white",
    ghost: "text-primary-500",
  };

  const textSizeStyles = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled || loading}
      style={animatedStyle}
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        (disabled || loading) && "opacity-50",
        className,
      )}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "secondary" ? "#111827" : "#ffffff"}
        />
      ) : (
        <Text
          className={clsx(
            "font-semibold",
            textVariantStyles[variant],
            textSizeStyles[size],
          )}
        >
          {title}
        </Text>
      )}
    </AnimatedPressable>
  );
}
