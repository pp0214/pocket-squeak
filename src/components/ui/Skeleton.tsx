import { useEffect } from "react";
import { View, ViewStyle, DimensionValue } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { clsx } from "clsx";

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  variant?: "rectangular" | "circular" | "rounded";
  className?: string;
  style?: ViewStyle;
}

export function Skeleton({
  width,
  height,
  borderRadius,
  variant = "rounded",
  className,
  style,
}: SkeletonProps) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, {
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.6, 0.3]);

    return {
      opacity,
    };
  });

  const getVariantStyles = () => {
    switch (variant) {
      case "circular":
        return "rounded-full";
      case "rectangular":
        return "rounded-none";
      case "rounded":
      default:
        return "rounded-xl";
    }
  };

  const computedStyle: ViewStyle = {
    width: width,
    height: height,
    ...(borderRadius !== undefined && { borderRadius }),
    ...style,
  };

  return (
    <Animated.View
      style={[computedStyle, animatedStyle]}
      className={clsx("bg-gray-200", getVariantStyles(), className)}
    />
  );
}

interface SkeletonTextProps {
  lines?: number;
  lineHeight?: number;
  lastLineWidth?: DimensionValue;
  className?: string;
}

export function SkeletonText({
  lines = 3,
  lineHeight = 16,
  lastLineWidth = "60%",
  className,
}: SkeletonTextProps) {
  return (
    <View className={clsx("gap-2", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? lastLineWidth : "100%"}
          height={lineHeight}
          variant="rounded"
        />
      ))}
    </View>
  );
}
