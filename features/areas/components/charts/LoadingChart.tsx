// features/areas/components/charts/LoadingChart.tsx
// Loading placeholder with Lottie animation for charts
import LottieView from "lottie-react-native";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { MAP_COLORS } from "~/lib/design-tokens";

interface LoadingChartProps {
  height?: number;
  isDark?: boolean;
  message?: string;
  testID?: string;
}

export function LoadingChart({
  height = 200,
  isDark = false,
  message = "Đang tải biểu đồ...",
  testID,
}: LoadingChartProps) {
  // JS-only exception: isDark for non-NativeWind context
  const theme = isDark ? MAP_COLORS.dark : MAP_COLORS.light;
  return (
    <View
      testID={testID}
      style={{
        height,
        backgroundColor: isDark ? theme.card : theme.background,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: isDark ? theme.border : theme.border,
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
          color: isDark ? theme.subtext : theme.subtext,
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
              backgroundColor: isDark ? theme.muted : theme.muted,
              borderRadius: 4,
            }}
          />
        ))}
      </View>
    </View>
  );
}
