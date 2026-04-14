import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { FLOOD_COLORS, SHADOW } from "~/lib/design-tokens";

interface AiConsultantCardProps {
  advice: string;
}

export function AiConsultantCard({ advice }: AiConsultantCardProps) {
  return (
    <View
      testID="prediction-ai-consultant-card"
      className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-indigo-100 dark:border-indigo-900"
      style={{ padding: 20, marginBottom: 16, ...SHADOW.md }}
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
            ...SHADOW.md,
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
              testID="prediction-ai-consultant-title"
              className="text-xl font-black text-gray-800 dark:text-slate-100"
              style={{ marginRight: 8 }}
            >
              AI Consultant
            </Text>
            <View
              className="bg-emerald-100 dark:bg-emerald-900/40"
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
              }}
            >
              <Text
                testID="prediction-ai-consultant-badge"
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: FLOOD_COLORS.safe,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                AI
              </Text>
            </View>
          </View>
          <Text
            testID="prediction-ai-consultant-subtitle"
            className="text-sm font-semibold text-indigo-500 dark:text-indigo-400"
          >
            Phân tích chuyên sâu từ AI
          </Text>
        </View>
      </View>

      {/* Content Box with modern styling */}
      <View
        testID="prediction-ai-consultant-content"
        className="bg-violet-50 dark:bg-violet-950/40 rounded-2xl border-l-4 border-violet-500"
        style={{ padding: 18 }}
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
            className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase"
            style={{ letterSpacing: 0.8 }}
          >
            Khuyến nghị
          </Text>
        </View>
        <Text
          testID="prediction-ai-consultant-advice"
          className="text-gray-800 dark:text-slate-200"
          style={{
            fontSize: 15,
            lineHeight: 26,
            fontWeight: "500",
            letterSpacing: 0.2,
          }}
        >
          {advice}
        </Text>
      </View>

      {/* Footer info */}
      <View
        testID="prediction-ai-consultant-footer"
        className="border-t border-gray-200 dark:border-slate-700"
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 16,
          paddingTop: 16,
        }}
      >
        <MaterialCommunityIcons
          name="information"
          size={14}
          color="#9CA3AF"
          style={{ marginRight: 6 }}
        />
        <Text
          className="text-xs font-medium text-gray-500 dark:text-slate-400"
          style={{ flex: 1 }}
        >
          Được tạo bởi mô hình AI phân tích dữ liệu thời gian thực
        </Text>
      </View>
    </View>
  );
}
