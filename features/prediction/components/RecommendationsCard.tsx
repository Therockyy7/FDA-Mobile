import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import React from "react";
import { View, Text } from "react-native";
import { useColorScheme } from "~/lib/useColorScheme";

interface Recommendation {
  icon: string;
  title: string;
  description: string;
  items: string[];
}

interface RecommendationsCardProps {
  recommendations: Recommendation[];
}

export function RecommendationsCard({
  recommendations,
}: RecommendationsCardProps) {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", delay: 400, duration: 500 }}
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
            Khuyến Nghị Hành Động
          </Text>
        </View>

        {/* Recommendations */}
        {recommendations.map((rec, recIndex) => (
          <View key={recIndex} style={{ marginBottom: 20 }}>
            {/* Recommendation Title */}
            <MotiView
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{
                type: "timing",
                delay: 500 + recIndex * 100,
                duration: 400,
              }}
            >
              <View
                style={{
                  backgroundColor: "#10B98110",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: "#10B981",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontSize: 24, marginRight: 8 }}>
                    {rec.icon}
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 16,
                      fontWeight: "800",
                      color: "#10B981",
                    }}
                  >
                    {rec.title}
                  </Text>
                </View>
                {rec.description && (
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: isDarkColorScheme ? "#CBD5E1" : "#475569",
                      lineHeight: 22,
                    }}
                  >
                    {rec.description}
                  </Text>
                )}
              </View>
            </MotiView>

            {/* Action Items */}
            {rec.items.length > 0 && (
              <View style={{ gap: 10 }}>
                {rec.items.map((item, itemIndex) => (
                  <MotiView
                    key={itemIndex}
                    from={{ opacity: 0, translateX: -15 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{
                      type: "timing",
                      delay: 600 + recIndex * 100 + itemIndex * 80,
                      duration: 400,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        backgroundColor: isDarkColorScheme
                          ? "#334155"
                          : "#F8FAFC",
                        borderRadius: 12,
                        padding: 14,
                        paddingLeft: 16,
                      }}
                    >
                      <View
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: "#10B981",
                          marginTop: 7,
                          marginRight: 12,
                        }}
                      />
                      <Text
                        style={{
                          flex: 1,
                          fontSize: 14,
                          fontWeight: "500",
                          color: isDarkColorScheme ? "#E2E8F0" : "#334155",
                          lineHeight: 22,
                        }}
                      >
                        {item}
                      </Text>
                    </View>
                  </MotiView>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    </MotiView>
  );
}
