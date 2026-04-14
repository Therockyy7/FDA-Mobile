// features/areas/components/AreaCreationErrorModal.tsx
// Beautiful error modal specifically for area creation/update errors
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Dimensions,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "~/components/ui/text";
import type { AreaError } from "~/features/areas/hooks/useControlArea";
import { SHADOW, RADIUS } from "~/lib/design-tokens";

interface AreaCreationErrorModalProps {
  visible: boolean;
  error: AreaError | null;
  onClose: () => void;
  onChangeLocation?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function AreaCreationErrorModal({
  visible,
  error,
  onClose,
  onChangeLocation,
}: AreaCreationErrorModalProps) {
  const isDuplicateError = error?.type === "duplicate";
  const accentColor = isDuplicateError ? "#F59E0B" : "#EF4444";

  if (!error) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container} testID="areas-modal-creation-error-container">
        {/* Static Overlay */}
        <View style={StyleSheet.absoluteFill}>
          {Platform.OS === "ios" ? (
            <BlurView
              intensity={25}
              tint="dark"
              style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.4)" }]}
            />
          ) : (
            <View style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.7)" }]} />
          )}
        </View>

        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          testID="areas-modal-creation-error-overlay"
        />

        <View
          style={[
            styles.modalContent,
            { borderColor: isDuplicateError ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.2)" },
          ]}
          className="bg-white dark:bg-slate-800"
          testID="areas-modal-creation-error-content"
        >
          <View style={[styles.glowEffect, { backgroundColor: accentColor }]} />

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            className="bg-slate-100 dark:bg-slate-700"
            onPress={onClose}
            activeOpacity={0.7}
            testID="areas-modal-creation-error-close"
          >
            <Ionicons name="close" size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconWrapper}>
            <View style={[styles.pulseRing, { borderColor: accentColor }]} />
            <View>
              <LinearGradient
                colors={
                  isDuplicateError
                    ? ["#FEF3C7", "#FDE68A", "#FCD34D"]
                    : ["#FEE2E2", "#FECACA", "#FCA5A5"]
                }
                style={styles.iconOuter}
              >
                <LinearGradient
                  colors={
                    isDuplicateError
                      ? ["#F59E0B", "#D97706", "#B45309"]
                      : ["#EF4444", "#DC2626", "#B91C1C"]
                  }
                  style={styles.iconInner}
                >
                  <Ionicons
                    name={isDuplicateError ? "location" : "alert-circle"}
                    size={36}
                    color="white"
                  />
                </LinearGradient>
              </LinearGradient>
            </View>
          </View>

          {/* Title */}
          <Text className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight mb-3 text-center">
            {error.title}
          </Text>

          {/* Duplicate badge */}
          {isDuplicateError && error.existingAreaName && (
            <View
              style={[
                styles.existingAreaBadge,
                {
                  backgroundColor: "rgba(245,158,11,0.08)",
                  borderColor: "rgba(245,158,11,0.2)",
                },
              ]}
              testID="areas-modal-creation-error-existing-badge"
            >
              <Ionicons name="pin" size={14} color={accentColor} />
              <Text className="text-sm font-bold text-amber-500">
                {error.existingAreaName}
              </Text>
            </View>
          )}

          {/* Message Box */}
          <View
            style={[
              styles.messageBox,
              {
                backgroundColor: isDuplicateError
                  ? "rgba(245,158,11,0.08)"
                  : "rgba(239,68,68,0.08)",
                borderColor: isDuplicateError
                  ? "rgba(245,158,11,0.2)"
                  : "rgba(239,68,68,0.2)",
              },
            ]}
            testID="areas-modal-creation-error-message"
          >
            <View style={styles.messageHeader}>
              <Ionicons
                name={isDuplicateError ? "information-circle" : "warning"}
                size={22}
                color={accentColor}
              />
              <Text
                className="text-xs font-bold uppercase tracking-wide"
                style={{ color: accentColor }}
              >
                {isDuplicateError ? "Vị trí trùng lặp" : "Chi tiết lỗi"}
              </Text>
            </View>
            <Text className="text-sm leading-6 text-slate-500 dark:text-slate-400">
              {error.message}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {isDuplicateError && onChangeLocation && (
              <TouchableOpacity
                style={styles.secondaryButton}
                className="bg-slate-100 dark:bg-slate-700"
                onPress={() => { onClose(); onChangeLocation(); }}
                activeOpacity={0.7}
                testID="areas-modal-creation-error-change-location"
              >
                <Ionicons name="navigate" size={18} color="#1F2937" />
                <Text className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Đổi vị trí
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.primaryButton,
                !isDuplicateError || !onChangeLocation
                  ? { width: "100%" }
                  : { flex: 1 },
              ]}
              onPress={onClose}
              activeOpacity={0.9}
              testID="areas-modal-creation-error-confirm"
            >
              <LinearGradient
                colors={["#007AFF", "#2563EB", "#1D4ED8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButtonGradient}
              >
                <Ionicons name="checkmark-circle" size={18} color="white" />
                <Text className="text-base font-bold text-white">Đã hiểu</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Tips */}
          {isDuplicateError && (
            <View style={styles.tipsContainer} testID="areas-modal-creation-error-tips">
              {[
                "Di chuyển đến vị trí khác cách xa hơn 50m",
                `Hoặc chỉnh sửa vùng "${error.existingAreaName}" hiện có`,
              ].map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <View style={[styles.tipBullet, { backgroundColor: accentColor }]} />
                  <Text className="text-xs leading-5 text-slate-500 dark:text-slate-400 flex-1">
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          )}
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
    maxWidth: 380,
    borderRadius: RADIUS.sheet,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    overflow: "hidden",
    ...SHADOW.lg,
  },
  glowEffect: {
    position: "absolute",
    top: -50,
    left: "50%",
    marginLeft: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.3,
  },
  closeButton: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  iconWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    marginTop: 8,
  },
  pulseRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
  },
  iconOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  iconInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  existingAreaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  messageBox: {
    width: "100%",
    borderRadius: RADIUS.card,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  buttonContainer: { flexDirection: "row", gap: 12, width: "100%" },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: RADIUS.button,
  },
  primaryButton: { flex: 1 },
  primaryButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: RADIUS.button,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  tipsContainer: { width: "100%", marginTop: 16, gap: 8 },
  tipRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  tipBullet: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
});

export default AreaCreationErrorModal;
