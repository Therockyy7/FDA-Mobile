
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
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
    <View
      style={{
        paddingVertical: 4,
        marginBottom: 8,
        backgroundColor: "white",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 4,
        alignItems: "center",
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: 8,
          paddingHorizontal: 16,
        }}
        // Giới hạn chiều cao để không chiếm full màn
        style={{ maxHeight: 40 }}
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
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor,
                alignSelf: "flex-start", // để nút không kéo full height
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
    </View>
  );
}

