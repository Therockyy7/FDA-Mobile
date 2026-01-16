// features/map/components/Legend.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";

// Severity levels based on water level thresholds
const SEVERITY_LEVELS = [
  {
    key: "safe",
    label: "An toàn",
    range: "< 1.0m",
    color: "#22C55E",       // Green
    bgColor: "#DCFCE7",
    icon: "checkmark-circle" as const,
  },
  {
    key: "caution",
    label: "Chú ý",
    range: "1.0 - 1.9m",
    color: "#EAB308",       // Yellow
    bgColor: "#FEF9C3",
    icon: "information-circle" as const,
  },
  {
    key: "warning",
    label: "Cảnh báo",
    range: "2.0 - 2.9m",
    color: "#F97316",       // Orange
    bgColor: "#FFEDD5",
    icon: "alert-circle" as const,
  },
  {
    key: "critical",
    label: "Nguy hiểm",
    range: "≥ 3.0m",
    color: "#EF4444",       // Red
    bgColor: "#FEE2E2",
    icon: "warning" as const,
  },
];

const Legend = () => {
  return (
    <View
      style={{
        position: "absolute",
        top: 80,
        left: 16,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
        minWidth: 170,
        borderWidth: 1,
        borderColor: "#E2E8F0",
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
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
          <MaterialCommunityIcons name="water" size={16} color="#3B82F6" />
        </View>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "800",
            color: "#1E293B",
          }}
        >
          Mức độ ngập
        </Text>
      </View>

      <View style={{ gap: 8 }}>
        {SEVERITY_LEVELS.map((level) => (
          <View key={level.key} style={{ flexDirection: "row", alignItems: "center" }}>
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
                style={{
                  fontSize: 10,
                  color: "#64748B",
                }}
              >
                {level.range}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Divider */}
      <View
        style={{
          height: 1,
          backgroundColor: "#E2E8F0",
          marginVertical: 12,
        }}
      />

      {/* Tips */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name="finger-print-outline" size={12} color="#94A3B8" />
        <Text
          style={{
            fontSize: 10,
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
