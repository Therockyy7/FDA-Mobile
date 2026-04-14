// features/map/components/controls/layers/BaseMapSelector.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { TouchableOpacity, View, useColorScheme } from "react-native";
import { Text } from "~/components/ui/text";
import { MAP_ICON_COLORS } from "~/lib/design-tokens";
import type { BaseMapType } from "~/features/map/types";

interface BaseMapSelectorProps {
  selectedMap: BaseMapType;
  onChange: (map: "standard" | "satellite") => void;
}

export function BaseMapSelector({
  selectedMap,
  onChange,
}: BaseMapSelectorProps) {
  const isDark = useColorScheme() === "dark";

  const iconColor = useMemo(() => ({
    selected: isDark ? MAP_ICON_COLORS.dark.active : MAP_ICON_COLORS.light.active,
    unselected: isDark ? MAP_ICON_COLORS.dark.inactive : MAP_ICON_COLORS.light.inactive,
  }), [isDark]);

  return (
    <View className="mb-6" testID="map-layer-basemap-selector">
      <Text className="text-sm font-semibold text-muted-foreground mb-3 tracking-wide">
        LOẠI BẢN ĐỒ
      </Text>

      <View className="flex-row gap-3">
        {/* Standard Map */}
        <TouchableOpacity
          onPress={() => onChange("standard")}
          className={`flex-1 p-4 rounded-2xl bg-card border-2 items-center gap-2 ${
            selectedMap === "standard" ? "border-primary" : "border-border"
          }`}
        >
          <View
            className={`w-12 h-12 rounded-xl items-center justify-center ${
              selectedMap === "standard" ? "bg-primary/20" : "bg-muted dark:bg-muted"
            }`}
          >
            <Ionicons
              name="map-outline"
              size={24}
              color={selectedMap === "standard" ? iconColor.selected : iconColor.unselected}
            />
          </View>
          <Text
            className={`text-sm font-semibold ${
              selectedMap === "standard" ? "text-primary" : "text-foreground"
            }`}
          >
            Tiêu chuẩn
          </Text>
        </TouchableOpacity>

        {/* Satellite Map */}
        <TouchableOpacity
          onPress={() => onChange("satellite")}
          className={`flex-1 p-4 rounded-2xl bg-card border-2 items-center gap-2 ${
            selectedMap === "satellite" ? "border-primary" : "border-border"
          }`}
        >
          <View
            className={`w-12 h-12 rounded-xl items-center justify-center ${
              selectedMap === "satellite" ? "bg-primary/20" : "bg-muted dark:bg-muted"
            }`}
          >
            <Ionicons
              name="earth"
              size={24}
              color={selectedMap === "satellite" ? iconColor.selected : iconColor.unselected}
            />
          </View>
          <Text
            className={`text-sm font-semibold ${
              selectedMap === "satellite" ? "text-primary" : "text-foreground"
            }`}
          >
            Vệ tinh
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
