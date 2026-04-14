// features/areas/components/charts/ChartPeriodSelector.tsx
// Time range selector tabs for flood charts with custom option
import { SHADOW } from "~/lib/design-tokens";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { MAP_COLORS } from "~/lib/design-tokens";
import {
  CHART_PERIODS,
  type ChartPeriod,
} from "~/features/areas/types/flood-history.types";

interface ChartPeriodSelectorProps {
  selectedPeriod: ChartPeriod;
  onSelectPeriod: (period: ChartPeriod) => void;
  onCustomPress?: () => void;
  customDateLabel?: string;
  showCustomButton?: boolean; // Only show custom button when true
  isDark?: boolean;
}

export function ChartPeriodSelector({
  selectedPeriod,
  onSelectPeriod,
  onCustomPress,
  customDateLabel,
  showCustomButton = false,
  isDark = false,
}: ChartPeriodSelectorProps) {
  const isCustomSelected = selectedPeriod === "custom";

  // JS-only exception: isDark for non-NativeWind chart context
  const theme = isDark ? MAP_COLORS.dark : MAP_COLORS.light;
  const colors = {
    background: isDark ? MAP_COLORS.dark.card : MAP_COLORS.light.divider,
    selectedBg: isDark ? MAP_COLORS.dark.accent : MAP_COLORS.light.card,
    selectedText: isDark ? "white" : MAP_COLORS.light.accent,
    normalText: isDark ? MAP_COLORS.dark.subtext : MAP_COLORS.light.subtext,
    customBg: isDark ? MAP_COLORS.dark.background : MAP_COLORS.light.border,
  };

  const handleCustomPress = () => {
    onSelectPeriod("custom");
    onCustomPress?.();
  };

  return (
    <View testID="areas-chart-period-selector" style={{ gap: 8 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexDirection: "row",
          backgroundColor: colors.background,
          borderRadius: 12,
          padding: 4,
          gap: 4,
        }}
      >
        {/* Period buttons */}
        {CHART_PERIODS.map((period) => {
          const isSelected = period.value === selectedPeriod;
          return (
            <TouchableOpacity
              key={period.value}
              onPress={() => onSelectPeriod(period.value)}
              testID={`areas-chart-period-btn-${period.value}`}
              style={{
                paddingHorizontal: 14,
                height: 32,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 10,
                backgroundColor: isSelected ? colors.selectedBg : "transparent",
                ...(isSelected ? SHADOW.sm : {}),
              }}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: isSelected ? "700" : "500",
                  color: isSelected ? colors.selectedText : colors.normalText,
                }}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Custom button - only show when showCustomButton is true */}
        {showCustomButton && (
          <TouchableOpacity
            onPress={handleCustomPress}
            testID="areas-chart-period-btn-custom"
            style={{
              paddingHorizontal: 14,
              height: 32,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 4,
              borderRadius: 10,
              backgroundColor: isCustomSelected
                ? colors.selectedBg
                : "transparent",
              ...(isCustomSelected ? SHADOW.sm : {}),
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="calendar-outline"
              size={14}
              color={isCustomSelected ? colors.selectedText : colors.normalText}
            />
            {/* <Text
              style={{
                fontSize: 12,
                fontWeight: isCustomSelected ? "700" : "500",
                color: isCustomSelected
                  ? colors.selectedText
                  : colors.normalText,
              }}
            >
              Tùy chọn
            </Text> */}
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Show custom date range badge when selected */}
      {showCustomButton && isCustomSelected && (customDateLabel?.length ?? 0) > 0 && (
        <TouchableOpacity
          onPress={onCustomPress}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            backgroundColor: colors.customBg,
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 8,
          }}
        >
          <Ionicons name="calendar" size={14} color={theme.accent} />
          <Text style={{ fontSize: 12, fontWeight: "600", color: theme.accent }}>
            {customDateLabel}
          </Text>
          <Ionicons name="chevron-down" size={14} color={theme.accent} />
        </TouchableOpacity>
      )}
    </View>
  );
}
