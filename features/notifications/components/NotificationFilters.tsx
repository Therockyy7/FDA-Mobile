import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils";
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
  return (
    <View
      testID="notifications-filters-container"
      className="py-3 bg-white dark:bg-bg-dark border-b border-border-light dark:border-border-dark"
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
          const iconName = getFilterIcon(filter.key);

          return (
            <TouchableOpacity
              key={filter.key}
              testID={`notifications-filters-chip-${filter.key}`}
              onPress={() => onFilterChange(filter.key)}
              activeOpacity={0.7}
              className={cn(
                "flex-row items-center gap-1.5 px-3.5 py-2 rounded-xl",
                isActive ? "bg-primary" : "bg-slate-100 dark:bg-slate-800"
              )}
              style={
                isActive && filter.color
                  ? { backgroundColor: filter.color }
                  : undefined
              }
            >
              <Ionicons
                name={iconName as any}
                size={14}
                color={isActive ? "#FFFFFF" : "#6B7280"}
              />
              <Text
                className={
                  isActive
                    ? "text-sm font-bold text-white"
                    : "text-sm font-bold text-slate-500 dark:text-slate-400"
                }
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
