// features/map/components/stations/cards/SelectedSensorCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Animated, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { Sensor } from "~/features/map/constants/map-data";
import { getStatusColor } from "~/features/map/lib/map-utils";
import { CARD_SHADOW, RADIUS, STATUS_BADGE, useMapColors } from "~/features/map/lib/map-ui-utils";

interface SelectedSensorCardProps {
  sensor: Sensor;
  slideAnim: Animated.Value;
  onClose: () => void;
}

const STATUS_LABEL: Record<string, string> = {
  safe: "AN TOÀN",
  warning: "CẢNH BÁO",
  danger: "NGUY HIỂM",
};

export function SelectedSensorCard({ sensor, slideAnim, onClose }: SelectedSensorCardProps) {
  const colors = useMapColors();
  const status = getStatusColor(sensor.status);

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: 100,
        left: 16,
        right: 16,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <View
        style={[
          CARD_SHADOW,
          {
            backgroundColor: colors.card,
            borderRadius: RADIUS.card,
            padding: 16,
          },
        ]}
      >
        {/* Top strip */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            backgroundColor: status.main,
            borderTopLeftRadius: RADIUS.card,
            borderTopRightRadius: RADIUS.card,
          }}
        />

        {/* Header Row */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 2,
            marginBottom: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 2 }}>
              {sensor.name}
            </Text>
            <Text style={{ fontSize: 12, color: colors.subtext }}>
              {sensor.location}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={{
              width: 28,
              height: 28,
              backgroundColor: colors.border,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={16} color={colors.subtext} />
          </TouchableOpacity>
        </View>

        {/* Water Level + Stats Row */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          {/* Water Level Box */}
          <View
            style={{
              backgroundColor: status.bg,
              padding: 12,
              borderRadius: RADIUS.chip,
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: "900", color: status.main }}>
              {sensor.waterLevel}
            </Text>
            <Text style={{ fontSize: 10, color: status.text, marginTop: 2 }}>cm</Text>
          </View>

          {/* Right stats */}
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <View>
                <Text style={{ fontSize: 10, color: colors.muted }}>Nhiệt độ</Text>
                <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>
                  {sensor.temperature}°C
                </Text>
              </View>
              <View>
                <Text style={{ fontSize: 10, color: colors.muted }}>Độ ẩm</Text>
                <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>
                  {sensor.humidity}%
                </Text>
              </View>
            </View>
            {/* Progress Bar */}
            <View
              style={{
                height: 6,
                backgroundColor: colors.border,
                borderRadius: RADIUS.progress,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${(sensor.waterLevel / sensor.maxLevel) * 100}%`,
                  height: "100%",
                  backgroundColor: status.main,
                  borderRadius: RADIUS.progress,
                }}
              />
            </View>
          </View>
        </View>

        {/* Status Badge — standard pattern */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "flex-start",
            backgroundColor: status.bg,
            paddingHorizontal: STATUS_BADGE.paddingHorizontal,
            paddingVertical: STATUS_BADGE.paddingVertical,
            borderRadius: STATUS_BADGE.borderRadius,
            marginTop: 12,
            gap: 5,
          }}
        >
          <View
            style={{
              width: STATUS_BADGE.dotSize,
              height: STATUS_BADGE.dotSize,
              borderRadius: 3,
              backgroundColor: status.main,
            }}
          />
          <Ionicons name="radio-button-on" size={STATUS_BADGE.fontSize + 2} color={status.main} />
          <Text
            style={{
              fontSize: STATUS_BADGE.fontSize,
              fontWeight: STATUS_BADGE.fontWeight,
              color: status.main,
              letterSpacing: STATUS_BADGE.letterSpacing,
            }}
          >
            {STATUS_LABEL[sensor.status] ?? STATUS_LABEL.safe}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}
