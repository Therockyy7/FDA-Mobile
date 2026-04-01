// features/payment/components/DowngradeConfirmDialog.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  currentPlanName?: string;
};

const DowngradeConfirmDialog: React.FC<Props> = ({
  visible,
  onClose,
  onConfirm,
  loading = false,
  currentPlanName = "gói hiện tại",
}) => {
  const { isDarkColorScheme } = useColorScheme();

  const colors = {
    overlay: "rgba(0, 0, 0, 0.55)",
    bg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    warningBg: isDarkColorScheme
      ? "rgba(245, 158, 11, 0.12)"
      : "rgba(245, 158, 11, 0.08)",
    warning: "#F59E0B",
    danger: "#EF4444",
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
          {/* Warning Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.warningBg },
            ]}
          >
            <Ionicons
              name="warning-outline"
              size={40}
              color={colors.warning}
            />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            Xác nhận hạ cấp
          </Text>

          {/* Description */}
          <Text style={[styles.description, { color: colors.subtext }]}>
            Bạn đang hạ cấp từ {currentPlanName} xuống gói{" "}
            <Text style={{ fontWeight: "700", color: colors.text }}>
              Miễn phí
            </Text>
            . Bạn sẽ mất các tính năng nâng cao khi quay về gói Miễn phí.
          </Text>

          {/* Warning box */}
          <View
            style={[
              styles.warningBox,
              {
                backgroundColor: colors.warningBg,
                borderColor: colors.warning,
              },
            ]}
          >
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={colors.warning}
              style={{ marginRight: 8, marginTop: 2 }}
            />
            <Text
              style={[styles.warningText, { color: colors.warning }]}
            >
              Thay đổi sẽ có hiệu lực ngay lập tức. Không thể hoàn tác sau khi
              xác nhận.
            </Text>
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
                Hủy bỏ
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmBtn,
                {
                  backgroundColor: colors.danger,
                  opacity: loading ? 0.7 : 1,
                },
              ]}
              onPress={onConfirm}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.confirmBtnText}>Xác nhận hạ cấp</Text>
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  container: {
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 16,
  },
  warningBox: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  warningText: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
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
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});

export default DowngradeConfirmDialog;
