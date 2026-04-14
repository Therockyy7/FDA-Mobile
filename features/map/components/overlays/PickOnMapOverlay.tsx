// features/map/components/overlays/PickOnMapOverlay.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { SHADOW, MAP_SEMANTIC_COLORS } from "~/lib/design-tokens";

interface PickOnMapOverlayProps {
  visible: boolean;
  pickingTarget: "origin" | "destination" | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PickOnMapOverlay({
  visible,
  pickingTarget,
  onConfirm,
  onCancel,
}: PickOnMapOverlayProps) {
  if (!visible) return null;

  // Map picking target to semantic colors (origin/destination)
  const accentColor = useMemo(() =>
    pickingTarget === "origin" ? MAP_SEMANTIC_COLORS.origin : MAP_SEMANTIC_COLORS.destination,
    [pickingTarget]
  );

  return (
    <>
      {/* Center pin marker */}
      <View style={styles.pinContainer} pointerEvents="none">
        <View className="items-center mb-9">
          <Ionicons name="location-sharp" size={40} color={accentColor} />
          <View className="w-1 h-1 rounded-full bg-foreground -mt-1" />
        </View>
      </View>

      {/* Bottom confirm card */}
      <View
        className="absolute bottom-6 left-4 right-4 z-50 rounded-2xl p-4 border bg-card dark:bg-card border-border"
        style={SHADOW.md}
        testID="map-overlay-pickonmap"
      >
        <Text className="text-sm font-semibold text-foreground mb-1">
          {pickingTarget === "origin" ? "Chọn điểm đi" : "Chọn điểm đến"}
        </Text>
        <Text className="text-xs text-muted-foreground mb-3">
          Di chuyển bản đồ để đặt vị trí tại điểm ghim
        </Text>
        <View className="flex-row gap-2.5">
          <TouchableOpacity
            onPress={onCancel}
            className="flex-1 py-3 rounded-full items-center bg-muted dark:bg-muted"
          >
            <Text className="text-sm font-semibold text-foreground">Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onConfirm}
            className="flex-1 py-3 rounded-full items-center"
            style={{ backgroundColor: accentColor }}
          >
            <Text className="text-sm font-bold text-white">Xác nhận</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  pinContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});
