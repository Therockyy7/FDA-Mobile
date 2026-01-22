// features/alerts/components/alert-settings/QuietHoursSection.tsx
import React from "react";
import { Switch, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import type {
    AlertSettingsColors,
    QuietHours,
} from "../../types/alert-settings.types";

interface QuietHoursSectionProps {
  quietHours: QuietHours;
  onToggle: (enabled: boolean) => void;
  onStartPress: () => void;
  onEndPress: () => void;
  colors: AlertSettingsColors;
}

export function QuietHoursSection({
  quietHours,
  onToggle,
  onStartPress,
  onEndPress,
  colors,
}: QuietHoursSectionProps) {
  return (
    <View style={{ marginTop: 32, paddingHorizontal: 20 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
          paddingHorizontal: 16,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: "700",
            color: colors.subtext,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Quiet Hours
        </Text>
        <Switch
          value={quietHours.enabled}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.cardBg}
        />
      </View>

      <View
        style={{
          backgroundColor: colors.cardBg,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 14, color: colors.subtext }}>Start Time</Text>
          <TouchableOpacity
            onPress={onStartPress}
            activeOpacity={0.8}
            style={{
              backgroundColor: colors.mutedBg,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.divider,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: colors.primary,
                fontFamily: "monospace",
              }}
            >
              {quietHours.startTime}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            height: 1,
            backgroundColor: colors.divider,
            marginBottom: 16,
          }}
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ fontSize: 14, color: colors.subtext }}>End Time</Text>
          <TouchableOpacity
            onPress={onEndPress}
            activeOpacity={0.8}
            style={{
              backgroundColor: colors.mutedBg,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.divider,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: colors.primary,
                fontFamily: "monospace",
              }}
            >
              {quietHours.endTime}
            </Text>
          </TouchableOpacity>
        </View>

        <Text
          style={{
            fontSize: 11,
            color: colors.subtext,
            marginTop: 16,
            lineHeight: 16,
          }}
        >
          Critical alerts will bypass quiet hours if the flood severity exceeds "Critical"
          thresholds.
        </Text>
      </View>
    </View>
  );
}

export default QuietHoursSection;
