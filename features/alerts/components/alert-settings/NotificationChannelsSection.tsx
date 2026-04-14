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
    <View testID="alerts-settings-channels-section" style={{ marginTop: 32 }}>
      <Text
        testID="alerts-settings-channels-label"
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
        Kênh Thông Báo
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
          testID="alerts-settings-channel-push"
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
            <Text
              style={{ fontSize: 16, fontWeight: "500", color: colors.text }}
            >
              Push Notifications
            </Text>
          </View>
          <Switch
            testID="alerts-settings-channel-push-toggle"
            value={notificationChannels.push ?? false}
            onValueChange={(value) =>
              onChange({ ...notificationChannels, push: value })
            }
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.cardBg}
          />
        </View>

        {/* Email Alerts */}
        <View
          testID="alerts-settings-channel-email"
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
              className="w-8 h-8 rounded-lg bg-violet-500/10 items-center justify-center"
            >
              <Ionicons name="mail" size={18} color="#8B5CF6" />
            </View>
            <Text
              style={{ fontSize: 16, fontWeight: "500", color: colors.text }}
            >
              Email Alerts
            </Text>
          </View>
          <Switch
            testID="alerts-settings-channel-email-toggle"
            value={notificationChannels.email ?? false}
            onValueChange={(value) =>
              onChange({ ...notificationChannels, email: value })
            }
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.cardBg}
          />
        </View>

        {/* SMS Messages */}
        <View
          testID="alerts-settings-channel-sms"
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View
              className="w-8 h-8 rounded-lg bg-emerald-500/10 items-center justify-center"
            >
              <Ionicons name="chatbubble" size={18} color="#10B981" />
            </View>
            <Text
              style={{ fontSize: 16, fontWeight: "500", color: colors.text }}
            >
              SMS Messages
            </Text>
          </View>
          <Switch
            testID="alerts-settings-channel-sms-toggle"
            value={notificationChannels.sms ?? false}
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
