import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";

interface StreetViewHintProps {
  visible: boolean;
}

export function StreetViewHint({ visible }: StreetViewHintProps) {
  if (!visible) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 80,
        right: 16,
        backgroundColor: "rgba(245, 158, 11, 0.95)",
        borderRadius: 16,
        padding: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
        maxWidth: 200,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Ionicons name="eye" size={16} color="white" />
      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          color: "white",
          flex: 1,
        }}
      >
        Nhấn marker để xem Street View
      </Text>
    </View>
  );
}
