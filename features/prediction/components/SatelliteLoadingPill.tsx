import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { usePathname, useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { FLOOD_COLORS, SHADOW } from "~/lib/design-tokens";
import { useSatelliteAnalysisStore } from "../stores/useSatelliteAnalysisStore";

// Gradient sets — kept as JS values because LinearGradient requires them
const GRADIENT_LOADING_LIGHT = ["#5B21B6", "#7C3AED"] as const;
const GRADIENT_LOADING_DARK = ["#2E1065", "#4C1D95"] as const;
const GRADIENT_DONE = ["#064E3B", "#065F46", "#047857"] as const;
const GRADIENT_ERROR = ["#7F1D1D", "#991B1B"] as const;

/**
 * Global floating pill that appears at the bottom of any screen when a
 * satellite analysis is running in the background. Tapping it navigates to
 * the prediction screen and scrolls to the SatelliteVerificationCard.
 *
 * Mounted once in _layout.tsx — always rendered but visibility is controlled
 * by the Zustand store.
 */
export function SatelliteLoadingPill() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  const { results, activeLoadingAreaId, setActiveLoadingAreaId } =
    useSatelliteAnalysisStore();

  // Resolve the area's current state from the store
  const areaState = activeLoadingAreaId
    ? results[activeLoadingAreaId]
    : undefined;

  const isLoading = areaState?.state === "loading";
  const isDone = areaState?.state === "success";
  const isError = areaState?.state === "error";

  // Determine if the user is already on the prediction screen for this area
  const isOnPredictionScreen =
    activeLoadingAreaId &&
    pathname.includes(`/prediction/${activeLoadingAreaId}`);

  // Whether the pill should be visible
  const pillVisible =
    !!activeLoadingAreaId &&
    (isLoading || isDone || isError) &&
    !isOnPredictionScreen;

  // Auto-dismiss after 8s when done, or immediately on error
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);

    if (isDone && pillVisible) {
      dismissTimerRef.current = setTimeout(() => {
        setActiveLoadingAreaId(null);
      }, 8000);
    }
    if (isError) {
      setActiveLoadingAreaId(null);
    }

    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, [isDone, isError, pillVisible]);

  // Also dismiss if user navigates to this prediction screen manually
  useEffect(() => {
    if (isOnPredictionScreen && !isLoading) {
      setActiveLoadingAreaId(null);
    }
  }, [isOnPredictionScreen, isLoading]);

  const handlePress = () => {
    if (!activeLoadingAreaId) return;
    // Navigate to the prediction screen and pass scrollTo param
    router.push(`/prediction/${activeLoadingAreaId}?scrollTo=satellite` as any);
    // Only clear the pill after done (not while loading — let user check progress)
    if (!isLoading) {
      setActiveLoadingAreaId(null);
    }
  };

  const elapsedSeconds = areaState?.elapsedSeconds ?? 0;

  return (
    <MotiView
      testID="prediction-satellite-pill"
      animate={{
        translateY: pillVisible ? 0 : 120,
        opacity: pillVisible ? 1 : 0,
      }}
      transition={{ type: "spring", damping: 22, stiffness: 200 }}
      pointerEvents={pillVisible ? "box-none" : "none"}
      style={{
        position: "absolute",
        bottom: insets.bottom + 80, // above tab bar
        left: 16,
        right: 16,
        zIndex: 9999,
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.88}
        disabled={!pillVisible}
      >
        <LinearGradient
          colors={
            isDone
              ? GRADIENT_DONE
              : isError
                ? GRADIENT_ERROR
                : GRADIENT_LOADING_LIGHT
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            borderRadius: 50,
            paddingHorizontal: 18,
            paddingVertical: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            ...SHADOW.lg,
            shadowColor: isDone ? FLOOD_COLORS.safe : "#7C3AED",
          }}
        >
          {/* Left icon / spinner */}
          {isLoading ? (
            <ActivityIndicator
              testID="prediction-satellite-spinner"
              size="small"
              color="#FFFFFF"
            />
          ) : isDone ? (
            <View
              style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="checkmark" size={15} color="#FFFFFF" />
            </View>
          ) : (
            <Ionicons name="alert-circle" size={18} color="#FFFFFF" />
          )}

          {/* Text */}
          <View style={{ flex: 1 }}>
            <Text
              testID="prediction-satellite-pill-title"
              style={{
                fontSize: 13,
                fontWeight: "800",
                color: "#FFFFFF",
                marginBottom: 1,
              }}
              numberOfLines={1}
            >
              {isLoading
                ? "Đang phân tích vệ tinh..."
                : isDone
                  ? "Phân tích vệ tinh hoàn tất!"
                  : "Phân tích thất bại"}
            </Text>
            <Text
              testID="prediction-satellite-pill-subtitle"
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.75)",
              }}
              numberOfLines={1}
            >
              {isLoading
                ? `${elapsedSeconds}s · Nhấn để xem tiến độ`
                : isDone
                  ? "Nhấn để xem kết quả chi tiết"
                  : "Nhấn để thử lại"}
            </Text>
          </View>

          {/* Satellite icon */}
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              backgroundColor: "rgba(255,255,255,0.15)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="planet-outline" size={17} color="#FFFFFF" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </MotiView>
  );
}
