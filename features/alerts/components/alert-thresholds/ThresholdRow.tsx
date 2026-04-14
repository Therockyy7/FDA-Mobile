// features/alerts/components/alert-thresholds/ThresholdRow.tsx
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";

interface ThresholdRowProps {
  label: string;
  dotColor: string;
  value: string;
  colors: {
    subtext: string;
    text: string;
  };
  testID?: string;
}

export function ThresholdRow({
  label,
  dotColor,
  value,
  colors,
  testID,
}: ThresholdRowProps) {
  return (
    <View
      testID={testID}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 8,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View
          style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: dotColor }}
        />
        <Text style={{ fontSize: 14, color: colors.subtext }}>{label}</Text>
      </View>
      <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>
        {value}
      </Text>
    </View>
  );
}

export default ThresholdRow;
