// features/map/components/controls/layers/OpacitySlider.tsx
import React, { useMemo } from "react";
import { View, useColorScheme } from "react-native";
import Slider from "@react-native-community/slider";
import { Text } from "~/components/ui/text";
import { MAP_COLORS } from "~/lib/design-tokens";

interface OpacitySliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  testID?: string;
}

export function OpacitySlider({
  label,
  value,
  onChange,
  testID,
}: OpacitySliderProps) {
  const isDark = useColorScheme() === "dark";

  const colors = useMemo(() => {
    const palette = isDark ? MAP_COLORS.dark : MAP_COLORS.light;
    return {
      active: palette.accent,
      inactive: palette.border,
    };
  }, [isDark]);

  return (
    <View testID={testID}>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-[13px] text-muted-foreground">{label}</Text>
        <Text className="text-[13px] font-semibold text-foreground">
          {value}%
        </Text>
      </View>
      <Slider
        style={{ width: "100%", height: 30 }}
        minimumValue={0}
        maximumValue={100}
        value={value}
        onSlidingComplete={onChange}
        minimumTrackTintColor={colors.active}
        maximumTrackTintColor={colors.inactive}
        thumbTintColor={colors.active}
      />
    </View>
  );
}
