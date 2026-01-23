// features/alerts/components/alert-settings/QuietHoursSection.tsx
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import type {
  AlertSettingsColors,
  QuietHours,
} from "../../types/alert-settings.types";

interface QuietHoursSectionProps {
  quietHours: QuietHours;
  onStartPress: () => void;
  onEndPress: () => void;
  colors: AlertSettingsColors;
}

export function QuietHoursSection({
  quietHours,
  onStartPress,
  onEndPress,
  colors,
}: QuietHoursSectionProps) {
  const displayTime = (time: string) => time.split(":").slice(0, 2).join(":");

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
          Giờ Yên Lặng
        </Text>
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
          <Text style={{ fontSize: 14, color: colors.subtext }}>Bắt Đầu</Text>
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
              {displayTime(quietHours.startTime)}
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
          <Text style={{ fontSize: 14, color: colors.subtext }}>Kết Thúc</Text>
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
              {displayTime(quietHours.endTime)}
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
          Cảnh báo nghiêm trọng sẽ không bị giới hạn bởi giờ yên lặng nếu mức độ
          ngập vượt ngưỡng “Critical”.
        </Text>
      </View>
    </View>
  );
}

export default QuietHoursSection;
