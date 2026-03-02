// features/areas/components/charts/LoadingChart.tsx
// Loading placeholder with Lottie animation for charts
import LottieView from "lottie-react-native";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";

interface LoadingChartProps {
  height?: number;
  isDark?: boolean;
  message?: string;
}

export function LoadingChart({
  height = 200,
  isDark = false,
  message = "Đang tải biểu đồ...",
}: LoadingChartProps) {
  return (
    <View
      style={{
        height,
        backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: isDark ? "#334155" : "#E2E8F0",
        overflow: "hidden",
      }}
    >
      {/* Animated background effect */}
      <View
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          opacity: 0.1,
        }}
      >
        <LottieView
          source={require("../../../../assets/animations/water-rise.json")}
          autoPlay
          loop
          speed={0.3}
          style={{
            width: "150%",
            height: "150%",
            position: "absolute",
            left: "-25%",
            top: "-25%",
          }}
        />
      </View>

      {/* Loading animation */}
      <LottieView
        source={require("../../../../assets/animations/water-rise.json")}
        autoPlay
        loop
        speed={0.8}
        style={{
          width: 80,
          height: 80,
        }}
      />

      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: isDark ? "#94A3B8" : "#64748B",
          marginTop: 8,
        }}
      >
        {message}
      </Text>

      {/* Skeleton chart lines */}
      <View
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          right: 20,
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-between",
          opacity: 0.3,
        }}
      >
        {[40, 60, 35, 75, 50, 65, 45].map((h, i) => (
          <View
            key={i}
            style={{
              width: 20,
              height: h,
              backgroundColor: isDark ? "#475569" : "#CBD5E1",
              borderRadius: 4,
            }}
          />
        ))}
      </View>
    </View>
  );
}
