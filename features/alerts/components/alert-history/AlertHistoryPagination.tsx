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
      style={{
        marginTop: 10,
        marginHorizontal: 16,
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 12,
        backgroundColor: "transparent",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        flexWrap: "wrap",
      }}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onChangePage(Math.max(1, pageNumber - 1))}
        disabled={pageNumber <= 1}
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: pageNumber <= 1 ? "transparent" : colors.primary,
          borderWidth: 1,
          borderColor: colors.border,
          opacity: pageNumber <= 1 ? 0.4 : 1,
        }}
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
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: colors.subtext, fontWeight: "700" }}>...</Text>
          </View>
        ) : (
          <TouchableOpacity
            key={item}
            activeOpacity={0.85}
            onPress={() => onChangePage(item)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: item === pageNumber ? colors.primary : "transparent",
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                color: item === pageNumber ? "#fff" : colors.text,
                fontWeight: "700",
                fontSize: 12,
              }}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ),
      )}

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onChangePage(Math.min(totalPages, pageNumber + 1))}
        disabled={pageNumber >= totalPages}
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: pageNumber >= totalPages ? "transparent" : colors.primary,
          borderWidth: 1,
          borderColor: colors.border,
          opacity: pageNumber >= totalPages ? 0.4 : 1,
        }}
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
