// features/areas/components/ConfirmDeleteModal.tsx
// Beautiful confirmation modal for deleting areas
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { Text } from "~/components/ui/text";
import { SHADOW, RADIUS } from "~/lib/design-tokens";

interface ConfirmDeleteModalProps {
  visible: boolean;
  areaName: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function ConfirmDeleteModal({
  visible,
  areaName,
  isDeleting = false,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.container} testID="areas-modal-confirm-delete-container">
        <TouchableOpacity
          style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.65)" }]}
          activeOpacity={1}
          onPress={!isDeleting ? onCancel : undefined}
          testID="areas-modal-confirm-delete-overlay"
        />

        <View
          style={styles.modalContent}
          className="bg-white dark:bg-slate-800"
          testID="areas-modal-confirm-delete-content"
        >
          {/* Warning Icon */}
          <LinearGradient
            colors={["#FEE2E2", "#FECACA", "#FCA5A5"]}
            style={styles.iconContainer}
          >
            <View style={styles.iconInner}>
              <Ionicons name="trash" size={32} color="#EF4444" />
            </View>
          </LinearGradient>

          {/* Title */}
          <Text className="text-xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight mb-3 text-center">
            Xóa vùng theo dõi?
          </Text>

          {/* Description */}
          <Text className="text-sm leading-6 text-center text-slate-500 dark:text-slate-400 mb-4 px-1">
            Bạn có chắc chắn muốn xóa vùng{" "}
            <Text className="text-red-500 font-bold">
              &ldquo;{areaName}&rdquo;
            </Text>
            ? Hành động này không thể hoàn tác.
          </Text>

          {/* Warning Box */}
          <View
            style={styles.warningBox}
            className="bg-red-50 dark:bg-red-950/20"
            testID="areas-modal-confirm-delete-warning"
          >
            <Ionicons name="warning" size={18} color="#EF4444" />
            <Text className="text-xs font-semibold text-red-500 flex-1">
              Tất cả dữ liệu và cảnh báo sẽ bị xóa vĩnh viễn
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              className="bg-slate-100 dark:bg-slate-700"
              onPress={onCancel}
              activeOpacity={0.7}
              disabled={isDeleting}
              testID="areas-modal-confirm-delete-cancel"
            >
              <Text className="text-base font-bold text-slate-800 dark:text-slate-100">
                Hủy bỏ
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButtonWrapper}
              onPress={onConfirm}
              activeOpacity={0.9}
              disabled={isDeleting}
              testID="areas-modal-confirm-delete-confirm"
            >
              <LinearGradient
                colors={
                  isDeleting
                    ? ["#9CA3AF", "#6B7280"]
                    : ["#EF4444", "#DC2626", "#B91C1C"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.deleteButton}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={18} color="white" />
                    <Text className="text-base font-bold text-white">
                      Xóa vùng
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  overlay: { ...StyleSheet.absoluteFillObject },
  modalContent: {
    width: SCREEN_WIDTH - 48,
    maxWidth: 360,
    borderRadius: RADIUS.sheet,
    padding: 28,
    alignItems: "center",
    ...SHADOW.lg,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  iconInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: RADIUS.button,
    marginBottom: 24,
    width: "100%",
  },
  buttonContainer: { flexDirection: "row", gap: 12, width: "100%" },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: RADIUS.button,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonWrapper: { flex: 1 },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: RADIUS.button,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default ConfirmDeleteModal;
