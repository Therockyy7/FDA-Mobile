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

// FDA brand primary — matches TAB_COLORS.light.active / tailwind `primary` token
const ACTIVE_COLOR = "#0077BE";

const CHANNEL_ITEMS = [
  {
    key: "push" as const,
    activeIcon: "notifications" as const,
    inactiveIcon: "notifications-off" as const,
    activeLabel: "Push",
    inactiveLabel: "Push Off",
  },
  {
    key: "email" as const,
    activeIcon: "mail" as const,
    inactiveIcon: "mail" as const,
    activeLabel: "Email",
    inactiveLabel: "Email Off",
  },
  {
    key: "sms" as const,
    activeIcon: "chatbubble" as const,
    inactiveIcon: "chatbubble" as const,
    activeLabel: "SMS",
    inactiveLabel: "SMS Off",
  },
];

export function AlertChannelsStatus({ channels }: AlertChannelsStatusProps) {
  const { isDarkColorScheme } = useColorScheme();
  // JS color needed for Ionicons — not expressible as NativeWind class
  const inactiveColor = isDarkColorScheme ? "#6B7280" : "#9CA3AF";

  return (
    <View
      className="flex-row flex-wrap gap-4 justify-center items-center w-full mb-3"
      testID="alerts-channels-status"
    >
      {CHANNEL_ITEMS.map((item) => {
        // Safely access channel status with optional chaining
        const isActive = channels?.[item.key] ?? false;
        return (
          <View
            key={item.key}
            className="flex-row items-center gap-1.5"
            testID={`alerts-channels-${item.key}`}
          >
            <Ionicons
              name={isActive ? item.activeIcon : item.inactiveIcon}
              size={16}
              color={isActive ? ACTIVE_COLOR : inactiveColor}
            />
            <Text
              className={
                isActive
                  ? "text-xs font-semibold text-primary"
                  : "text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark"
              }
              testID={`alerts-channels-${item.key}-label`}
            >
              {isActive ? item.activeLabel : item.inactiveLabel}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default AlertChannelsStatus;
