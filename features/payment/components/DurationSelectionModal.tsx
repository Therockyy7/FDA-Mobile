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

const BRAND = "#007AFF";

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

  const colors = {
    overlay: "rgba(0, 0, 0, 0.5)",
    bg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    text: isDarkColorScheme ? "#F1F5F9" : "#111827",
    subtext: isDarkColorScheme ? "#94A3B8" : "#6B7280",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    divider: isDarkColorScheme ? "rgba(255,255,255,0.06)" : "#F1F5F6",
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>
                Chọn thời hạn
              </Text>
              <Text style={[styles.subtitle, { color: colors.subtext }]}>
                {planName} — {formatVND(pricePerMonth)}/tháng
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={18} color={colors.subtext} />
            </TouchableOpacity>
          </View>

          {/* Duration Options */}
          <View style={styles.optionsContainer}>
            {DURATION_OPTIONS.map((option) => {
              const isSelected = selected === option.months;
              const isBest = option.months === 12;
              return (
                <TouchableOpacity
                  key={option.months}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: isSelected
                        ? `${BRAND}08`
                        : isDarkColorScheme ? "#0F172A" : "#F8FAFB",
                      borderColor: isSelected ? BRAND : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => setSelected(option.months)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionLeft}>
                    {/* Radio */}
                    <View
                      style={[
                        styles.radio,
                        {
                          borderColor: isSelected ? BRAND : colors.border,
                          backgroundColor: isSelected ? BRAND : "transparent",
                        },
                      ]}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                      )}
                    </View>

                    <View>
                      <View style={styles.labelRow}>
                        <Text
                          style={[
                            styles.optionLabel,
                            {
                              color: isSelected ? BRAND : colors.text,
                              fontWeight: isSelected ? "700" : "600",
                            },
                          ]}
                        >
                          {option.label}
                        </Text>
                        {isBest && (
                          <View
                            style={[
                              styles.bestBadge,
                              { backgroundColor: `${BRAND}15` },
                            ]}
                          >
                            <Text style={[styles.bestBadgeText, { color: BRAND }]}>
                              Tiết kiệm nhất
                            </Text>
                          </View>
                        )}
                      </View>
                      {option.badge && (
                        <Text
                          style={[styles.discountHint, { color: "#10B981" }]}
                        >
                          Giảm {option.badge.replace("−", "")}
                        </Text>
                      )}
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.optionPrice,
                      { color: isSelected ? BRAND : colors.subtext },
                    ]}
                  >
                    {formatVND(calculateTotalPrice(pricePerMonth, option.months))}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* Total */}
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.subtext }]}>
              Tổng thanh toán
            </Text>
            <Text style={[styles.totalValue, { color: BRAND }]}>
              {formatVND(calculateTotalPrice(pricePerMonth, selected))}
            </Text>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[
              styles.ctaBtn,
              { backgroundColor: BRAND, opacity: loading ? 0.7 : 1 },
            ]}
            onPress={() => onConfirm(selected)}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.ctaBtnText}>Tiếp tục</Text>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color="#FFFFFF"
                  style={{ marginLeft: 6 }}
                />
              </>
            )}
          </TouchableOpacity>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "500",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  optionsContainer: {
    gap: 8,
    marginBottom: 16,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  optionLabel: {
    fontSize: 14,
  },
  bestBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bestBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  discountHint: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  optionPrice: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 14,
  },
  ctaBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});

export default DurationSelectionModal;
