// features/map/components/controls/timeline/PredictionSliderHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import React, { useEffect, useRef } from "react";
import { Animated, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";

interface PredictionSliderHeaderProps {
  currentStep: {
    label: string;
    color: string;
  };
  isLoading: boolean;
  evaluatedAt?: string;
  onClose?: () => void;
  inline?: boolean;
  isDarkColorScheme: boolean;
}

export function PredictionSliderHeader({
  currentStep,
  isLoading,
  evaluatedAt,
  onClose,
  inline,
  isDarkColorScheme,
}: PredictionSliderHeaderProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

  const getTimeLabel = () => {
    if (!evaluatedAt) return "";
    try {
      const cleanDateStr = evaluatedAt.split(" (")[0].replace(" ", "T");
      const baseTime = new Date(cleanDateStr);
      if (isNaN(baseTime.getTime())) return "";
      return baseTime.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const textColor = isDarkColorScheme ? "#F1F5F9" : "#1E293B";
  const subtextColor = isDarkColorScheme ? "#94A3B8" : "#64748B";

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <View style={styles.titleRow}>
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
          <Text style={[styles.title, { color: textColor }]}>
            Dự báo {currentStep.label}
          </Text>
        </View>
        <View style={styles.subRow}>
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
          <Text style={[styles.subtitle, { color: subtextColor }]}>
            {isLoading
              ? "Đang cập nhật dữ liệu AI..."
              : `Dự kiến lúc ${getTimeLabel()}`}
          </Text>
        </View>
      </View>

      {!inline && onClose && (
        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.6}
          style={[
            styles.closeButton,
            { backgroundColor: isDarkColorScheme ? "#334155" : "#F1F5F9" },
          ]}
        >
          <Ionicons name="close" size={20} color={subtextColor} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = {
  container: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: "800" as const,
    letterSpacing: -0.3,
  },
  subRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginTop: 6,
    marginLeft: 18,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
};
