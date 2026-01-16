import { View, TouchableOpacity } from "react-native";
import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onPress?: () => void;
}

export function Card({ children, className, onPress }: CardProps) {
  const baseStyles = "bg-white rounded-2xl p-4 shadow-sm";

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        className={clsx(baseStyles, "active:scale-[0.98]", className)}
        activeOpacity={0.9}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View className={clsx(baseStyles, className)}>{children}</View>;
}
