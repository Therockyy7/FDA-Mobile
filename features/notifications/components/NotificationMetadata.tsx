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
      testID="notifications-metadata-container"
      style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}
    >
      {waterLevel && (
        <View
          testID="notifications-metadata-water-level"
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 8,
          }}
          className="bg-slate-100 dark:bg-slate-800"
        >
          <MaterialCommunityIcons name="waves" size={16} color="#007AFF" />
          <Text
            testID="notifications-metadata-water-level-value"
            style={{ fontSize: 12, fontWeight: "700", marginLeft: 6 }}
            className="text-slate-900 dark:text-slate-100"
          >
            {waterLevel}cm
          </Text>
        </View>
      )}
      {affectedArea && (
        <View
          testID="notifications-metadata-affected-area"
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 8,
          }}
          className="bg-slate-100 dark:bg-slate-800"
        >
          <Ionicons name="resize" size={14} color="#6B7280" />
          <Text
            testID="notifications-metadata-affected-area-value"
            style={{ fontSize: 12, fontWeight: "600", marginLeft: 6 }}
            className="text-slate-500 dark:text-slate-400"
          >
            {affectedArea}
          </Text>
        </View>
      )}
    </View>
  );
}
