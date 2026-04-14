// features/map/components/routes/direction/LocationInput.tsx
import React from "react";
import { Animated, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "~/components/ui/text";

interface LocationInputProps {
  label?: string;
  placeholder: string;
  isGPS: boolean;
  hasCoord?: boolean;
  isLoading?: boolean;
  onPress: () => void;
  onClear?: () => void;
  disabled: boolean;
}

export const LocationInput = React.memo(function LocationInput({
  label,
  placeholder,
  isGPS,
  isLoading,
  onPress,
  onClear,
  disabled,
}: LocationInputProps) {
  const hasValue = isGPS || (label && label.length > 0);
  const showClear = hasValue && !isGPS && !isLoading && !!onClear;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.6}
      className={`bg-gray-100 rounded-lg px-3 py-2.5 border flex-row items-center ${hasValue ? "border-gray-200" : "border-gray-100"}`}
    >
      {/* Main content */}
      <View className="flex-1">
        {isLoading ? (
          <View className="gap-1">
            <View className="h-2 rounded bg-gray-200 overflow-hidden">
              <Animated.View className="h-full w-3/5 bg-blue-200 rounded" />
            </View>
            <View className="h-1.5 rounded bg-gray-200 overflow-hidden">
              <Animated.View className="h-full w-2/5 bg-blue-100 rounded" />
            </View>
          </View>
        ) : (
          <Text
            style={{
              fontSize: 14,
              color: hasValue ? (isGPS ? "#2563EB" : "#111827") : "#9CA3AF",
              fontWeight: hasValue ? "500" : "400",
            }}
            numberOfLines={1}
          >
            {hasValue ? label : placeholder}
          </Text>
        )}
      </View>

      {/* Clear button */}
      {showClear && (
        <TouchableOpacity
          onPress={onClear}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="ml-1.5 w-5 h-5 rounded-full bg-gray-300 items-center justify-center"
        >
          <Ionicons name="close" size={11} color="white" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
});
