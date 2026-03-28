import React, { useCallback, useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { MotiView } from "moti";
import { useColorScheme } from "~/lib/useColorScheme";
import {
  ForecastHorizon,
  FORECAST_HORIZONS,
} from "~/features/prediction/hooks/useDistrictsForecast";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface PredictionTimelineSliderProps {
  visible: boolean;
  selectedHorizon: ForecastHorizon;
  onHorizonChange: (horizon: ForecastHorizon) => void;
  onClose?: () => void;
  isLoading?: boolean;
  evaluatedAt?: string;
  inline?: boolean;
}

interface HorizonStep {
  id: ForecastHorizon;
  label: string;
  shortLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const HORIZON_STEPS: HorizonStep[] = [
  { id: "now", label: "Hiện tại", shortLabel: "Now", icon: "radio-button-on", color: "#3B82F6" },
  { id: "1h", label: "1 giờ tới", shortLabel: "+1h", icon: "time-outline", color: "#06B6D4" },
  { id: "3h", label: "3 giờ tới", shortLabel: "+3h", icon: "partly-sunny-outline", color: "#10B981" },
  { id: "6h", label: "6 giờ tới", shortLabel: "+6h", icon: "cloud-outline", color: "#F59E0B" },
  { id: "9h", label: "9 giờ tới", shortLabel: "+9h", icon: "rainy-outline", color: "#F97316" },
  { id: "12h", label: "12 giờ tới", shortLabel: "+12h", icon: "thunderstorm-outline", color: "#EF4444" },
  { id: "24h", label: "24 giờ tới", shortLabel: "+24h", icon: "alert-circle-outline", color: "#DC2626" },
];

export const PredictionTimelineSlider: React.FC<PredictionTimelineSliderProps> = ({
  visible,
  selectedHorizon,
  onHorizonChange,
  onClose,
  isLoading,
  evaluatedAt,
  inline = false,
}) => {
  const { isDarkColorScheme } = useColorScheme();
  const selectedIndex = FORECAST_HORIZONS.indexOf(selectedHorizon);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for loading state
  useEffect(() => {
    if (isLoading) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isLoading, pulseAnim]);

  const getTimeLabel = useCallback(() => {
    if (!evaluatedAt) return "";
    try {
      // Fix Invalid Date Issue: evaluatedAt format is "2026-03-28 15:43:08 (28/03/2026)"
      // Extract main string "2026-03-28 15:43:08" and replace space with 'T' for iOS/Safari safety
      const cleanDateStr = evaluatedAt.split(' (')[0].replace(' ', 'T');
      const baseTime = new Date(cleanDateStr);
      
      if (isNaN(baseTime.getTime())) return "";

      if (selectedHorizon === "now") {
        return baseTime.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      const hours = parseInt(selectedHorizon.replace("h", ""));
      const futureTime = new Date(baseTime.getTime() + hours * 60 * 60 * 1000);
      return futureTime.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }, [evaluatedAt, selectedHorizon]);

  const currentStep = HORIZON_STEPS[selectedIndex] || HORIZON_STEPS[0];

  if (!visible) return null;

  const SLIDER_PADDING = 16;
  
  // Track layout parameters
  const TRACK_PADDING = 6;
  const layoutWidth = inline ? (SCREEN_WIDTH - 40) : (SCREEN_WIDTH - SLIDER_PADDING * 2);
  const TRACK_INNER_WIDTH = layoutWidth - TRACK_PADDING * 2;
  const PILL_WIDTH = TRACK_INNER_WIDTH / HORIZON_STEPS.length;

  const bgColor = isDarkColorScheme ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)";
  const textColor = isDarkColorScheme ? "#F1F5F9" : "#1E293B";
  const subtextColor = isDarkColorScheme ? "#94A3B8" : "#64748B";
  const trackBg = isDarkColorScheme ? "rgba(30, 41, 59, 0.5)" : "rgba(241, 245, 249, 0.8)";
  const trackBorder = isDarkColorScheme ? "#334155" : "#E2E8F0";

  const absoluteStyle = {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 30,
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: inline ? 20 : 60, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      exit={{ opacity: 0, translateY: inline ? 20 : 60, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 220, damping: 24, mass: 0.8 }}
      style={inline ? { width: "100%", zIndex: 30 } : absoluteStyle}
    >
      <View
        style={{
          marginHorizontal: inline ? 0 : SLIDER_PADDING,
          marginBottom: inline ? 0 : Platform.OS === "ios" ? 32 : 24,
          backgroundColor: bgColor,
          borderRadius: 32, // Smoother roundness
          paddingVertical: 20,
          shadowColor: currentStep.color,
          shadowOffset: { width: 0, height: inline ? 8 : 16 },
          shadowOpacity: inline ? 0.08 : 0.15,
          shadowRadius: inline ? 16 : 24,
          elevation: inline ? 4 : 16,
          borderWidth: 1,
          borderColor: isDarkColorScheme ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
        }}
      >
        {/* Header Area */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 24,
            marginBottom: 20,
          }}
        >
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Animated.View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: currentStep.color,
                  opacity: pulseAnim,
                  shadowColor: currentStep.color,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 6,
                  elevation: 4,
                }}
              />
              <Text style={{ fontSize: 17, fontWeight: "800", color: textColor, letterSpacing: -0.3 }}>
                Dự báo {currentStep.label}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6, marginLeft: 18 }}>
              {isLoading && (
                <MotiView
                  from={{ rotate: "0deg" }}
                  animate={{ rotate: "360deg" }}
                  transition={{ loop: true, type: "timing", duration: 1000 }}
                  style={{ marginRight: 6 }}
                >
                  <Ionicons name="sync" size={12} color={subtextColor} />
                </MotiView>
              )}
              <Text style={{ fontSize: 13, color: subtextColor, fontWeight: "500" }}>
                {isLoading ? "Đang cập nhật dữ liệu AI..." : `Dự kiến lúc ${getTimeLabel()}`}
              </Text>
            </View>
          </View>

          {!inline && onClose && (
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.6}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: isDarkColorScheme ? "#334155" : "#F1F5F9",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="close" size={20} color={subtextColor} />
            </TouchableOpacity>
          )}
        </View>

        {/* Elegant Segmented Timeline Slider */}
        <View
          style={{
            marginHorizontal: 20,
            height: 52,
            backgroundColor: trackBg,
            borderRadius: 26,
            borderWidth: 1,
            borderColor: trackBorder,
            padding: TRACK_PADDING,
            position: "relative",
            flexDirection: "row",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          {/* Animated Active Pill Background */}
          <MotiView
            animate={{
              translateX: selectedIndex * PILL_WIDTH,
              backgroundColor: currentStep.color,
            }}
            transition={{ type: "spring", stiffness: 220, damping: 22, mass: 0.8 }}
            style={{
              position: "absolute",
              left: TRACK_PADDING,
              top: TRACK_PADDING,
              width: PILL_WIDTH,
              height: 52 - TRACK_PADDING * 2,
              borderRadius: 20,
              shadowColor: currentStep.color,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 8,
              elevation: 4,
            }}
          />

          {/* Interactive Steps Layer */}
          {HORIZON_STEPS.map((step, index) => {
            const isActive = selectedIndex === index;
            const isPassed = index <= selectedIndex;
            
            return (
              <TouchableOpacity
                key={step.id}
                onPress={() => onHorizonChange(step.id)}
                activeOpacity={0.7}
                style={{
                  width: PILL_WIDTH,
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 2,
                }}
              >
                <MotiView
                  animate={{
                     scale: isActive ? 1.05 : 1,
                  }}
                  transition={{ type: 'spring', damping: 15 }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: isActive ? "800" : "600",
                      color: isActive 
                        ? "#FFFFFF" 
                        : isPassed 
                          ? (isDarkColorScheme ? "#E2E8F0" : "#475569") 
                          : subtextColor,
                      letterSpacing: isActive ? 0.2 : 0,
                    }}
                  >
                    {step.shortLabel}
                  </Text>
                </MotiView>
              </TouchableOpacity>
            );
          })}
        </View>

      </View>
    </MotiView>
  );
};
