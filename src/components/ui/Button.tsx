import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { clsx } from "clsx";
import * as Haptics from "expo-haptics";

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
  const handlePress = () => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const baseStyles = "rounded-xl items-center justify-center flex-row";

  const variantStyles = {
    primary: "bg-primary-500 active:bg-primary-600",
    secondary: "bg-gray-200 active:bg-gray-300",
    danger: "bg-red-500 active:bg-red-600",
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
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        (disabled || loading) && "opacity-50",
        className,
      )}
      activeOpacity={0.8}
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
    </TouchableOpacity>
  );
}
