import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React from "react";
import { View, Text } from "react-native";
import { useColorScheme } from "~/lib/useColorScheme";

interface Factor {
  percentage: number;
  description: string;
}

interface FactorsCardProps {
  slope: Factor;
  saturation: Factor;
  historySimilarity: Factor;
}

export function FactorsCard({
  slope,
  saturation,
  historySimilarity,
}: FactorsCardProps) {
  const { isDarkColorScheme } = useColorScheme();

  const factors = [
    {
      icon: "trending-up",
      label: "Độ Dốc Địa Hình",
      value: slope.percentage,
      description: slope.description,
      color: "#3B82F6",
      gradientColors: ["#3B82F6", "#60A5FA"],
    },
    {
      icon: "water",
      label: "Độ Bão Hòa Đất",
      value: saturation.percentage,
      description: saturation.description,
      color: "#06B6D4",
      gradientColors: ["#06B6D4", "#22D3EE"],
    },
    {
      icon: "time",
      label: "Tương Đồng Lịch Sử",
      value: historySimilarity.percentage,
      description: historySimilarity.description,
      color: "#8B5CF6",
      gradientColors: ["#8B5CF6", "#A78BFA"],
    },
  ];

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
              backgroundColor: "#3B82F620",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Ionicons name="analytics" size={20} color="#3B82F6" />
          </View>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "800",
              color: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
            }}
          >
            Nhân Tố Chính
          </Text>
        </View>

        {/* Factors List */}
        <View style={{ gap: 12 }}>
          {factors.map((factor, index) => (
            <MotiView
              key={factor.label}
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
                  borderLeftColor: factor.color,
                }}
              >
                {/* Factor Header */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: `${factor.color}20`,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Ionicons
                      name={factor.icon as any}
                      size={18}
                      color={factor.color}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
                        marginBottom: 2,
                      }}
                    >
                      {factor.label}
                    </Text>
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "900",
                        color: factor.color,
                      }}
                    >
                      {factor.value.toFixed(1)}%
                    </Text>
                  </View>
                </View>

                {/* Description */}
                {factor.description && (
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "500",
                      color: isDarkColorScheme ? "#CBD5E1" : "#475569",
                      lineHeight: 20,
                    }}
                  >
                    {factor.description}
                  </Text>
                )}
              </LinearGradient>
            </MotiView>
          ))}
        </View>
      </View>
    </MotiView>
  );
}
