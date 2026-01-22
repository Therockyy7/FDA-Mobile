// features/alerts/components/alert-settings/NotificationChannelsSection.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Switch, View } from "react-native";
import { Text } from "~/components/ui/text";
import type {
  AlertSettingsColors,
  NotificationChannels,
} from "../../types/alert-settings.types";

interface NotificationChannelsSectionProps {
  notificationChannels: NotificationChannels;
  onChange: (channels: NotificationChannels) => void;
  colors: AlertSettingsColors;
}

export function NotificationChannelsSection({
  notificationChannels,
  onChange,
  colors,
}: NotificationChannelsSectionProps) {
  return (
    <View style={{ marginTop: 32 }}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: "700",
          color: colors.subtext,
          textTransform: "uppercase",
          letterSpacing: 1,
          paddingHorizontal: 20,
          paddingBottom: 12,
        }}
      >
        Notification Channels
      </Text>
      <View
        style={{
          backgroundColor: colors.cardBg,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: colors.border,
          marginHorizontal: 20,
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {/* Push Notifications */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: `${colors.primary}15`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="notifications" size={18} color={colors.primary} />
            </View>
            <Text style={{ fontSize: 15, fontWeight: "500", color: colors.text }}>
              Push Notifications
            </Text>
          </View>
          <Switch
            value={notificationChannels.push}
            onValueChange={(value) =>
              onChange({ ...notificationChannels, push: value })
            }
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.cardBg}
          />
        </View>

        {/* Email Alerts */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: "#8B5CF615",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="mail" size={18} color="#8B5CF6" />
            </View>
            <Text style={{ fontSize: 15, fontWeight: "500", color: colors.text }}>
              Email Alerts
            </Text>
          </View>
          <Switch
            value={notificationChannels.email}
            onValueChange={(value) =>
              onChange({ ...notificationChannels, email: value })
            }
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.cardBg}
          />
        </View>

        {/* SMS Messages */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: "#10B98115",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="chatbubble" size={18} color="#10B981" />
            </View>
            <Text style={{ fontSize: 15, fontWeight: "500", color: colors.text }}>
              SMS Messages
            </Text>
          </View>
          <Switch
            value={notificationChannels.sms}
            onValueChange={(value) =>
              onChange({ ...notificationChannels, sms: value })
            }
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.cardBg}
          />
        </View>
      </View>
    </View>
  );
}

export default NotificationChannelsSection;
