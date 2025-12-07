// features/notifications/components/NotificationMetadata.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";

interface NotificationMetadataProps {
  waterLevel?: number;
  affectedArea?: string;
}

export function NotificationMetadata({
  waterLevel,
  affectedArea,
}: NotificationMetadataProps) {
  if (!waterLevel && !affectedArea) return null;

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 12,
        marginBottom: 12,
      }}
    >
      {waterLevel && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F3F4F6",
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 8,
          }}
        >
          <MaterialCommunityIcons name="waves" size={16} color="#3B82F6" />
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: "#1F2937",
              marginLeft: 6,
            }}
          >
            {waterLevel}cm
          </Text>
        </View>
      )}
      {affectedArea && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F3F4F6",
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 8,
          }}
        >
          <Ionicons name="resize" size={14} color="#6B7280" />
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: "#6B7280",
              marginLeft: 6,
            }}
          >
            {affectedArea}
          </Text>
        </View>
      )}
    </View>
  );
}
