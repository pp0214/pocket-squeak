import { View, Pressable } from "react-native";
import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function Card({ children, className, onPress, onLongPress }: CardProps) {
  const baseStyles = "bg-white rounded-2xl p-4 shadow-sm";

  if (onPress || onLongPress) {
    return (
      <Pressable onPress={onPress} onLongPress={onLongPress} delayLongPress={500}>
        <View className={clsx(baseStyles, className)}>{children}</View>
      </Pressable>
    );
  }

  return <View className={clsx(baseStyles, className)}>{children}</View>;
}
