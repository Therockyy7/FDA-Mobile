import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";

type PaginationItem = number | "ellipsis";

interface AlertHistoryPaginationProps {
  items: PaginationItem[];
  pageNumber: number;
  totalPages: number;
  onChangePage: (page: number) => void;
  colors: {
    primary: string;
    text: string;
    subtext: string;
    border: string;
    background: string;
  };
}

export function AlertHistoryPagination({
  items,
  pageNumber,
  totalPages,
  onChangePage,
  colors,
}: AlertHistoryPaginationProps) {
  return (
    <View
      testID="alerts-history-pagination"
      className="mt-2.5 mx-4 py-1.5 px-2 rounded-2xl flex-row items-center justify-center gap-1.5 flex-wrap"
    >
      <TouchableOpacity
        testID="alerts-history-pagination-prev"
        activeOpacity={0.85}
        onPress={() => onChangePage(Math.max(1, pageNumber - 1))}
        disabled={pageNumber <= 1}
        className={`w-8 h-8 rounded-2 items-center justify-center border border-slate-300 dark:border-slate-600 ${
          pageNumber <= 1
            ? "bg-slate-100 dark:bg-slate-800 opacity-40"
            : "bg-primary"
        }`}
      >
        <Ionicons
          name="chevron-back"
          size={14}
          color={pageNumber <= 1 ? colors.subtext : "#fff"}
        />
      </TouchableOpacity>

      {items.map((item, index) =>
        item === "ellipsis" ? (
          <View
            key={`ellipsis-${index}`}
            className="w-8 h-8 rounded-2 items-center justify-center"
          >
            <Text className="text-slate-600 dark:text-slate-400 font-bold">...</Text>
          </View>
        ) : (
          <TouchableOpacity
            key={item}
            testID={`alerts-history-pagination-page-${item}`}
            activeOpacity={0.85}
            onPress={() => onChangePage(item)}
            className={`w-8 h-8 rounded-2 items-center justify-center border border-slate-300 dark:border-slate-600 ${
              item === pageNumber
                ? "bg-primary"
                : "bg-slate-50 dark:bg-slate-900"
            }`}
          >
            <Text
              className={`font-bold text-body-sm ${
                item === pageNumber
                  ? "text-white"
                  : "text-slate-900 dark:text-slate-50"
              }`}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ),
      )}

      <TouchableOpacity
        testID="alerts-history-pagination-next"
        activeOpacity={0.85}
        onPress={() => onChangePage(Math.min(totalPages, pageNumber + 1))}
        disabled={pageNumber >= totalPages}
        className={`w-8 h-8 rounded-2 items-center justify-center border border-slate-300 dark:border-slate-600 ${
          pageNumber >= totalPages
            ? "bg-slate-100 dark:bg-slate-800 opacity-40"
            : "bg-primary"
        }`}
      >
        <Ionicons
          name="chevron-forward"
          size={14}
          color={pageNumber >= totalPages ? colors.subtext : "#fff"}
        />
      </TouchableOpacity>
    </View>
  );
}

export default AlertHistoryPagination;
