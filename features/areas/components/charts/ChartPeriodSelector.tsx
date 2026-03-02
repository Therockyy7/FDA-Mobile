// features/areas/components/charts/ChartPeriodSelector.tsx
// Time range selector tabs for flood charts with custom option
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
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

  const colors = {
    background: isDark ? "#1E293B" : "#F1F5F9",
    selectedBg: isDark ? "#3B82F6" : "#FFFFFF",
    selectedText: isDark ? "#FFFFFF" : "#3B82F6",
    normalText: isDark ? "#94A3B8" : "#64748B",
    customBg: isDark ? "#0F172A" : "#E2E8F0",
  };

  const handleCustomPress = () => {
    onSelectPeriod("custom");
    onCustomPress?.();
  };

  return (
    <View style={{ gap: 8 }}>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: colors.background,
          borderRadius: 12,
          padding: 4,
        }}
      >
        {/* Period buttons */}
        {CHART_PERIODS.map((period) => {
          const isSelected = period.value === selectedPeriod;
          return (
            <TouchableOpacity
              key={period.value}
              onPress={() => onSelectPeriod(period.value)}
              style={{
                width: 68,
                height: 32,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 10,
                backgroundColor: isSelected ? colors.selectedBg : "transparent",
                shadowColor: isSelected ? "#000" : "transparent",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isSelected ? (isDark ? 0.3 : 0.1) : 0,
                shadowRadius: 4,
                elevation: isSelected ? 3 : 0,
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
            style={{
              width: 90,
              height: 32,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 4,
              borderRadius: 10,
              backgroundColor: isCustomSelected
                ? colors.selectedBg
                : "transparent",
              shadowColor: isCustomSelected ? "#000" : "transparent",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isCustomSelected ? (isDark ? 0.3 : 0.1) : 0,
              shadowRadius: 4,
              elevation: isCustomSelected ? 3 : 0,
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="calendar-outline"
              size={14}
              color={isCustomSelected ? colors.selectedText : colors.normalText}
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: isCustomSelected ? "700" : "500",
                color: isCustomSelected
                  ? colors.selectedText
                  : colors.normalText,
              }}
            >
              Tùy chọn
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Show custom date range badge when selected */}
      {showCustomButton && isCustomSelected && customDateLabel && (
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
          <Ionicons name="calendar" size={14} color="#3B82F6" />
          <Text style={{ fontSize: 12, fontWeight: "600", color: "#3B82F6" }}>
            {customDateLabel}
          </Text>
          <Ionicons name="chevron-down" size={14} color="#3B82F6" />
        </TouchableOpacity>
      )}
    </View>
  );
}
