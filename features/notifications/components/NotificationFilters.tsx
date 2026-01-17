
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { FilterOption } from "../types/notifications-types";

interface NotificationFiltersProps {
  filters: FilterOption[];
  activeFilter: string;
  onFilterChange: (filter: FilterOption["key"]) => void;
}

const getFilterIcon = (key: string) => {
  switch (key) {
    case "all":
      return "apps";
    case "high":
      return "warning";
    case "medium":
      return "alert-circle";
    case "low":
      return "checkmark-circle";
    default:
      return "ellipse";
  }
};

export function NotificationFilters({
  filters,
  activeFilter,
  onFilterChange,
}: NotificationFiltersProps) {
  const { isDarkColorScheme } = useColorScheme();

  // Theme colors
  const colors = {
    background: isDarkColorScheme ? "#0F172A" : "#FFFFFF",
    border: isDarkColorScheme ? "#1E293B" : "#E5E7EB",
    inactiveBg: isDarkColorScheme ? "#1E293B" : "#F3F4F6",
    inactiveText: isDarkColorScheme ? "#94A3B8" : "#6B7280",
  };

  return (
    <View
      style={{
        paddingVertical: 12,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: 10,
          paddingHorizontal: 16,
        }}
      >
        {filters.map((filter) => {
          const isActive = activeFilter === filter.key;
          const backgroundColor = isActive
            ? filter.color || "#3B82F6"
            : colors.inactiveBg;
          const textColor = isActive ? "white" : colors.inactiveText;

          return (
            <TouchableOpacity
              key={filter.key}
              onPress={() => onFilterChange(filter.key)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 12,
                backgroundColor,
              }}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={getFilterIcon(filter.key) as any} 
                size={14} 
                color={textColor} 
              />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: textColor,
                }}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
