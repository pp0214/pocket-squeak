import { View, Text, TextInput, TextInputProps } from "react-native";
import { clsx } from "clsx";

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
  ...props
}: InputProps) {
  return (
    <View className={clsx("gap-1", containerClassName)}>
      {label && (
        <Text className="text-sm font-medium text-gray-700">{label}</Text>
      )}
      <TextInput
        className={clsx(
          "bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-900",
          error && "border border-red-500",
          className,
        )}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && <Text className="text-xs text-red-500">{error}</Text>}
    </View>
  );
}
