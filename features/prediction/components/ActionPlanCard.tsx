import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import React from "react";
import { View, Text } from "react-native";
import { useColorScheme } from "~/lib/useColorScheme";
import type { ActionPlan } from "../types/prediction.types";

interface ActionPlanCardProps {
  actionPlan: ActionPlan;
}

export function ActionPlanCard({ actionPlan }: ActionPlanCardProps) {
  const { isDarkColorScheme } = useColorScheme();

  const evacuationColor =
    actionPlan.evacuation_status === "CRITICAL"
      ? "#DC2626"
      : actionPlan.evacuation_status === "RECOMMENDED"
        ? "#EA580C"
        : "#16A34A";

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", delay: 500, duration: 500 }}
    >
      <View
        style={{
          backgroundColor: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
          borderRadius: 24,
          padding: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: "#10B98120",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Ionicons name="checkmark-done" size={20} color="#10B981" />
          </View>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "800",
              color: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
            }}
          >
            Kế Hoạch Hành Động
          </Text>
        </View>

        {/* Immediate Actions */}
        <View style={{ gap: 10, marginBottom: 16 }}>
          {actionPlan.immediate_actions.map((action, index) => (
            <MotiView
              key={index}
              from={{ opacity: 0, translateX: -15 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{
                type: "timing",
                delay: 600 + index * 80,
                duration: 400,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  backgroundColor: isDarkColorScheme ? "#334155" : "#F8FAFC",
                  borderRadius: 12,
                  padding: 14,
                }}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: "#10B98120",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "800",
                      color: "#10B981",
                    }}
                  >
                    {index + 1}
                  </Text>
                </View>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 14,
                    fontWeight: "600",
                    color: isDarkColorScheme ? "#E2E8F0" : "#334155",
                    lineHeight: 22,
                  }}
                >
                  {action}
                </Text>
              </View>
            </MotiView>
          ))}
        </View>

        {/* Alert Thresholds & Evacuation */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          {/* Alert Thresholds */}
          <View
            style={{
              flex: 1,
              backgroundColor: isDarkColorScheme ? "#334155" : "#F1F5F9",
              borderRadius: 12,
              padding: 12,
            }}
          >
            <Ionicons
              name="alert-circle"
              size={18}
              color="#F59E0B"
              style={{ marginBottom: 6 }}
            />
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                color: isDarkColorScheme ? "#94A3B8" : "#64748B",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 4,
              }}
            >
              Ngưỡng cảnh báo
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: isDarkColorScheme ? "#E2E8F0" : "#334155",
                lineHeight: 20,
              }}
            >
              Mưa: {actionPlan.alert_thresholds.next_trigger_mm}mm{"\n"}
              Nước: {actionPlan.alert_thresholds.critical_water_level_m}m
            </Text>
          </View>

          {/* Evacuation Status */}
          <View
            style={{
              flex: 1,
              backgroundColor: `${evacuationColor}12`,
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: `${evacuationColor}30`,
            }}
          >
            <Ionicons
              name={
                actionPlan.evacuation_status === "Not required"
                  ? "shield-checkmark"
                  : "exit"
              }
              size={18}
              color={evacuationColor}
              style={{ marginBottom: 6 }}
            />
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                color: isDarkColorScheme ? "#94A3B8" : "#64748B",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 4,
              }}
            >
              Di tản
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "800",
                color: evacuationColor,
              }}
            >
              {actionPlan.evacuation_status === "Not required"
                ? "Không cần"
                : actionPlan.evacuation_status}
            </Text>
          </View>
        </View>

        {/* Manual verification badge */}
        {actionPlan.manual_verification_required && (
          <View
            style={{
              marginTop: 12,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: isDarkColorScheme ? "rgba(245, 158, 11, 0.1)" : "#FFFBEB",
              borderRadius: 10,
              padding: 10,
              gap: 8,
            }}
          >
            <Ionicons name="eye" size={16} color="#F59E0B" />
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: "#F59E0B",
              }}
            >
              Cần xác minh thủ công bởi chuyên gia
            </Text>
          </View>
        )}
      </View>
    </MotiView>
  );
}
