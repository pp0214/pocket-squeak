import { useEffect, useRef } from "react";
import { Text, Pressable, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useAnimatedReaction,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { clsx } from "clsx";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastData {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const TOAST_CONFIG: Record<
  ToastType,
  {
    icon: React.ComponentProps<typeof FontAwesome>["name"];
    bg: string;
    iconColor: string;
  }
> = {
  success: {
    icon: "check-circle",
    bg: "bg-green-500",
    iconColor: "#ffffff",
  },
  error: {
    icon: "times-circle",
    bg: "bg-red-500",
    iconColor: "#ffffff",
  },
  info: {
    icon: "info-circle",
    bg: "bg-blue-500",
    iconColor: "#ffffff",
  },
  warning: {
    icon: "exclamation-triangle",
    bg: "bg-amber-500",
    iconColor: "#ffffff",
  },
};

export function Toast({ toast, onDismiss }: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const shouldDismiss = useSharedValue(false);
  const dismissedRef = useRef(false);

  const config = TOAST_CONFIG[toast.type];
  const duration = toast.duration ?? 3000;

  useAnimatedReaction(
    () => shouldDismiss.value,
    (current, previous) => {
      if (current && !previous && !dismissedRef.current) {
        dismissedRef.current = true;
      }
    },
    [toast.id],
  );

  useEffect(() => {
    // Animate in
    translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    opacity.value = withTiming(1, { duration: 200 });

    // Auto dismiss
    const timer = setTimeout(() => {
      startDismissAnimation();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const startDismissAnimation = () => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;

    translateY.value = withTiming(-100, { duration: 200 });
    opacity.value = withTiming(0, { duration: 200 });

    // Call onDismiss after animation
    setTimeout(() => {
      onDismiss(toast.id);
    }, 220);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: "absolute",
          top: insets.top + 8,
          left: 16,
          right: 16,
          zIndex: 9999,
        },
      ]}
    >
      <Pressable onPress={startDismissAnimation}>
        <View
          className={clsx(
            "flex-row items-center px-4 py-3 rounded-xl shadow-lg",
            config.bg,
          )}
        >
          <FontAwesome name={config.icon} size={20} color={config.iconColor} />
          <Text className="flex-1 text-white font-medium ml-3 text-base">
            {toast.message}
          </Text>
          <FontAwesome name="times" size={16} color="rgba(255,255,255,0.7)" />
        </View>
      </Pressable>
    </Animated.View>
  );
}
