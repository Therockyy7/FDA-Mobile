import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React from "react";
import { View, Text } from "react-native";
import { useColorScheme } from "~/lib/useColorScheme";

interface ConclusionCardProps {
  icon: string;
  text: string;
}

export function ConclusionCard({ icon, text }: ConclusionCardProps) {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", delay: 600, damping: 20 }}
    >
      <LinearGradient
        colors={
          isDarkColorScheme
            ? ["#1E3A8A", "#1E293B"]
            : ["#DBEAFE", "#EFF6FF"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 24,
          padding: 20,
          shadowColor: "#3B82F6",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: isDarkColorScheme
                ? "rgba(59, 130, 246, 0.2)"
                : "rgba(59, 130, 246, 0.15)",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Text style={{ fontSize: 24 }}>{icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: isDarkColorScheme ? "#FFFFFF" : "#1E3A8A",
              }}
            >
              Kết Luận
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: isDarkColorScheme ? "#93C5FD" : "#3B82F6",
              }}
            >
              Tổng hợp đánh giá
            </Text>
          </View>
        </View>

        {/* Content */}
        <View
          style={{
            backgroundColor: isDarkColorScheme
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(255, 255, 255, 0.8)",
            borderRadius: 16,
            padding: 18,
            borderLeftWidth: 4,
            borderLeftColor: "#3B82F6",
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: isDarkColorScheme ? "#E2E8F0" : "#1F2937",
              lineHeight: 26,
            }}
          >
            {text}
          </Text>
        </View>

        {/* Footer Badge */}
        <View
          style={{
            marginTop: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name="shield-checkmark"
            size={16}
            color={isDarkColorScheme ? "#93C5FD" : "#3B82F6"}
            style={{ marginRight: 6 }}
          />
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: isDarkColorScheme ? "#93C5FD" : "#3B82F6",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Phân Tích Từ AI
          </Text>
        </View>
      </LinearGradient>
    </MotiView>
  );
}
