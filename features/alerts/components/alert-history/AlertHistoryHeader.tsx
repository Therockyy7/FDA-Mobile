// features/alerts/components/alert-history/AlertHistoryHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";

interface AlertHistoryHeaderProps {
  title: string;
  onBack: () => void;
  onFilter?: () => void;
  colors: {
    text: string;
    primary: string;
    border: string;
    backgroundOverlay: string;
  };
  topInset: number;
}

export function AlertHistoryHeader({
  title,
  onBack,
  onFilter,
  colors,
  topInset,
}: AlertHistoryHeaderProps) {
  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        paddingHorizontal: 16,
        paddingTop: topInset + 4,
        paddingBottom: 8,
        backgroundColor: colors.backgroundOverlay,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onBack}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="chevron-back" size={18} color={colors.primary} />
          </TouchableOpacity>

          <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>
            {title}
          </Text>
        </View>

        {onFilter && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onFilter}
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(19,127,236,0.10)",
            }}
          >
            <Ionicons name="options-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default AlertHistoryHeader;
