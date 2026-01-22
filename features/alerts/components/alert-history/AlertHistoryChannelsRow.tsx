// features/alerts/components/alert-history/AlertHistoryChannelsRow.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import type { AlertHistoryChannel } from "../../types/alert-history.types";

interface AlertHistoryChannelsRowProps {
  channels: AlertHistoryChannel[];
  subtext: string;
}

export function AlertHistoryChannelsRow({
  channels,
  subtext,
}: AlertHistoryChannelsRowProps) {
  return (
    <View style={{ flexDirection: "row", gap: 16 }}>
      {channels.map((channel) => {
        const ok = channel.status === "sent";
        return (
          <View
            key={`${channel.type}-${channel.status}`}
            style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
          >
            <Ionicons
              name={ok ? "checkmark-circle" : "alert-circle"}
              size={14}
              color={ok ? "#22C55E" : "#EF4444"}
            />
            <Text style={{ fontSize: 11, color: subtext }}>
              {channel.type === "push"
                ? "Push"
                : channel.type === "email"
                  ? "Email"
                  : "SMS"}{" "}
              {ok ? "Sent" : "Failed"}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default AlertHistoryChannelsRow;
