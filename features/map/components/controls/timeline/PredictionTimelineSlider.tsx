// features/map/components/controls/timeline/PredictionTimelineSlider.tsx
import React from "react";
import { View, Dimensions, Platform } from "react-native";
import { MotiView } from "moti";
import { useColorScheme } from "~/lib/useColorScheme";
import {
  ForecastHorizon,
  FORECAST_HORIZONS,
} from "~/features/prediction/hooks/useDistrictsForecast";
import { Ionicons } from "@expo/vector-icons";
import { PredictionSliderHeader } from "./PredictionSliderHeader";
import { HorizonPillTrack } from "./HorizonPillTrack";
import { SHADOW } from "~/lib/design-tokens";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

interface PredictionTimelineSliderProps {
  visible: boolean;
  selectedHorizon: ForecastHorizon;
  onHorizonChange: (horizon: ForecastHorizon) => void;
  onClose?: () => void;
  isLoading?: boolean;
  evaluatedAt?: string;
  inline?: boolean;
}

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
  const currentStep = HORIZON_STEPS[selectedIndex] || HORIZON_STEPS[0];

  if (!visible) return null;

  const SLIDER_PADDING = 16;
  const TRACK_PADDING = 6;
  const layoutWidth = inline ? SCREEN_WIDTH - 40 : SCREEN_WIDTH - SLIDER_PADDING * 2;
  const TRACK_INNER_WIDTH = layoutWidth - TRACK_PADDING * 2;
  const PILL_WIDTH = TRACK_INNER_WIDTH / HORIZON_STEPS.length;

  const bgColor = isDarkColorScheme ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)";
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
        testID="map-timeline-slider"
        style={[
          SHADOW.md,
          {
            marginHorizontal: inline ? 0 : SLIDER_PADDING,
            marginBottom: inline ? 0 : Platform.OS === "ios" ? 32 : 24,
            backgroundColor: bgColor,
            borderRadius: 28,
            paddingVertical: 20,
            borderWidth: 1,
            borderColor: isDarkColorScheme ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
          },
        ]}
      >
        <PredictionSliderHeader
          currentStep={currentStep}
          isLoading={!!isLoading}
          evaluatedAt={evaluatedAt}
          onClose={onClose}
          inline={inline}
          isDarkColorScheme={isDarkColorScheme}
        />

        <View
          style={{
            marginHorizontal: 20,
            height: 52,
            backgroundColor: trackBg,
            borderRadius: 26,
            borderWidth: 1,
            borderColor: trackBorder,
            overflow: "hidden",
          }}
        >
          <HorizonPillTrack
            selectedIndex={selectedIndex}
            steps={HORIZON_STEPS}
            pillWidth={PILL_WIDTH}
            currentStepColor={currentStep.color}
            isDarkColorScheme={isDarkColorScheme}
            subtextColor={subtextColor}
            onHorizonChange={onHorizonChange}
          />
        </View>
      </View>
    </MotiView>
  );
};
