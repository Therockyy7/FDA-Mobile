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
  isLoading?: boolean;      // ← thêm: đang tìm đường
  onPress: () => void;
  onClear?: () => void;     // ← thêm: xóa nội dung
  disabled: boolean;
}

export function LocationInput({
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
      style={{
        backgroundColor: "#F3F4F6",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: hasValue ? "#E5E7EB" : "#F3F4F6",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      {/* Nội dung chính */}
      <View style={{ flex: 1 }}>
        {isLoading ? (
          // Skeleton loading bar khi đang tìm đường
          <View style={{ gap: 4 }}>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: "#E5E7EB", overflow: "hidden" }}>
              <Animated.View
                style={{
                  height: "100%",
                  width: "60%",
                  backgroundColor: "#BFDBFE",
                  borderRadius: 4,
                }}
              />
            </View>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: "#E5E7EB", overflow: "hidden" }}>
              <Animated.View
                style={{
                  height: "100%",
                  width: "40%",
                  backgroundColor: "#DBEAFE",
                  borderRadius: 3,
                }}
              />
            </View>
          </View>
        ) : (
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
        )}
      </View>

      {/* Nút X để xóa */}
      {showClear && (
        <TouchableOpacity
          onPress={onClear}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{
            marginLeft: 6,
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: "#D1D5DB",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="close" size={11} color="white" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

