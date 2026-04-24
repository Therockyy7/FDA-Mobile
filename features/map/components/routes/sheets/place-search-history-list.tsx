// features/map/components/routes/sheets/place-search-history-list.tsx
// Recent-searches list rendered inside PlaceSearchSheet when the query is empty.

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import type { PlaceSearchHistoryItem } from "~/features/map/stores/usePlaceSearchHistoryStore";

interface PlaceSearchHistoryListProps {
  items: PlaceSearchHistoryItem[];
  isDark: boolean;
  onSelect: (item: PlaceSearchHistoryItem) => void;
  onRemove: (placeId: string) => void;
  onClearAll: () => void;
}

export function PlaceSearchHistoryList({
  items,
  isDark,
  onSelect,
  onRemove,
  onClearAll,
}: PlaceSearchHistoryListProps) {
  if (items.length === 0) return null;

  return (
    <View style={{ paddingTop: 8 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingBottom: 8,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: "600",
            color: isDark ? "#64748B" : "#9CA3AF",
            letterSpacing: 0.5,
          }}
        >
          TÌM KIẾM GẦN ĐÂY
        </Text>
        <TouchableOpacity onPress={onClearAll} hitSlop={8}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: isDark ? "#94A3B8" : "#6B7280",
            }}
          >
            Xoá tất cả
          </Text>
        </TouchableOpacity>
      </View>

      {items.map((item) => (
        <View
          key={item.placeId}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            gap: 12,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? "#334155" : "#F8FAFC",
          }}
        >
          <TouchableOpacity
            onPress={() => onSelect(item)}
            activeOpacity={0.6}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: isDark ? "#334155" : "#F1F5F9",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="time-outline"
                size={18}
                color={isDark ? "#94A3B8" : "#6B7280"}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: isDark ? "#F1F5F9" : "#1F2937",
                }}
                numberOfLines={1}
              >
                {item.name || item.address}
              </Text>
              {item.address && item.address !== item.name ? (
                <Text
                  style={{
                    fontSize: 12,
                    color: isDark ? "#64748B" : "#9CA3AF",
                    marginTop: 2,
                  }}
                  numberOfLines={1}
                >
                  {item.address}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onRemove(item.placeId)}
            hitSlop={8}
            style={{ padding: 4 }}
          >
            <Ionicons
              name="close"
              size={18}
              color={isDark ? "#64748B" : "#9CA3AF"}
            />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}
