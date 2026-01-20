import { useState, useCallback } from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import { clsx } from "clsx";

const AnimatedView = Animated.createAnimatedComponent(View);

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  containerClassName,
  className,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnimation = useSharedValue(0);

  const handleFocus = useCallback(
    (e: Parameters<NonNullable<TextInputProps["onFocus"]>>[0]) => {
      setIsFocused(true);
      focusAnimation.value = withTiming(1, { duration: 200 });
      onFocus?.(e);
    },
    [onFocus],
  );

  const handleBlur = useCallback(
    (e: Parameters<NonNullable<TextInputProps["onBlur"]>>[0]) => {
      setIsFocused(false);
      focusAnimation.value = withTiming(0, { duration: 200 });
      onBlur?.(e);
    },
    [onBlur],
  );

  const animatedBorderStyle = useAnimatedStyle(() => {
    const borderColor = error
      ? "#ef4444"
      : interpolateColor(
          focusAnimation.value,
          [0, 1],
          ["transparent", "#ed7a11"],
        );

    return {
      borderColor,
      borderWidth: error || focusAnimation.value > 0 ? 2 : 0,
    };
  });

  return (
    <View className={clsx("gap-1", containerClassName)}>
      {label && (
        <Text
          className={clsx(
            "text-sm font-medium",
            isFocused ? "text-primary-600" : "text-gray-700",
            error && "text-red-600",
          )}
        >
          {label}
        </Text>
      )}
      <AnimatedView
        style={animatedBorderStyle}
        className="rounded-xl overflow-hidden"
      >
        <TextInput
          className={clsx(
            "bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-900",
            className,
          )}
          placeholderTextColor="#9CA3AF"
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </AnimatedView>
      {error && (
        <Animated.Text className="text-xs text-red-500">{error}</Animated.Text>
      )}
    </View>
  );
}
