// features/map/components/routes/SafeRouteWarnings.tsx

import React from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "~/components/ui/text";
import type { FloodWarningDto } from "../../types/safe-route.types";

interface SafeRouteWarningsProps {
  warnings: FloodWarningDto[];
  visible: boolean;
  onClose: () => void;
}

export function SafeRouteWarnings({
  warnings,
  visible,
  onClose,
}: SafeRouteWarningsProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
        onPress={onClose}
      />

      {/* Sheet */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingBottom: Platform.OS === "ios" ? 40 : 20,
        }}
      >
        {/* Handle */}
        <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 8 }}>
          <View
            style={{
              width: 42,
              height: 5,
              backgroundColor: "#E5E7EB",
              borderRadius: 999,
            }}
          />
        </View>

        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: "#F1F5F9",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="warning" size={20} color="#D97706" />
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>
              Cảnh báo ngập ({warnings.length})
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={22} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Warning List */}
        <ScrollView
          style={{ maxHeight: 400 }}
          contentContainerStyle={{ padding: 16, gap: 10 }}
        >
          {warnings.map((warning) => {
            const isCritical = warning.severity === "critical";
            const bgColor = isCritical ? "#FEF2F2" : "#FFF7ED";
            const accentColor = isCritical ? "#EF4444" : "#F97316";
            const textColor = isCritical ? "#991B1B" : "#9A3412";

            return (
              <View
                key={warning.stationId}
                style={{
                  backgroundColor: bgColor,
                  borderRadius: 14,
                  padding: 14,
                  borderLeftWidth: 4,
                  borderLeftColor: accentColor,
                }}
              >
                {/* Station Name */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 8,
                  }}
                >
                  <Ionicons
                    name={isCritical ? "alert-circle" : "warning"}
                    size={16}
                    color={accentColor}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: textColor,
                      flex: 1,
                    }}
                  >
                    {warning.stationName}
                  </Text>
                  <View
                    style={{
                      backgroundColor: accentColor + "20",
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 999,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "700",
                        color: accentColor,
                      }}
                    >
                      {isCritical ? "NGUY HIỂM" : "CẢNH BÁO"}
                    </Text>
                  </View>
                </View>

                {/* Details */}
                <View style={{ flexDirection: "row", gap: 16 }}>
                  <DetailItem
                    icon="water"
                    label="Mực nước"
                    value={`${warning.waterLevel} ${warning.unit}`}
                    color={accentColor}
                  />
                  <DetailItem
                    icon="locate-outline"
                    label="Khoảng cách"
                    value={`${Math.round(warning.distanceFromRoute)}m`}
                    color="#64748B"
                  />
                  <DetailItem
                    icon="alert-circle"
                    label="Mức độ"
                    value={warning.severityLevel === 3 ? "Nghiêm trọng" : "Cảnh báo"}
                    color="#64748B"
                  />
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

function DetailItem({
  icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <Ionicons name={icon} size={12} color={color} />
      <View>
        <Text style={{ fontSize: 10, color: "#9CA3AF" }}>{label}</Text>
        <Text style={{ fontSize: 12, fontWeight: "600", color: "#374151" }}>
          {value}
        </Text>
      </View>
    </View>
  );
}
