import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import React from "react";
import { View, Text } from "react-native";
import { SHADOW } from "~/lib/design-tokens";

interface ConclusionCardProps {
  icon: string;
  text: string;
}

export function ConclusionCard({ icon, text }: ConclusionCardProps) {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", delay: 600, damping: 20 }}
    >
      <View
        className="bg-blue-50 dark:bg-blue-950/40 rounded-3xl"
        style={{ padding: 20, ...SHADOW.md }}
      >
        {/* Header */}
        <View
          testID="prediction-conclusion-header"
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <View
            className="bg-blue-200/60 dark:bg-blue-800/40 rounded-xl items-center justify-center"
            style={{
              width: 44,
              height: 44,
              marginRight: 12,
            }}
          >
            <Text style={{ fontSize: 24 }}>{icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              testID="prediction-conclusion-title"
              className="text-gray-900 dark:text-slate-100"
              style={{ fontSize: 18, fontWeight: "800" }}
            >
              Kết Luận
            </Text>
            <Text
              testID="prediction-conclusion-subtitle"
              className="text-blue-600 dark:text-blue-400"
              style={{ fontSize: 12, fontWeight: "600" }}
            >
              Tổng hợp đánh giá
            </Text>
          </View>
        </View>

        {/* Content */}
        <View
          testID="prediction-conclusion-content"
          className="bg-white/80 dark:bg-slate-800/60 rounded-2xl border-l-4 border-blue-500"
          style={{ padding: 18 }}
        >
          <Text
            testID="prediction-conclusion-text"
            className="text-gray-800 dark:text-slate-200"
            style={{
              fontSize: 15,
              fontWeight: "600",
              lineHeight: 26,
            }}
          >
            {text}
          </Text>
        </View>

        {/* Footer Badge */}
        <View
          testID="prediction-conclusion-footer"
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
            color="#007AFF"
            style={{ marginRight: 6 }}
          />
          <Text
            className="text-blue-600 dark:text-blue-400"
            style={{
              fontSize: 12,
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Phân Tích Từ AI
          </Text>
        </View>
      </View>
    </MotiView>
  );
}
