import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import { Text } from "./text";
import { useColorScheme } from "~/lib/useColorScheme";

export type StatusOption<T extends string> = {
  value: T | "all";
  label: string;
  count?: number;
};

type StatusFilterProps<T extends string> = {
  options: StatusOption<T>[];
  selected: T | "all";
  onSelect: (value: T | "all") => void;
  containerStyle?: ViewStyle;
  activeColor?: string;
};

export function StatusFilter<T extends string>({
  options,
  selected,
  onSelect,
  containerStyle,
  activeColor,
}: StatusFilterProps<T>) {
  const { isDarkColorScheme } = useColorScheme();
  const isDark = isDarkColorScheme;

  const defaultAccent = isDark ? "#60A5FA" : "#007AFF";
  const accent = activeColor || defaultAccent;

  const colors = {
    activeBg: accent,
    activeText: "#FFFFFF",
    inactiveBg: isDark ? "rgba(255,255,255,0.04)" : "#F1F5F9",
    inactiveText: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0",
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {options.map((option) => {
          const isActive = selected === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onSelect(option.value)}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? colors.activeBg : colors.inactiveBg,
                  borderColor: isActive ? colors.activeBg : colors.border,
                },
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.label,
                  { color: isActive ? colors.activeText : colors.inactiveText },
                ]}
              >
                {option.label}
              </Text>
              
              {option.count !== undefined && option.count > 0 && (
                <View
                  style={[
                    styles.countBadge,
                    {
                      backgroundColor: isActive
                        ? "rgba(255,255,255,0.25)"
                        : isDark
                        ? "rgba(148,163,184,0.15)"
                        : "rgba(100,116,139,0.15)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.countText,
                      { color: isActive ? colors.activeText : colors.inactiveText },
                    ]}
                  >
                    {option.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    gap: 6,
    // Premium shadow for active chip
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "800",
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    fontSize: 10,
    fontWeight: "900",
  },
});
