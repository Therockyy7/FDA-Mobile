import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React from "react";
import { View, Text } from "react-native";
import { useColorScheme } from "~/lib/useColorScheme";

interface FactorsCardProps {
  contributionScores: {
    intensity: number;    // 0-1
    saturation: number;   // 0-1
    accumulation: number; // 0-1
    topography: number;   // 0-1
    hydrology: number;    // 0-1
  };
}

const FACTOR_CONFIGS = [
  {
    key: "intensity" as const,
    icon: "flash" as const,
    label: "Cường Độ Mưa",
    color: "#EF4444",
    gradientColors: ["#DC2626", "#EF4444"] as const,
  },
  {
    key: "saturation" as const,
    icon: "water" as const,
    label: "Độ Bão Hòa Đất",
    color: "#06B6D4",
    gradientColors: ["#06B6D4", "#22D3EE"] as const,
  },
  {
    key: "accumulation" as const,
    icon: "rainy" as const,
    label: "Tích Lũy Mưa",
    color: "#3B82F6",
    gradientColors: ["#2563EB", "#3B82F6"] as const,
  },
  {
    key: "topography" as const,
    icon: "trending-up" as const,
    label: "Địa Hình",
    color: "#8B5CF6",
    gradientColors: ["#7C3AED", "#8B5CF6"] as const,
  },
  {
    key: "hydrology" as const,
    icon: "navigate" as const,
    label: "Thủy Văn",
    color: "#14B8A6",
    gradientColors: ["#0D9488", "#14B8A6"] as const,
  },
];

export function FactorsCard({ contributionScores }: FactorsCardProps) {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", delay: 200, duration: 500 }}
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
              backgroundColor: "#007AFF20",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Ionicons name="analytics" size={20} color="#007AFF" />
          </View>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "800",
              color: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
            }}
          >
            Nhân Tố Đóng Góp
          </Text>
        </View>

        {/* Factors List */}
        <View style={{ gap: 12 }}>
          {FACTOR_CONFIGS.map((factorConfig, index) => {
            const value = contributionScores[factorConfig.key] ?? 0;
            const pct = value * 100;

            return (
              <MotiView
                key={factorConfig.key}
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{
                  type: "timing",
                  delay: 300 + index * 100,
                  duration: 400,
                }}
              >
                <LinearGradient
                  colors={
                    isDarkColorScheme
                      ? ["rgba(51, 65, 85, 0.5)", "rgba(30, 41, 59, 0.3)"]
                      : ["rgba(248, 250, 252, 1)", "rgba(241, 245, 249, 1)"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    borderRadius: 16,
                    padding: 16,
                    borderLeftWidth: 4,
                    borderLeftColor: factorConfig.color,
                  }}
                >
                  {/* Factor Header */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 10,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          backgroundColor: `${factorConfig.color}20`,
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <Ionicons
                          name={factorConfig.icon as any}
                          size={18}
                          color={factorConfig.color}
                        />
                      </View>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
                        }}
                      >
                        {factorConfig.label}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "900",
                        color: factorConfig.color,
                      }}
                    >
                      {pct.toFixed(0)}%
                    </Text>
                  </View>

                  {/* Progress Bar */}
                  <View
                    style={{
                      height: 6,
                      backgroundColor: isDarkColorScheme ? "#475569" : "#E2E8F0",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <MotiView
                      from={{ width: "0%" }}
                      animate={{ width: `${Math.min(pct, 100)}%` as any }}
                      transition={{ type: "timing", delay: 400 + index * 100, duration: 600 }}
                      style={{
                        height: "100%",
                        backgroundColor: factorConfig.color,
                        borderRadius: 3,
                      }}
                    />
                  </View>
                </LinearGradient>
              </MotiView>
            );
          })}
        </View>
      </View>
    </MotiView>
  );
}
