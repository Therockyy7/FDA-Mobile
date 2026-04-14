// features/alerts/components/alert-settings/TimePickerModal.tsx
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, Modal, Platform, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { SHADOW } from "~/lib/design-tokens";
import type { AlertSettingsColors } from "../../types/alert-settings.types";
import { TimePickerScrollColumn } from "./time-picker-scroll-column";

interface TimePickerModalProps {
  visible: boolean;
  title: string;
  value: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
  colors: AlertSettingsColors;
}

const ITEM_HEIGHT = 36;
const LIST_HEIGHT = ITEM_HEIGHT * 5;
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

export function TimePickerModal({
  visible,
  title,
  value,
  onConfirm,
  onCancel,
  colors,
}: TimePickerModalProps) {
  const [tempDate, setTempDate] = useState<Date>(value);
  const [tempHour, setTempHour] = useState<number>(() => {
    const hour = value.getHours();
    return isNaN(hour) ? 0 : hour;
  });
  const [tempMinute, setTempMinute] = useState<number>(() => {
    const minute = value.getMinutes();
    return isNaN(minute) ? 0 : minute;
  });
  const hourListRef = useRef<FlatList<number>>(null);
  const minuteListRef = useRef<FlatList<number>>(null);

  useEffect(() => {
    if (visible) {
      setTempDate(value);
      const safeHour = isNaN(value.getHours()) ? 0 : value.getHours();
      const safeMinute = isNaN(value.getMinutes()) ? 0 : value.getMinutes();
      setTempHour(safeHour);
      setTempMinute(safeMinute);
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
      if (hourListRef.current) {
        hourListRef.current.scrollToOffset({
          offset: tempHour * ITEM_HEIGHT,
          animated: false,
        });
      }
      if (minuteListRef.current) {
        minuteListRef.current.scrollToOffset({
          offset: tempMinute * ITEM_HEIGHT,
          animated: false,
        });
      }
    });
  }, [visible, tempHour, tempMinute]);

  const handleConfirmPress = () => {
    if (Platform.OS === "android") {
      const safeHour = Math.max(0, Math.min(23, tempHour));
      const safeMinute = Math.max(0, Math.min(59, tempMinute));
      const updated = new Date(value);
      updated.setHours(safeHour, safeMinute, 0, 0);
      onConfirm(updated);
      return;
    }
    onConfirm(tempDate);
  };

  return (
    <Modal
      testID="alerts-settings-time-picker-modal"
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
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
            ...SHADOW.lg,
          }}
        >
          <Text
            testID="alerts-settings-time-picker-title"
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: colors.text,
              marginBottom: 12,
            }}
          >
            {title}
          </Text>

          {Platform.OS === "android" ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                marginTop: 6,
              }}
            >
              <TimePickerScrollColumn
                ref={hourListRef}
                data={HOURS}
                selectedValue={tempHour}
                keyPrefix="h"
                maxValue={23}
                itemHeight={ITEM_HEIGHT}
                listHeight={LIST_HEIGHT}
                primaryColor={colors.primary}
                subtextColor={colors.subtext}
                onValueChange={setTempHour}
              />
              <Text
                style={{ fontSize: 20, fontWeight: "700", color: colors.text }}
              >
                :
              </Text>
              <TimePickerScrollColumn
                ref={minuteListRef}
                data={MINUTES}
                selectedValue={tempMinute}
                keyPrefix="m"
                maxValue={59}
                itemHeight={ITEM_HEIGHT}
                listHeight={LIST_HEIGHT}
                primaryColor={colors.primary}
                subtextColor={colors.subtext}
                onValueChange={setTempMinute}
              />
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
              testID="alerts-settings-time-picker-cancel"
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
              <Text style={{ color: colors.subtext, fontWeight: "700" }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="alerts-settings-time-picker-confirm"
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
              <Text className="text-white font-bold">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default TimePickerModal;
