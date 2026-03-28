// features/map/components/controls/layers/LayerSheetHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Text } from "~/components/ui/text";

interface LayerSheetHeaderProps {
  onClose: () => void;
  accentColor: string;
  textColor: string;
  subtextColor: string;
  cardBg: string;
  borderColor: string;
}

export function LayerSheetHeader({
  onClose,
  accentColor,
  textColor,
  subtextColor,
  cardBg,
}: LayerSheetHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: subtextColor }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: `${accentColor}20`,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialIcons name="layers" size={22} color={accentColor} />
          </View>
          <View>
            <Text style={{ fontSize: 18, fontWeight: "700", color: textColor }}>
              Lớp bản đồ
            </Text>
            <Text style={{ fontSize: 12, color: subtextColor }}>
              Tùy chỉnh hiển thị
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={onClose}
          style={[styles.closeBtn, { backgroundColor: cardBg }]}
        >
          <Ionicons name="close" size={20} color={subtextColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = {
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
};
