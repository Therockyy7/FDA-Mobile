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
    <View testID="alerts-history-channels-row" className="flex-row gap-4 flex-wrap">
      {channels.map((channel) => {
        const ok = channel.statusName === "sent";
        return (
          <View
            key={channel.notificationId}
            testID={`alerts-history-channel-${channel.channelName}`}
            className="flex-row items-center gap-1.5"
          >
            <Ionicons
              name={ok ? "checkmark-circle" : "alert-circle"}
              size={14}
              color={ok ? "#22C55E" : "#EF4444"}
            />
            <Text className="text-caption text-slate-600 dark:text-slate-400">
              {channel.channelName} {ok ? "Sent" : channel.statusName}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default AlertHistoryChannelsRow;
