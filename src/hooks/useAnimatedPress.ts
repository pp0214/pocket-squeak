import { useCallback } from "react";
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

interface UseAnimatedPressOptions {
  scaleValue?: number;
  opacityValue?: number;
  hapticEnabled?: boolean;
  hapticStyle?: Haptics.ImpactFeedbackStyle;
}

const DEFAULT_SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 0.5,
};

export function useAnimatedPress(options: UseAnimatedPressOptions = {}) {
  const {
    scaleValue = 0.97,
    opacityValue = 0.8,
    hapticEnabled = true,
    hapticStyle = Haptics.ImpactFeedbackStyle.Light,
  } = options;

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const triggerHaptic = useCallback(() => {
    if (hapticEnabled) {
      Haptics.impactAsync(hapticStyle);
    }
  }, [hapticEnabled, hapticStyle]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const onPressIn = useCallback(() => {
    scale.value = withSpring(scaleValue, DEFAULT_SPRING_CONFIG);
    opacity.value = withTiming(opacityValue, { duration: 100 });
  }, [scaleValue, opacityValue]);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, DEFAULT_SPRING_CONFIG);
    opacity.value = withTiming(1, { duration: 100 });
  }, []);

  const handlePress = useCallback(
    (callback?: () => void) => {
      triggerHaptic();
      callback?.();
    },
    [triggerHaptic],
  );

  return {
    animatedStyle,
    onPressIn,
    onPressOut,
    handlePress,
    triggerHaptic,
  };
}
