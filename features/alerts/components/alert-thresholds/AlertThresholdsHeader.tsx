import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";

interface AlertThresholdsHeaderProps {
  title: string;
  topInset: number;
  colors: {
    overlay: string;
    borderSoft: string;
    text: string;
  };
  onBack: () => void;
}

export function AlertThresholdsHeader({
  title,
  topInset,
  colors,
  onBack,
}: AlertThresholdsHeaderProps) {
  const safeTop = Math.max(topInset - 6, 0);

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: colors.overlay,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderSoft,
        paddingTop: safeTop,
      }}
    >
      <View
        style={{
          height: 52,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}
          onPress={onBack}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <Text style={{ flex: 1, textAlign: "center", fontSize: 16, fontWeight: "800", color: colors.text }}>
          {title}
        </Text>

        <View style={{ width: 40, height: 40 }} />
      </View>
    </View>
  );
}

export default AlertThresholdsHeader;
