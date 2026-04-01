// features/map/components/controls/layers/OverlayLayerItem.tsx
import React from "react";
import { Switch, View } from "react-native";
import { Text } from "~/components/ui/text";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

interface OverlayLayerItemProps {
  label: string;
  description: string;
  value: boolean;
  color: string;
  iconName: keyof typeof Ionicons.glyphMap | keyof typeof MaterialCommunityIcons.glyphMap;
  iconLibrary?: "ionicons" | "material";
  onToggle: () => void;
  accentColor: string;
  textColor: string;
  subtextColor: string;
  cardBg: string;
  borderColor: string;
}

export function OverlayLayerItem({
  label,
  description,
  value,
  color,
  iconName,
  iconLibrary = "ionicons",
  onToggle,
  accentColor,
  textColor,
  subtextColor,
  cardBg,
  borderColor,
}: OverlayLayerItemProps) {
  const IconComponent = iconLibrary === "material" ? MaterialCommunityIcons : Ionicons;

  return (
    <View style={styles.container}>
      <View style={[styles.row, { backgroundColor: cardBg }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: `${color}20`,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconComponent name={iconName as any} size={20} color={color} />
          </View>
          <View>
            <Text style={{ fontSize: 15, fontWeight: "600", color: textColor }}>
              {label}
            </Text>
            <Text style={{ fontSize: 12, color: subtextColor }}>
              {description}
            </Text>
          </View>
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: borderColor, true: `${accentColor}80` }}
          thumbColor={value ? accentColor : "#f4f3f4"}
        />
      </View>
    </View>
  );
}

const styles = {
  container: {
    marginBottom: 0,
  },
  row: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    padding: 16,
    borderRadius: 16,
  },
};
