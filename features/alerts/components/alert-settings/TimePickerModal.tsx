// features/alerts/components/alert-settings/TimePickerModal.tsx
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, Modal, Platform, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import type { AlertSettingsColors } from "../../types/alert-settings.types";

interface TimePickerModalProps {
  visible: boolean;
  title: string;
  value: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
  colors: AlertSettingsColors;
}

export function TimePickerModal({
  visible,
  title,
  value,
  onConfirm,
  onCancel,
  colors,
}: TimePickerModalProps) {
  const [tempDate, setTempDate] = useState<Date>(value);
  const [tempHour, setTempHour] = useState<number>(value.getHours());
  const [tempMinute, setTempMinute] = useState<number>(value.getMinutes());
  const hourListRef = useRef<FlatList<number>>(null);
  const minuteListRef = useRef<FlatList<number>>(null);
  const itemHeight = 36;
  const listHeight = itemHeight * 5;
  const hours = Array.from({ length: 24 }, (_, index) => index);
  const minutes = Array.from({ length: 60 }, (_, index) => index);

  const formatNumber = (num: number) => String(num).padStart(2, "0");

  useEffect(() => {
    if (visible) {
      setTempDate(value);
      setTempHour(value.getHours());
      setTempMinute(value.getMinutes());
    }
  }, [value, visible]);

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "dismissed") {
      onCancel();
      return;
    }
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  useEffect(() => {
    if (!visible || Platform.OS !== "android") return;
    requestAnimationFrame(() => {
      hourListRef.current?.scrollToOffset({
        offset: tempHour * itemHeight,
        animated: false,
      });
      minuteListRef.current?.scrollToOffset({
        offset: tempMinute * itemHeight,
        animated: false,
      });
    });
  }, [visible, tempHour, tempMinute, itemHeight]);

  const handleConfirmPress = () => {
    if (Platform.OS === "android") {
      const updated = new Date(value);
      updated.setHours(tempHour, tempMinute, 0, 0);
      onConfirm(updated);
      return;
    }
    onConfirm(tempDate);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: colors.cardBg,
            borderRadius: 16,
            padding: 16,
            width: "100%",
            maxWidth: 360,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 10,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>
              {title}
            </Text>
          </View>
          {Platform.OS === "android" ? (
            <View style={{ marginTop: 6 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 14,
                }}
              >
                <View style={{ flex: 1 }}>
                  <View style={{ height: listHeight, overflow: "hidden" }}>
                    <FlatList
                      ref={hourListRef}
                      data={hours}
                      keyExtractor={(item) => `h-${item}`}
                      showsVerticalScrollIndicator={false}
                      snapToInterval={itemHeight}
                      decelerationRate="fast"
                      getItemLayout={(_, index) => ({
                        length: itemHeight,
                        offset: itemHeight * index,
                        index,
                      })}
                      contentContainerStyle={{
                        paddingVertical: itemHeight * 2,
                      }}
                      onMomentumScrollEnd={(event) => {
                        const index = Math.round(
                          event.nativeEvent.contentOffset.y / itemHeight
                        );
                        setTempHour(Math.min(Math.max(index, 0), 23));
                      }}
                      renderItem={({ item }) => {
                        const isSelected = item === tempHour;
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
                                color: isSelected ? colors.primary : colors.subtext,
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
                        borderColor: colors.primary,
                        backgroundColor: `${colors.primary}10`,
                      }}
                    />
                  </View>
                </View>

                <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text }}>
                  :
                </Text>

                <View style={{ flex: 1 }}>
                  <View style={{ height: listHeight, overflow: "hidden" }}>
                    <FlatList
                      ref={minuteListRef}
                      data={minutes}
                      keyExtractor={(item) => `m-${item}`}
                      showsVerticalScrollIndicator={false}
                      snapToInterval={itemHeight}
                      decelerationRate="fast"
                      getItemLayout={(_, index) => ({
                        length: itemHeight,
                        offset: itemHeight * index,
                        index,
                      })}
                      contentContainerStyle={{
                        paddingVertical: itemHeight * 2,
                      }}
                      onMomentumScrollEnd={(event) => {
                        const index = Math.round(
                          event.nativeEvent.contentOffset.y / itemHeight
                        );
                        setTempMinute(Math.min(Math.max(index, 0), 59));
                      }}
                      renderItem={({ item }) => {
                        const isSelected = item === tempMinute;
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
                                color: isSelected ? colors.primary : colors.subtext,
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
                        borderColor: colors.primary,
                        backgroundColor: `${colors.primary}10`,
                      }}
                    />
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <DateTimePicker
              value={tempDate}
              mode="time"
              display="spinner"
              onChange={handleChange}
              themeVariant="dark"
            />
          )}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 12,
              marginTop: 16,
            }}
          >
            <TouchableOpacity
              onPress={onCancel}
              activeOpacity={0.8}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.mutedBg,
              }}
            >
              <Text style={{ color: colors.subtext, fontWeight: "700" }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirmPress}
              activeOpacity={0.8}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: "center",
                backgroundColor: colors.primary,
              }}
            >
              <Text style={{ color: "white", fontWeight: "700" }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default TimePickerModal;
