import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

interface AiConsultantCardProps {
  advice: string;
}

export function AiConsultantCard({ advice }: AiConsultantCardProps) {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <View
      style={{
        backgroundColor: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#6366F1",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
        borderWidth: 2,
        borderColor: isDarkColorScheme ? "#3730A3" : "#E0E7FF",
      }}
    >
      {/* Header with animated gradient badge */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <LinearGradient
          colors={["#6366F1", "#8B5CF6", "#EC4899"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 14,
            shadowColor: "#6366F1",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <MaterialCommunityIcons
            name="robot-excited"
            size={32}
            color="white"
          />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "900",
                color: isDarkColorScheme ? "#FFFFFF" : "#1F2937",
                marginRight: 8,
              }}
            >
              AI Consultant
            </Text>
            <View
              style={{
                backgroundColor: "#10B98120",
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  color: "#10B981",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                AI
              </Text>
            </View>
          </View>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: isDarkColorScheme ? "#A78BFA" : "#6366F1",
            }}
          >
            Phân tích chuyên sâu từ AI
          </Text>
        </View>
      </View>

      {/* Content Box with modern styling */}
      <View
        style={{
          backgroundColor: isDarkColorScheme
            ? "rgba(139, 92, 246, 0.1)"
            : "#F5F3FF",
          borderRadius: 16,
          padding: 18,
          borderLeftWidth: 4,
          borderLeftColor: "#8B5CF6",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <MaterialCommunityIcons
            name="lightbulb-on"
            size={18}
            color="#8B5CF6"
            style={{ marginRight: 8 }}
          />
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: "#8B5CF6",
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            Khuyến nghị
          </Text>
        </View>
        <Text
          style={{
            fontSize: 15,
            lineHeight: 26,
            color: isDarkColorScheme ? "#E2E8F0" : "#1F2937",
            fontWeight: "500",
            letterSpacing: 0.2,
          }}
        >
          {advice}
        </Text>
      </View>

      {/* Footer info */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 16,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: isDarkColorScheme ? "#334155" : "#E5E7EB",
        }}
      >
        <MaterialCommunityIcons
          name="information"
          size={14}
          color={isDarkColorScheme ? "#94A3B8" : "#9CA3AF"}
          style={{ marginRight: 6 }}
        />
        <Text
          style={{
            fontSize: 11,
            color: isDarkColorScheme ? "#94A3B8" : "#6B7280",
            fontWeight: "500",
            flex: 1,
          }}
        >
          Được tạo bởi mô hình AI phân tích dữ liệu thời gian thực
        </Text>
      </View>
    </View>
  );
}
