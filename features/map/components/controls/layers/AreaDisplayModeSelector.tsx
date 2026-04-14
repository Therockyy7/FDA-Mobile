// features/map/components/controls/layers/AreaDisplayModeSelector.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { TouchableOpacity, View, useColorScheme } from "react-native";
import { Text } from "~/components/ui/text";
import { MAP_ICON_COLORS } from "~/lib/design-tokens";

interface AreaDisplayModeSelectorProps {
  selectedMode: "user" | "admin";
  onChange: (mode: "user" | "admin") => void;
}

export function AreaDisplayModeSelector({
  selectedMode,
  onChange,
}: AreaDisplayModeSelectorProps) {
  const isDark = useColorScheme() === "dark";

  const iconColor = useMemo(() => ({
    selected: isDark ? MAP_ICON_COLORS.dark.active : MAP_ICON_COLORS.light.active,
    unselected: isDark ? MAP_ICON_COLORS.dark.inactive : MAP_ICON_COLORS.light.inactive,
  }), [isDark]);

  return (
    <View className="mb-6" testID="map-layer-areadisplay-selector">
      <Text className="text-sm font-semibold text-muted-foreground mb-3 tracking-wide">
        CHẾ ĐỘ KHU VỰC
      </Text>

      <View className="flex-row gap-3">
        {/* User Areas */}
        <TouchableOpacity
          onPress={() => onChange("user")}
          className={`flex-1 p-4 rounded-2xl bg-card border-2 items-center gap-2 ${
            selectedMode === "user" ? "border-primary" : "border-border"
          }`}
        >
          <View
            className={`w-12 h-12 rounded-xl items-center justify-center ${
              selectedMode === "user" ? "bg-primary/20" : "bg-muted dark:bg-muted"
            }`}
          >
            <Ionicons
              name="person-circle"
              size={24}
              color={selectedMode === "user" ? iconColor.selected : iconColor.unselected}
            />
          </View>
          <Text
            className={`text-sm font-semibold text-center ${
              selectedMode === "user" ? "text-primary" : "text-foreground"
            }`}
          >
            Khu vực của tôi
          </Text>
        </TouchableOpacity>

        {/* Admin Areas */}
        <TouchableOpacity
          onPress={() => onChange("admin")}
          className={`flex-1 p-4 rounded-2xl bg-card border-2 items-center gap-2 ${
            selectedMode === "admin" ? "border-primary" : "border-border"
          }`}
        >
          <View
            className={`w-12 h-12 rounded-xl items-center justify-center ${
              selectedMode === "admin" ? "bg-primary/20" : "bg-muted dark:bg-muted"
            }`}
          >
            <MaterialCommunityIcons
              name="shield-crown"
              size={24}
              color={selectedMode === "admin" ? iconColor.selected : iconColor.unselected}
            />
          </View>
          <Text
            className={`text-sm font-semibold text-center ${
              selectedMode === "admin" ? "text-primary" : "text-foreground"
            }`}
          >
            Dự báo AI
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row items-start p-3 rounded-xl bg-primary/10 gap-2 mt-3">
        <Ionicons name="information-circle" size={16} color={iconColor.selected} />
        <Text className="flex-1 text-[11px] text-muted-foreground leading-4">
          {selectedMode === "user"
            ? "Hiển thị các khu vực bạn đã tạo"
            : "Hiển thị các khu vực được Admin phân tích sẵn với AI"}
        </Text>
      </View>
    </View>
  );
}
