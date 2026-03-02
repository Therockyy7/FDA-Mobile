// features/alerts/components/alert-history/AlertHistoryChannelsRow.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import type { AlertHistoryNotification } from "../../types/alert-history.types";

interface AlertHistoryChannelsRowProps {
  channels: AlertHistoryNotification[];
  subtext: string;
}

export function AlertHistoryChannelsRow({
  channels,
  subtext,
}: AlertHistoryChannelsRowProps) {
  return (
    <View style={{ flexDirection: "row", gap: 16, flexWrap: "wrap" }}>
      {channels.map((channel) => {
        const ok = channel.statusName === "sent";
        return (
          <View
            key={channel.notificationId}
            style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
          >
            <Ionicons
              name={ok ? "checkmark-circle" : "alert-circle"}
              size={14}
              color={ok ? "#22C55E" : "#EF4444"}
            />
            <Text style={{ fontSize: 11, color: subtext }}>
              {channel.channelName} {ok ? "Sent" : channel.statusName}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default AlertHistoryChannelsRow;
