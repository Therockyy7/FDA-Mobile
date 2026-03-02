import React from "react";
import { View } from "react-native";
import ThresholdDivider from "./ThresholdDivider";
import ThresholdRow from "./ThresholdRow";

interface GlobalThresholds {
  info: number;
  caution: number;
  warning: number;
  critical: number;
  unit: string;
}

interface GlobalThresholdCardProps {
  global: GlobalThresholds;
  colors: {
    surface: string;
    borderSoft: string;
    status: {
      info: string;
      caution: string;
      warning: string;
      critical: string;
    };
    subtext: string;
    text: string;
  };
}

export function GlobalThresholdCard({
  global,
  colors,
}: GlobalThresholdCardProps) {
  return (
    <View
      style={{
        marginHorizontal: 16,
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        padding: 12,
      }}
    >
      <ThresholdRow
        label="Info"
        dotColor={colors.status.info}
        value={`${global.info.toFixed(1)}${global.unit}`}
        colors={{ subtext: colors.subtext, text: colors.text }}
      />
      <ThresholdDivider colors={{ borderSoft: colors.borderSoft }} />
      <ThresholdRow
        label="Caution"
        dotColor={colors.status.caution}
        value={`${global.caution.toFixed(1)}${global.unit}`}
        colors={{ subtext: colors.subtext, text: colors.text }}
      />
      <ThresholdDivider colors={{ borderSoft: colors.borderSoft }} />
      <ThresholdRow
        label="Warning"
        dotColor={colors.status.warning}
        value={`${global.warning.toFixed(1)}${global.unit}`}
        colors={{ subtext: colors.subtext, text: colors.text }}
      />
      <ThresholdDivider colors={{ borderSoft: colors.borderSoft }} />
      <ThresholdRow
        label="Critical"
        dotColor={colors.status.critical}
        value={`${global.critical.toFixed(1)}${global.unit}`}
        colors={{ subtext: colors.subtext, text: colors.text }}
      />
    </View>
  );
}

export default GlobalThresholdCard;
