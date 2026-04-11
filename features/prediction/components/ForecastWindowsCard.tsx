import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { ForecastWindow } from "../types/prediction.types";

interface Props {
  windows: ForecastWindow[];
  evaluatedAt: string;
}

const WINDOW_STATUS_COLOR: Record<string, string> = {
  Normal: "#10B981",
  Moderate: "#F59E0B",
  High: "#EF4444",
  Critical: "#7C3AED",
};

const WINDOW_LABEL: Record<string, string> = {
  Normal: "Bình thường",
  Moderate: "Cảnh báo",
  High: "Nguy hiểm",
  Critical: "Rất nguy hiểm",
};

export function ForecastWindowsCard({ windows, evaluatedAt }: Props) {
  const { isDarkColorScheme } = useColorScheme();
  const bg = isDarkColorScheme ? "#1E293B" : "#FFFFFF";
  const muted = isDarkColorScheme ? "#94A3B8" : "#64748B";
  const text = isDarkColorScheme ? "#F1F5F9" : "#0F172A";

  const evalDate = new Date(evaluatedAt);
  const evalStr = evalDate.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: 20,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 14,
          gap: 8,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: isDarkColorScheme ? "#0F172A" : "#EFF6FF",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="time" size={16} color="#3B82F6" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: "800", color: text }}>
            Dự báo theo giờ
          </Text>
          <Text style={{ fontSize: 11, color: muted }}>
            Cập nhật lúc {evalStr}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 8 }}>
        {windows.map((w) => {
          const color = WINDOW_STATUS_COLOR[w.status] ?? "#94A3B8";
          const prob = Math.round(w.probability * 100);
          return (
            <View
              key={w.horizon}
              style={{
                flex: 1,
                backgroundColor: isDarkColorScheme ? "#0F172A" : "#F8FAFC",
                borderRadius: 14,
                padding: 12,
                alignItems: "center",
                borderTopWidth: 3,
                borderTopColor: color,
                gap: 4,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "900", color: color }}>
                {prob}%
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: text,
                  textAlign: "center",
                }}
              >
                {WINDOW_LABEL[w.status] ?? w.status}
              </Text>
              <View
                style={{
                  backgroundColor: isDarkColorScheme ? "#1E293B" : "#E2E8F0",
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "700", color: muted }}>
                  +{w.horizon}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
