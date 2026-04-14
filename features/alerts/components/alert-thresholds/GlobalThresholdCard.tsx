// features/alerts/components/alert-thresholds/GlobalThresholdCard.tsx
import React from "react";
import { View } from "react-native";
import { Divider } from "~/components/ui/Divider";
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
  testID?: string;
}

export function GlobalThresholdCard({
  global,
  colors,
  testID,
}: GlobalThresholdCardProps) {
  const formatValue = (value: number, unit: string) => {
    const safeValue = isFinite(value) ? value : 0;
    const safeUnit = unit || "m";
    return `${safeValue.toFixed(1)}${safeUnit}`;
  };
  return (
    <View
      testID={testID ?? "alerts-thresholds-global-card"}
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
        testID="alerts-thresholds-global-row-info"
        label="Info"
        dotColor={colors.status.info}
        value={formatValue(global.info, global.unit)}
        colors={{ subtext: colors.subtext, text: colors.text }}
      />
      <Divider />
      <ThresholdRow
        testID="alerts-thresholds-global-row-caution"
        label="Caution"
        dotColor={colors.status.caution}
        value={formatValue(global.caution, global.unit)}
        colors={{ subtext: colors.subtext, text: colors.text }}
      />
      <Divider />
      <ThresholdRow
        testID="alerts-thresholds-global-row-warning"
        label="Warning"
        dotColor={colors.status.warning}
        value={formatValue(global.warning, global.unit)}
        colors={{ subtext: colors.subtext, text: colors.text }}
      />
      <Divider />
      <ThresholdRow
        testID="alerts-thresholds-global-row-critical"
        label="Critical"
        dotColor={colors.status.critical}
        value={formatValue(global.critical, global.unit)}
        colors={{ subtext: colors.subtext, text: colors.text }}
      />
    </View>
  );
}

export default GlobalThresholdCard;
