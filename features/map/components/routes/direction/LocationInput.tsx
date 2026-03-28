// features/map/components/routes/direction/LocationInput.tsx
import React from "react";
import { TouchableOpacity } from "react-native";
import { Text } from "~/components/ui/text";

interface LocationInputProps {
  label?: string;
  placeholder: string;
  isGPS: boolean;
  hasCoord?: boolean;
  onPress: () => void;
  disabled: boolean;
}

export function LocationInput({
  label,
  placeholder,
  isGPS,
  onPress,
  disabled,
}: LocationInputProps) {
  const hasValue = isGPS || (label && label.length > 0);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.6}
      style={{
        backgroundColor: "#F3F4F6",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: hasValue ? "#E5E7EB" : "#F3F4F6",
      }}
    >
      <Text
        style={{
          fontSize: 14,
          color: hasValue
            ? isGPS
              ? "#2563EB"
              : "#111827"
            : "#9CA3AF",
          fontWeight: hasValue ? "500" : "400",
        }}
        numberOfLines={1}
      >
        {hasValue ? label : placeholder}
      </Text>
    </TouchableOpacity>
  );
}
