// features/map/components/controls/layers/OverlayLayerItem.tsx
import React, { useMemo } from "react";
import { Switch, View, useColorScheme } from "react-native";
import { Text } from "~/components/ui/text";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { MAP_COLORS, MAP_OVERLAY_LAYER_COLORS } from "~/lib/design-tokens";

interface OverlayLayerItemProps {
  label: string;
  description: string;
  value: boolean;
  /** Design token key: "primary" | "warning" | "purple" | "success" */
  colorToken: keyof typeof MAP_OVERLAY_LAYER_COLORS;
  iconName: keyof typeof Ionicons.glyphMap | keyof typeof MaterialCommunityIcons.glyphMap;
  iconLibrary?: "ionicons" | "material";
  onToggle: () => void;
  testID?: string;
}

export function OverlayLayerItem({
  label,
  description,
  value,
  colorToken,
  iconName,
  iconLibrary = "ionicons",
  onToggle,
  testID,
}: OverlayLayerItemProps) {
  const isDark = useColorScheme() === "dark";
  const IconComponent = iconLibrary === "material" ? MaterialCommunityIcons : Ionicons;
  const color = MAP_OVERLAY_LAYER_COLORS[colorToken];

  const switchColors = useMemo(() => {
    const palette = isDark ? MAP_COLORS.dark : MAP_COLORS.light;
    return {
      false: palette.border,
      true: `${color}80`,
    };
  }, [isDark, color]);

  const thumbColor = useMemo(() => {
    return value ? color : (isDark ? "#64748B" : "#f4f3f4");
  }, [value, color, isDark]);

  return (
    <View testID={testID}>
      <View className="flex-row items-center justify-between p-4 rounded-2xl bg-card">
        <View className="flex-row items-center gap-3">
          <View
            className="w-10 h-10 rounded-[10px] items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <IconComponent name={iconName as any} size={20} color={color} />
          </View>
          <View>
            <Text className="text-[15px] font-semibold text-foreground">
              {label}
            </Text>
            <Text className="text-xs text-muted-foreground">
              {description}
            </Text>
          </View>
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={switchColors}
          thumbColor={thumbColor}
        />
      </View>
    </View>
  );
}
