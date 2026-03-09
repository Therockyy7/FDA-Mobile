// features/alerts/components/AlertChannelsStatus.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import type { NotificationChannels } from "../types/alert-settings.types";

interface AlertChannelsStatusProps {
  channels: NotificationChannels;
}

export function AlertChannelsStatus({ channels }: AlertChannelsStatusProps) {
  const { isDarkColorScheme } = useColorScheme();

  const colors = {
    active: "#3B82F6",
    inactive: isDarkColorScheme ? "#64748B" : "#9CA3AF",
  };

  const items = [
    {
      key: "push",
      label: channels.push ? "Push" : "Push Off",
      icon: channels.push ? "notifications" : "notifications-off",
      active: channels.push,
    },
    {
      key: "email",
      label: channels.email ? "Email" : "Email Off",
      icon: "mail",
      active: channels.email,
    },
    {
      key: "sms",
      label: channels.sms ? "SMS" : "SMS Off",
      icon: "chatbubble",
      active: channels.sms,
    },
  ] as const;

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 16,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        marginBottom: 12,
      }}
    >
      {items.map((item) => (
        <View
          key={item.key}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Ionicons
            name={item.icon}
            size={16}
            color={item.active ? colors.active : colors.inactive}
          />
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: item.active ? colors.active : colors.inactive,
            }}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default AlertChannelsStatus;
