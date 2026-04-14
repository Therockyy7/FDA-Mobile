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
      testID="alerts-history-footer"
      className="py-3 px-4 items-center gap-3"
    >
      {/* Page indicator */}
      <Text testID="alerts-history-footer-page-info" style={{ color: textColor }} className="text-body-sm">
        Trang {currentPage} / {totalPages}
      </Text>

      {/* Load more / end state */}
      {isFetchingNextPage ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : hasNextPage ? (
        <TouchableOpacity
          testID="alerts-history-footer-load-more"
          onPress={onLoadMore}
          className="w-full py-3.5 rounded-xl items-center flex-row gap-1.5 border"
          style={{
            backgroundColor: inactiveBg,
            borderColor: inactiveBorder,
          }}
        >
          <Text testID="alerts-history-footer-load-more-text" style={{ color: textColor }} className="text-body-sm font-semibold">
            Xem thêm cảnh báo
          </Text>
          <Ionicons name="chevron-down" size={14} color={textColor} />
        </TouchableOpacity>
      ) : (
        <View testID="alerts-history-footer-end" className="flex-row items-center gap-1">
          <Ionicons name="checkmark-circle" size={14} color={textColor} />
          <Text style={{ color: textColor }} className="text-body-sm">
            Không còn cảnh báo cũ hơn.
          </Text>
        </View>
      )}
    </View>
  );
}

export default AlertHistoryFooter;
