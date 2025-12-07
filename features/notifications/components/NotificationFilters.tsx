
import React from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { Text } from "~/components/ui/text";
import { FilterOption } from "../types/notifications-types";

interface NotificationFiltersProps {
  filters: FilterOption[];
  activeFilter: string;
  onFilterChange: (filter: FilterOption["key"]) => void;
}

export function NotificationFilters({
  filters,
  activeFilter,
  onFilterChange,
}: NotificationFiltersProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
      style={{ marginBottom: 16 }}
    >
      {filters.map((filter) => {
        const isActive = activeFilter === filter.key;
        const backgroundColor = isActive
          ? filter.color || "#3B82F6"
          : "#F3F4F6";

        return (
          <TouchableOpacity
            key={filter.key}
            onPress={() => onFilterChange(filter.key)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 12,
              backgroundColor,
            }}
            activeOpacity={0.7}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: isActive ? "white" : "#6B7280",
              }}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
