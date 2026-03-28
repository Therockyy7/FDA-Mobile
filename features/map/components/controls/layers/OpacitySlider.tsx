// features/map/components/controls/layers/OpacitySlider.tsx
import React from "react";
import { View } from "react-native";
import Slider from "@react-native-community/slider";
import { Text } from "~/components/ui/text";

interface OpacitySliderProps {
  label: string;
  value: number;
  color: string;
  subtextColor: string;
  textColor: string;
  borderColor: string;
  onChange: (value: number) => void;
}

export function OpacitySlider({
  label,
  value,
  color,
  subtextColor,
  textColor,
  borderColor,
  onChange,
}: OpacitySliderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={{ fontSize: 13, color: subtextColor }}>{label}</Text>
        <Text style={{ fontSize: 13, fontWeight: "600", color: textColor }}>
          {value}%
        </Text>
      </View>
      <Slider
        style={{ width: "100%", height: 30 }}
        minimumValue={0}
        maximumValue={100}
        value={value}
        onSlidingComplete={onChange}
        minimumTrackTintColor={color}
        maximumTrackTintColor={borderColor}
        thumbTintColor={color}
      />
    </View>
  );
}

const styles = {
  container: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "transparent",
    marginTop: -4,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 8,
  },
};
