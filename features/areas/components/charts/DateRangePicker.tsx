// features/areas/components/charts/DateRangePicker.tsx
// Custom date range picker for flood trends custom period
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Modal, Platform, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isDark?: boolean;
  visible: boolean;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onConfirm,
  onCancel,
  isDark = false,
  visible,
}: DateRangePickerProps) {
  const [activeField, setActiveField] = useState<"start" | "end" | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const colors = {
    background: isDark ? "#1E293B" : "#FFFFFF",
    overlay: "rgba(0, 0, 0, 0.5)",
    text: isDark ? "#F1F5F9" : "#1F2937",
    subtext: isDark ? "#94A3B8" : "#6B7280",
    border: isDark ? "#334155" : "#E2E8F0",
    primary: "#3B82F6",
    inputBg: isDark ? "#0F172A" : "#F8FAFC",
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    if (selectedDate) {
      if (activeField === "start") {
        onStartDateChange(selectedDate);
      } else if (activeField === "end") {
        onEndDateChange(selectedDate);
      }
    }
    if (Platform.OS === "android") {
      setActiveField(null);
    }
  };

  const openPicker = (field: "start" | "end") => {
    setActiveField(field);
    setShowPicker(true);
  };

  const closePicker = () => {
    setShowPicker(false);
    setActiveField(null);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: colors.overlay,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: colors.background,
            borderRadius: 20,
            padding: 20,
            width: "100%",
            maxWidth: 350,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Ionicons name="calendar" size={20} color={colors.primary} />
              <Text
                style={{ fontSize: 16, fontWeight: "700", color: colors.text }}
              >
                Chọn khoảng thời gian
              </Text>
            </View>
            <TouchableOpacity onPress={onCancel}>
              <Ionicons name="close" size={24} color={colors.subtext} />
            </TouchableOpacity>
          </View>

          {/* Start Date Field */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: colors.subtext,
                marginBottom: 8,
              }}
            >
              Từ ngày
            </Text>
            <TouchableOpacity
              onPress={() => openPicker("start")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: colors.inputBg,
                borderRadius: 12,
                padding: 14,
                borderWidth: 2,
                borderColor:
                  activeField === "start" ? colors.primary : colors.border,
              }}
            >
              <Text
                style={{ fontSize: 15, fontWeight: "600", color: colors.text }}
              >
                {formatDate(startDate)}
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.subtext} />
            </TouchableOpacity>
          </View>

          {/* End Date Field */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: colors.subtext,
                marginBottom: 8,
              }}
            >
              Đến ngày
            </Text>
            <TouchableOpacity
              onPress={() => openPicker("end")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: colors.inputBg,
                borderRadius: 12,
                padding: 14,
                borderWidth: 2,
                borderColor:
                  activeField === "end" ? colors.primary : colors.border,
              }}
            >
              <Text
                style={{ fontSize: 15, fontWeight: "600", color: colors.text }}
              >
                {formatDate(endDate)}
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.subtext} />
            </TouchableOpacity>
          </View>

          {/* Date Range Summary */}
          <View
            style={{
              backgroundColor: colors.inputBg,
              borderRadius: 12,
              padding: 12,
              marginBottom: 20,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Ionicons name="time-outline" size={16} color={colors.primary} />
            <Text style={{ fontSize: 13, color: colors.subtext }}>
              {Math.ceil(
                (endDate.getTime() - startDate.getTime()) /
                  (1000 * 60 * 60 * 24),
              )}{" "}
              ngày
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={onCancel}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: colors.inputBg,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.subtext,
                }}
              >
                Hủy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: colors.primary,
                alignItems: "center",
              }}
            >
              <Text
                style={{ fontSize: 14, fontWeight: "700", color: "#FFFFFF" }}
              >
                Áp dụng
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Native Date Picker */}
        {showPicker && (
          <View>
            {Platform.OS === "ios" ? (
              <Modal visible={showPicker} transparent animationType="slide">
                <View
                  style={{
                    flex: 1,
                    justifyContent: "flex-end",
                    backgroundColor: "rgba(0,0,0,0.3)",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: colors.background,
                      borderTopLeftRadius: 20,
                      borderTopRightRadius: 20,
                      paddingBottom: 34,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        padding: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                      }}
                    >
                      <TouchableOpacity onPress={closePicker}>
                        <Text style={{ fontSize: 16, color: colors.subtext }}>
                          Hủy
                        </Text>
                      </TouchableOpacity>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: colors.text,
                        }}
                      >
                        {activeField === "start" ? "Từ ngày" : "Đến ngày"}
                      </Text>
                      <TouchableOpacity onPress={closePicker}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color: colors.primary,
                          }}
                        >
                          Xong
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={activeField === "start" ? startDate : endDate}
                      mode="date"
                      display="spinner"
                      onChange={handleDateChange}
                      maximumDate={new Date()}
                      textColor={colors.text}
                    />
                  </View>
                </View>
              </Modal>
            ) : (
              <DateTimePicker
                value={activeField === "start" ? startDate : endDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>
        )}
      </View>
    </Modal>
  );
}
