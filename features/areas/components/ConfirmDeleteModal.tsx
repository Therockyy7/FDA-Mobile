// features/areas/components/ConfirmDeleteModal.tsx
// Beautiful confirmation modal for deleting areas
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withSpring,
} from "react-native-reanimated";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

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
  const { isDarkColorScheme } = useColorScheme();

  // Animations
  const iconScale = useSharedValue(0);
  const iconRotation = useSharedValue(0);
  const contentScale = useSharedValue(0.8);
  const contentOpacity = useSharedValue(0);

  const colors = {
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#6B7280",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    overlay: "rgba(0, 0, 0, 0.65)",
    danger: "#EF4444",
    dangerBg: isDarkColorScheme
      ? "rgba(239, 68, 68, 0.15)"
      : "rgba(239, 68, 68, 0.1)",
    cancelBg: isDarkColorScheme ? "#334155" : "#F3F4F6",
  };

  useEffect(() => {
    if (visible) {
      contentScale.value = withSpring(1, { damping: 12, stiffness: 200 });
      contentOpacity.value = withSpring(1);
      iconScale.value = withSequence(
        withDelay(100, withSpring(1.2, { damping: 8 })),
        withSpring(1, { damping: 10 }),
      );
      iconRotation.value = withSequence(
        withDelay(100, withSpring(-10)),
        withSpring(10),
        withSpring(0),
      );
    } else {
      contentScale.value = 0.8;
      contentOpacity.value = 0;
      iconScale.value = 0;
      iconRotation.value = 0;
    }
  }, [visible, contentScale, contentOpacity, iconScale, iconRotation]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: contentScale.value }],
    opacity: contentOpacity.value,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.container}>
        {/* Overlay Background */}
        <TouchableOpacity
          style={[styles.overlay, { backgroundColor: colors.overlay }]}
          activeOpacity={1}
          onPress={!isDeleting ? onCancel : undefined}
        />

        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContent,
            { backgroundColor: colors.cardBg },
            contentAnimatedStyle,
          ]}
        >
          {/* Warning Icon with Animation */}
          <Animated.View style={iconAnimatedStyle}>
            <LinearGradient
              colors={["#FEE2E2", "#FECACA", "#FCA5A5"]}
              style={styles.iconContainer}
            >
              <View style={styles.iconInner}>
                <Ionicons name="trash" size={32} color={colors.danger} />
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            Xóa vùng theo dõi?
          </Text>

          {/* Description */}
          <Text style={[styles.description, { color: colors.subtext }]}>
            Bạn có chắc chắn muốn xóa vùng{" "}
            <Text style={{ color: colors.danger, fontWeight: "700" }}>
              &ldquo;{areaName}&rdquo;
            </Text>
            ? Hành động này không thể hoàn tác.
          </Text>

          {/* Warning Box */}
          <View
            style={[styles.warningBox, { backgroundColor: colors.dangerBg }]}
          >
            <Ionicons name="warning" size={18} color={colors.danger} />
            <Text style={[styles.warningText, { color: colors.danger }]}>
              Tất cả dữ liệu và cảnh báo sẽ bị xóa vĩnh viễn
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.cancelButton,
                { backgroundColor: colors.cancelBg },
              ]}
              onPress={onCancel}
              activeOpacity={0.7}
              disabled={isDeleting}
            >
              <Text style={[styles.cancelText, { color: colors.text }]}>
                Hủy bỏ
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButtonWrapper}
              onPress={onConfirm}
              activeOpacity={0.9}
              disabled={isDeleting}
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
                    <Text style={styles.deleteText}>Xóa vùng</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: SCREEN_WIDTH - 48,
    maxWidth: 360,
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 25,
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
  title: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
    width: "100%",
  },
  warningText: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "700",
  },
  deleteButtonWrapper: {
    flex: 1,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  deleteText: {
    fontSize: 15,
    fontWeight: "700",
    color: "white",
  },
});

export default ConfirmDeleteModal;
