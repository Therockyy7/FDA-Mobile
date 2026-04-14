// features/map/components/controls/timeline/HorizonPillTrack.tsx
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SHADOW } from "~/lib/design-tokens";
import type { ForecastHorizon } from "~/features/prediction/hooks/useDistrictsForecast";

interface HorizonStep {
  id: ForecastHorizon;
  label: string;
  shortLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface HorizonPillTrackProps {
  selectedIndex: number;
  steps: HorizonStep[];
  pillWidth: number;
  currentStepColor: string;
  isDarkColorScheme: boolean;
  subtextColor: string;
  onHorizonChange: (horizon: ForecastHorizon) => void;
}

export function HorizonPillTrack({
  selectedIndex,
  steps,
  pillWidth,
  currentStepColor,
  isDarkColorScheme,
  subtextColor,
  onHorizonChange,
}: HorizonPillTrackProps) {
  const TRACK_PADDING = 6;

  return (
    <View
      style={[
        styles.track,
        {
          padding: TRACK_PADDING,
          backgroundColor: isDarkColorScheme ? "#1E293B" : "rgba(241, 245, 249, 0.8)",
          borderColor: isDarkColorScheme ? "#334155" : "#E2E8F0",
        },
      ]}
      testID="map-timeline-horizon-track"
    >
      {/* Active pill background */}
      <MotiView
        animate={{
          translateX: selectedIndex * pillWidth,
          backgroundColor: currentStepColor,
        }}
        transition={{ type: "spring", stiffness: 220, damping: 22, mass: 0.8 }}
        style={[
          styles.activePill,
          SHADOW.sm,
          {
            left: TRACK_PADDING,
            width: pillWidth,
            height: 52 - TRACK_PADDING * 2,
            shadowColor: currentStepColor,
          },
        ]}
      />

      {/* Interactive steps */}
      {steps.map((step, index) => {
        const isActive = selectedIndex === index;
        const isPassed = index <= selectedIndex;

        return (
          <TouchableOpacity
            key={step.id}
            onPress={() => onHorizonChange(step.id)}
            testID={`map-timeline-horizon-pill-${step.id}`}
            activeOpacity={0.7}
            style={{ width: pillWidth, height: "100%", alignItems: "center", justifyContent: "center", zIndex: 2 }}
          >
            <MotiView animate={{ scale: isActive ? 1.05 : 1 }} transition={{ type: "spring", damping: 15 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: isActive ? "800" : "600",
                  color: isActive
                    ? "#FFFFFF"
                    : isPassed
                      ? isDarkColorScheme ? "#E2E8F0" : "#475569"
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
  );
}

const styles = {
  track: {
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    position: "relative" as const,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    overflow: "hidden" as const,
  },
  activePill: {
    position: "absolute" as const,
    top: 0,
    borderRadius: 20,
  },
};
