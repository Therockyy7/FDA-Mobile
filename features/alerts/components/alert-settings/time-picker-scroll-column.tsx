// features/alerts/components/alert-settings/time-picker-scroll-column.tsx
// Android-only drum-roller column used by TimePickerModal.
import React, { forwardRef } from "react";
import { FlatList, View } from "react-native";
import { Text } from "~/components/ui/text";

interface TimePickerScrollColumnProps {
  data: number[];
  selectedValue: number;
  keyPrefix: string;
  maxValue: number;
  itemHeight: number;
  listHeight: number;
  primaryColor: string;
  subtextColor: string;
  onValueChange: (value: number) => void;
}

const formatNumber = (num: number) => String(num).padStart(2, "0");

export const TimePickerScrollColumn = forwardRef<
  FlatList<number>,
  TimePickerScrollColumnProps
>(function TimePickerScrollColumn(
  {
    data,
    selectedValue,
    keyPrefix,
    maxValue,
    itemHeight,
    listHeight,
    primaryColor,
    subtextColor,
    onValueChange,
  },
  ref
) {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: listHeight, overflow: "hidden" }}>
        <FlatList
          ref={ref}
          data={data}
          keyExtractor={(item) => `${keyPrefix}-${item}`}
          showsVerticalScrollIndicator={false}
          snapToInterval={itemHeight}
          decelerationRate="fast"
          getItemLayout={(_, index) => ({
            length: itemHeight,
            offset: itemHeight * index,
            index,
          })}
          contentContainerStyle={{ paddingVertical: itemHeight * 2 }}
          onMomentumScrollEnd={(event) => {
            if (!event.nativeEvent || itemHeight === 0) return;
            const index = Math.round(
              event.nativeEvent.contentOffset.y / itemHeight
            );
            onValueChange(Math.min(Math.max(index, 0), Math.max(maxValue, 0)));
          }}
          renderItem={({ item }) => {
            const isSelected = item === selectedValue;
            return (
              <View
                style={{
                  height: itemHeight,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: isSelected ? 20 : 16,
                    fontWeight: isSelected ? "800" : "500",
                    color: isSelected ? primaryColor : subtextColor,
                  }}
                >
                  {formatNumber(item)}
                </Text>
              </View>
            );
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: itemHeight * 2,
            left: 0,
            right: 0,
            height: itemHeight,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: primaryColor,
            backgroundColor: primaryColor && typeof primaryColor === "string"
              ? `${primaryColor}10`
              : "rgba(59, 130, 246, 0.1)",
          }}
        />
      </View>
    </View>
  );
});
