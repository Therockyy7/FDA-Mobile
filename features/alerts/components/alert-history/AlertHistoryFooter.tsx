import React from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "~/components/ui/text";

interface AlertHistoryFooterProps {
  isFetchingNextPage: boolean;
  hasNextPage: boolean | undefined;
  onLoadMore: () => void;
  currentPage: number;
  totalPages: number;
  textColor: string;
  inactiveBg: string;
  inactiveBorder: string;
}

export function AlertHistoryFooter({
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
  currentPage,
  totalPages,
  textColor,
  inactiveBg,
  inactiveBorder,
}: AlertHistoryFooterProps) {
  return (
    <View
      style={{
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: "center",
        gap: 12,
      }}
    >
      {/* Page indicator */}
      <Text style={{ fontSize: 13, color: textColor }}>
        Trang {currentPage} / {totalPages}
      </Text>

      {/* Load more / end state */}
      {isFetchingNextPage ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : hasNextPage ? (
        <TouchableOpacity
          onPress={onLoadMore}
          style={{
            width: "100%",
            paddingVertical: 14,
            backgroundColor: inactiveBg,
            borderRadius: 8,
            alignItems: "center",
            borderWidth: 1,
            borderColor: inactiveBorder,
            flexDirection: "row",
            gap: 6,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "600", color: textColor }}>
            Xem thêm cảnh báo
          </Text>
          <Ionicons name="chevron-down" size={14} color={textColor} />
        </TouchableOpacity>
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="checkmark-circle" size={14} color={textColor} />
          <Text style={{ fontSize: 13, color: textColor }}>
            Không còn cảnh báo cũ hơn.
          </Text>
        </View>
      )}
    </View>
  );
}

export default AlertHistoryFooter;
