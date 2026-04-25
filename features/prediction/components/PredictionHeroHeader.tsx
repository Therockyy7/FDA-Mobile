import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  StatusBar,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { PredictionResponse } from "../types/prediction.types";

export const PREDICTION_HEADER_MAX_HEIGHT = 260;

const STATUS_CONFIG: Record<
  string,
  {
    gradient: readonly [string, string, ...string[]];
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
  }
> = {
  Normal: {
    gradient: ["#059669", "#10B981"],
    label: "Bình thường",
    icon: "shield-checkmark",
  },
  Moderate: {
    gradient: ["#D97706", "#F59E0B"],
    label: "Cảnh báo vừa",
    icon: "warning",
  },
  High: {
    gradient: ["#DC2626", "#EF4444"],
    label: "Nguy hiểm cao",
    icon: "alert-circle",
  },
  Severe: {
    gradient: ["#7C3AED", "#A78BFA"],
    label: "Rất nguy hiểm",
    icon: "flash",
  },
  Critical: {
    gradient: ["#991B1B", "#DC2626"],
    label: "Khẩn cấp",
    icon: "warning",
  },
};

interface Props {
  prediction: PredictionResponse;
  /** Reanimated SharedValue driven by useAnimatedScrollHandler */
  scrollY?: SharedValue<number>;
  /** Force-refetch callback — bypasses React Query cache */
  onRefresh?: () => void;
}

export function PredictionHeroHeader({ prediction, scrollY, onRefresh }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkColorScheme } = useColorScheme();

  const cfg = STATUS_CONFIG[prediction.status] ?? STATUS_CONFIG.Normal;
  const prob = Math.round(
    (prediction.forecast.aiPrediction.ensembleProbability ?? 0) * 100,
  );
  const conf = Math.round(
    (prediction.forecast.aiPrediction.confidence ?? 0) * 100,
  );

  const statusBarHeight =
    Platform.OS === "android"
      ? StatusBar.currentHeight || insets.top
      : insets.top;
  const HEADER_MIN_HEIGHT = Math.max(64, statusBarHeight + 50);
  const HEADER_SCROLL_DISTANCE =
    PREDICTION_HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

  // ── Animated styles (runs on UI thread via Reanimated) ────────────────────

  /** Whole header slides upward (bottom disappears under scroll content) */
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = scrollY
      ? interpolate(
          scrollY.value,
          [0, HEADER_SCROLL_DISTANCE],
          [0, -HEADER_SCROLL_DISTANCE],
          Extrapolation.CLAMP,
        )
      : 0;
    return { transform: [{ translateY }] };
  });

  /** Top nav bar counter-translates to stay pinned at screen top */
  const topNavAnimatedStyle = useAnimatedStyle(() => {
    const translateY = scrollY
      ? interpolate(
          scrollY.value,
          [0, HEADER_SCROLL_DISTANCE],
          [0, HEADER_SCROLL_DISTANCE],
          Extrapolation.CLAMP,
        )
      : 0;
    return { transform: [{ translateY }] };
  });

  /** Full content fades + shrinks away in the first 45% of scroll */
  const fullInfoAnimatedStyle = useAnimatedStyle(() => {
    const opacity = scrollY
      ? interpolate(
          scrollY.value,
          [0, HEADER_SCROLL_DISTANCE * 0.45],
          [1, 0],
          Extrapolation.CLAMP,
        )
      : 1;
    const scale = scrollY
      ? interpolate(
          scrollY.value,
          [0, HEADER_SCROLL_DISTANCE * 0.45],
          [1, 0.88],
          Extrapolation.CLAMP,
        )
      : 1;
    const translateY = scrollY
      ? interpolate(
          scrollY.value,
          [0, HEADER_SCROLL_DISTANCE * 0.45],
          [0, -12],
          Extrapolation.CLAMP,
        )
      : 0;
    return {
      opacity,
      transform: [{ scale }, { translateY }],
    } as ViewStyle;
  });

  /** Collapsed row (area name + status) fades in after 60% */
  const collapsedAnimatedStyle = useAnimatedStyle(() => {
    const opacity = scrollY
      ? interpolate(
          scrollY.value,
          [HEADER_SCROLL_DISTANCE * 0.6, HEADER_SCROLL_DISTANCE],
          [0, 1],
          Extrapolation.CLAMP,
        )
      : 0;
    const translateY = scrollY
      ? interpolate(
          scrollY.value,
          [HEADER_SCROLL_DISTANCE * 0.6, HEADER_SCROLL_DISTANCE],
          [8, 0],
          Extrapolation.CLAMP,
        )
      : 0;
    return { opacity, transform: [{ translateY }] };
  });

  /** Blur appears when collapsed */
  const blurAnimatedStyle = useAnimatedStyle(() => {
    const opacity = scrollY
      ? interpolate(
          scrollY.value,
          [HEADER_SCROLL_DISTANCE * 0.5, HEADER_SCROLL_DISTANCE],
          [0, 1],
          Extrapolation.CLAMP,
        )
      : 0;
    return { opacity };
  });

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: PREDICTION_HEADER_MAX_HEIGHT,
          overflow: "hidden",
          zIndex: 100,
        },
        headerAnimatedStyle,
      ]}
    >
      <LinearGradient
        colors={cfg.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flex: 1,
          paddingTop: statusBarHeight + 8,
          paddingHorizontal: 16,
          paddingBottom: 16,
        }}
      >
        {/* Glass blur overlay for collapsed state */}
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1,
            },
            blurAnimatedStyle,
          ]}
        >
          <BlurView intensity={70} tint="dark" style={{ flex: 1 }} />
        </Animated.View>

        {/* ── Top bar — always visible ───────────────────────────────────── */}
        <Animated.View
          style={[
            {
              flexDirection: "row",
              alignItems: "center",
              zIndex: 10,
              height: 40,
              marginBottom: 12,
            },
            topNavAnimatedStyle,
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 20,
              backgroundColor: "rgba(0,0,0,0.2)",
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={18} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>
              Quay lại
            </Text>
          </TouchableOpacity>

          {/* Collapsed: area name + status pill */}
          <Animated.View
            style={[
              {
                flexShrink: 1,
                flexGrow: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 8,
                paddingLeft: 12,
              },
              collapsedAnimatedStyle,
            ]}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "800",
                color: "#fff",
                flex: 1,
              }}
              numberOfLines={1}
            >
              {prediction.administrativeArea.name}
            </Text>
            <View
              style={{
                backgroundColor: "rgba(0,0,0,0.3)",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.25)",
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "800", color: "#fff" }}>
                {cfg.label}
              </Text>
            </View>
          </Animated.View>

          {onRefresh && (
            <TouchableOpacity
              onPress={onRefresh}
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor: "rgba(0,0,0,0.2)",
                marginLeft: 8,
              }}
            >
              <Ionicons name="refresh-outline" size={16} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
                Làm mới
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* ── Full info — fades + shrinks on scroll ─────────────────────── */}
        <Animated.View style={[{ flex: 1, zIndex: 5 }, fullInfoAnimatedStyle]}>
          {/* Area name + icon + status */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 14,
              gap: 10,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: "rgba(0,0,0,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name={cfg.icon} size={24} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  color: "rgba(255,255,255,0.7)",
                  letterSpacing: 1.1,
                  textTransform: "uppercase",
                  marginBottom: 2,
                }}
              >
                {prediction.administrativeArea.level === "ward"
                  ? "Phường / Xã"
                  : "Khu vực"}
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "900",
                  color: "#fff",
                  lineHeight: 26,
                }}
                numberOfLines={1}
              >
                {prediction.administrativeArea.name}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: "rgba(0,0,0,0.25)",
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.3)",
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "800", color: "#fff" }}>
                {cfg.label}
              </Text>
            </View>
          </View>

          {/* Probability circle + stats */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: "rgba(0,0,0,0.25)",
                borderWidth: 3,
                borderColor: "rgba(255,255,255,0.5)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "900", color: "#fff" }}>
                {prob}%
              </Text>
              <Text
                style={{
                  fontSize: 8,
                  fontWeight: "600",
                  color: "rgba(255,255,255,0.75)",
                  letterSpacing: 0.5,
                }}
              >
                RỦI RO
              </Text>
            </View>

            <View style={{ flex: 1, gap: 6 }}>
              <View style={{ flexDirection: "row", gap: 6 }}>
                <StatChip
                  icon="analytics-outline"
                  label="Độ tin cậy"
                  value={`${conf}%`}
                />
                <StatChip
                  icon="layers-outline"
                  label="Mức độ"
                  value={`Cấp ${prediction.severityLevel}`}
                />
              </View>
              <View style={{ flexDirection: "row", gap: 6 }}>
                <StatChip
                  icon="water-outline"
                  label="Trạm"
                  value={`${prediction.contributingStations.length} trạm`}
                />
                <StatChip
                  icon="people-outline"
                  label="Báo cáo"
                  value={`${prediction.communityReports.length} cộng đồng`}
                />
              </View>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
}

function StatChip({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.2)",
        borderRadius: 10,
        padding: 7,
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
      }}
    >
      <Ionicons name={icon} size={12} color="rgba(255,255,255,0.8)" />
      <View>
        <Text
          style={{
            fontSize: 8,
            color: "rgba(255,255,255,0.65)",
            fontWeight: "600",
            letterSpacing: 0.3,
          }}
        >
          {label}
        </Text>
        <Text style={{ fontSize: 11, color: "#fff", fontWeight: "800" }}>
          {value}
        </Text>
      </View>
    </View>
  );
}
