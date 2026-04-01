// features/payment/components/DurationSelectionModal.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { DurationMonths } from "../types/payment-types";
import {
    calculateTotalPrice,
    DURATION_OPTIONS,
    formatVND,
} from "../utils/payment-utils";

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (durationMonths: DurationMonths) => void;
  planName: string;
  planCode: string;
  pricePerMonth: number;
  loading?: boolean;
};

const DurationSelectionModal: React.FC<Props> = ({
  visible,
  onClose,
  onConfirm,
  planName,
  planCode,
  pricePerMonth,
  loading = false,
}) => {
  const { isDarkColorScheme } = useColorScheme();
  const [selected, setSelected] = useState<DurationMonths>(1);

  const totalPrice = calculateTotalPrice(pricePerMonth, selected);

  const accentColor =
    planCode === "MONITOR" ? "#8B5CF6" : "#0077BE";

  const colors = {
    overlay: "rgba(0, 0, 0, 0.55)",
    bg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    cardBg: isDarkColorScheme ? "#0F172A" : "#F8FAFC",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    selectedBorder: accentColor,
    selectedBg: isDarkColorScheme
      ? "rgba(0, 119, 190, 0.15)"
      : "rgba(0, 119, 190, 0.06)",
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.text }]}>
                Chọn thời hạn
              </Text>
              <Text style={[styles.subtitle, { color: colors.subtext }]}>
                Gói {planName} — {formatVND(pricePerMonth)}/tháng
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.cardBg }]}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color={colors.subtext} />
            </TouchableOpacity>
          </View>

          {/* Duration Options */}
          <View style={styles.optionsContainer}>
            {DURATION_OPTIONS.map((option) => {
              const isSelected = selected === option.months;
              return (
                <TouchableOpacity
                  key={option.months}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: isSelected
                        ? colors.selectedBg
                        : colors.cardBg,
                      borderColor: isSelected
                        ? colors.selectedBorder
                        : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => setSelected(option.months)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionLeft}>
                    <View
                      style={[
                        styles.radio,
                        {
                          borderColor: isSelected
                            ? accentColor
                            : colors.border,
                        },
                      ]}
                    >
                      {isSelected && (
                        <View
                          style={[
                            styles.radioInner,
                            { backgroundColor: accentColor },
                          ]}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.optionLabel,
                        {
                          color: colors.text,
                          fontWeight: isSelected ? "700" : "500",
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {option.badge && (
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: accentColor },
                        ]}
                      >
                        <Text style={styles.badgeText}>{option.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.optionPrice,
                      { color: isSelected ? accentColor : colors.subtext },
                    ]}
                  >
                    {formatVND(calculateTotalPrice(pricePerMonth, option.months))}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Summary */}
          <View
            style={[
              styles.summary,
              { backgroundColor: colors.cardBg, borderColor: colors.border },
            ]}
          >
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.subtext }]}>
                Thời hạn
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {DURATION_OPTIONS.find((o) => o.months === selected)?.label}
              </Text>
            </View>
            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.subtext }]}>
                Tổng thanh toán
              </Text>
              <Text
                style={[
                  styles.summaryTotal,
                  { color: accentColor },
                ]}
              >
                {formatVND(totalPrice)}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: colors.border }]}
              onPress={onClose}
              activeOpacity={0.7}
              disabled={loading}
            >
              <Text style={[styles.cancelBtnText, { color: colors.subtext }]}>
                Hủy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmBtn,
                { backgroundColor: accentColor, opacity: loading ? 0.7 : 1 },
              ]}
              onPress={() => onConfirm(selected)}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons
                    name="card-outline"
                    size={18}
                    color="#FFFFFF"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.confirmBtnText}>Thanh toán</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 36,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionsContainer: {
    gap: 10,
    marginBottom: 20,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  optionLabel: {
    fontSize: 15,
  },
  optionPrice: {
    fontSize: 15,
    fontWeight: "700",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  summary: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: "800",
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  confirmBtn: {
    flex: 2,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});

export default DurationSelectionModal;
