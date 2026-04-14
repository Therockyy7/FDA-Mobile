// features/map/components/controls/Legend.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { SHADOW } from "~/lib/design-tokens";

// Severity levels based on water level thresholds
const SEVERITY_LEVELS = [
  {
    key: "safe",
    label: "An toàn",
    range: "< 10 cm",
    color: "#22C55E",
    bgColor: "#DCFCE7",
    icon: "checkmark-circle" as const,
  },
  {
    key: "caution",
    label: "Chú ý",
    range: "10-20 cm",
    color: "#EAB308",
    bgColor: "#FEF9C3",
    icon: "information-circle" as const,
  },
  {
    key: "warning",
    label: "Cảnh báo",
    range: "20-40 cm",
    color: "#F97316",
    bgColor: "#FFEDD5",
    icon: "alert-circle" as const,
  },
  {
    key: "critical",
    label: "Nguy hiểm",
    range: "≥ 40 cm",
    color: "#EF4444",
    bgColor: "#FEE2E2",
    icon: "warning" as const,
  },
];

const Legend = () => {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <View
      className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]"
      style={[
        SHADOW.sm,
        {
          position: "absolute",
          top: 80,
          left: 16,
          borderRadius: 16,
          padding: 16,
          minWidth: 170,
        },
      ]}
      testID="map-legend"
    >
      {/* Header */}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            backgroundColor: "#EFF6FF",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 8,
          }}
        >
          <MaterialCommunityIcons name="water" size={16} color="#007AFF" />
        </View>
        <Text
          className="text-[#1E293B] dark:text-[#F1F5F9] font-extrabold"
          style={{ fontSize: 13 }}
        >
          Mức độ ngập
        </Text>
      </View>

      <View style={{ gap: 8 }}>
        {SEVERITY_LEVELS.map((level) => (
          <View
            key={level.key}
            testID={`map-legend-item-${level.key}`}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                backgroundColor: level.bgColor,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10,
                borderWidth: 1.5,
                borderColor: level.color,
              }}
            >
              <Ionicons name={level.icon} size={16} color={level.color} />
            </View>
            <View>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: level.color,
                }}
              >
                {level.label}
              </Text>
              <Text
                className="text-[#64748B] dark:text-[#94A3B8]"
                style={{ fontSize: 11 }}
              >
                {level.range}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Divider */}
      <View
        className="bg-[#E2E8F0] dark:bg-[#334155]"
        style={{ height: 1, marginVertical: 12 }}
      />

      {/* Tips */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name="finger-print-outline" size={12} color="#94A3B8" />
        <Text
          style={{
            fontSize: 11,
            color: "#94A3B8",
            marginLeft: 6,
          }}
        >
          Nhấn vào trạm để xem chi tiết
        </Text>
      </View>
    </View>
  );
};

export default Legend;
