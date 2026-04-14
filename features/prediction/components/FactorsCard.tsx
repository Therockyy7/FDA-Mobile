import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import React from "react";
import { View, Text } from "react-native";
import { SHADOW } from "~/lib/design-tokens";

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
  },
  {
    key: "saturation" as const,
    icon: "water" as const,
    label: "Độ Bão Hòa Đất",
    color: "#06B6D4",
  },
  {
    key: "accumulation" as const,
    icon: "rainy" as const,
    label: "Tích Lũy Mưa",
    color: "#3B82F6",
  },
  {
    key: "topography" as const,
    icon: "trending-up" as const,
    label: "Địa Hình",
    color: "#8B5CF6",
  },
  {
    key: "hydrology" as const,
    icon: "navigate" as const,
    label: "Thủy Văn",
    color: "#14B8A6",
  },
];

export function FactorsCard({ contributionScores }: FactorsCardProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", delay: 200, duration: 500 }}
    >
      <View
        testID="prediction-factors-card"
        className="bg-white dark:bg-slate-800 rounded-3xl p-5"
        style={SHADOW.lg}
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
            className="bg-blue-100 dark:bg-blue-900/40 rounded-xl items-center justify-center"
            style={{
              width: 40,
              height: 40,
              marginRight: 12,
            }}
          >
            <Ionicons name="analytics" size={20} color="#007AFF" />
          </View>
          <Text
            testID="prediction-factors-title"
            className="text-lg font-extrabold text-gray-800 dark:text-slate-100"
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
                <View
                  className="bg-slate-50 dark:bg-slate-700 rounded-2xl border-l-4"
                  style={{ padding: 16, borderLeftColor: factorConfig.color }}
                >
                  {/* Factor Header */}
                  <View
                    testID={`prediction-factors-item-${factorConfig.key}`}
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
                        className="text-sm font-bold text-gray-800 dark:text-slate-100"
                      >
                        {factorConfig.label}
                      </Text>
                    </View>
                    <Text
                      testID={`prediction-factors-pct-${factorConfig.key}`}
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
                    className="bg-slate-200 dark:bg-slate-600 rounded-md overflow-hidden"
                    style={{ height: 6 }}
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
                </View>
              </MotiView>
            );
          })}
        </View>
      </View>
    </MotiView>
  );
}
