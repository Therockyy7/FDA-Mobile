// features/areas/components/ErrorModal.tsx
// Beautiful error notification modal for area operations
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import {
    Dimensions,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { Text } from "~/components/ui/text";
import { SHADOW, RADIUS } from "~/lib/design-tokens";

interface ErrorModalProps {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  actionText?: string;
  onAction?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function ErrorModal({
  visible,
  title = "Đã xảy ra lỗi",
  message,
  onClose,
  actionText,
  onAction,
}: ErrorModalProps) {
  const iconScale = useSharedValue(0);
  const iconShake = useSharedValue(0);
  const pulseOpacity = useSharedValue(0.4);
  const contentScale = useSharedValue(0.8);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      contentScale.value = withSpring(1, { damping: 12, stiffness: 200 });
      contentOpacity.value = withSpring(1);

      iconScale.value = withSequence(
        withDelay(100, withSpring(1.3, { damping: 6 })),
        withSpring(1, { damping: 8 }),
      );

      iconShake.value = withSequence(
        withDelay(200, withTiming(-8, { duration: 50 })),
        withTiming(8, { duration: 50 }),
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(-3, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );

      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
    } else {
      contentScale.value = 0.8;
      contentOpacity.value = 0;
      iconScale.value = 0;
      iconShake.value = 0;
      pulseOpacity.value = 0.4;
    }
  }, [visible, contentScale, contentOpacity, iconScale, iconShake, pulseOpacity]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
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
      onRequestClose={onClose}
    >
      <View style={styles.container} testID="areas-modal-error-container">
        <TouchableOpacity
          style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.65)" }]}
          activeOpacity={1}
          onPress={onClose}
          testID="areas-modal-error-overlay"
        />

        <Animated.View
          style={[styles.modalContent, contentAnimatedStyle]}
          className="bg-white dark:bg-slate-800"
          testID="areas-modal-error-content"
        >
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            className="bg-slate-100 dark:bg-slate-700"
            onPress={onClose}
            activeOpacity={0.7}
            testID="areas-modal-error-close"
          >
            <Ionicons name="close" size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Error Icon with Animations */}
          <View style={styles.iconWrapper}>
            <Animated.View
              style={[styles.pulseRing, { borderColor: "#EF4444" }, pulseStyle]}
            />
            <Animated.View style={iconAnimatedStyle}>
              <LinearGradient
                colors={["#FEE2E2", "#FECACA", "#FCA5A5"]}
                style={styles.iconContainer}
              >
                <LinearGradient
                  colors={["#EF4444", "#DC2626"]}
                  style={styles.iconInner}
                >
                  <Ionicons name="alert" size={32} color="white" />
                </LinearGradient>
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Title */}
          <Text className="text-slate-900 dark:text-slate-50 text-xl font-extrabold tracking-tight mb-4 text-center">
            {title}
          </Text>

          {/* Error Message Box */}
          <View
            style={styles.messageBox}
            className="bg-red-50 dark:bg-red-950/20"
          >
            <View style={styles.messageContent}>
              <Ionicons name="information-circle" size={20} color="#EF4444" />
              <Text className="text-sm leading-5 text-slate-500 dark:text-slate-400 flex-1">
                {message}
              </Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {onAction && actionText && (
              <TouchableOpacity
                style={styles.actionButton}
                className="bg-slate-100 dark:bg-slate-700"
                onPress={onAction}
                activeOpacity={0.7}
                testID="areas-modal-error-action"
              >
                <Text className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {actionText}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.closeButtonPrimary,
                onAction && actionText ? { flex: 1 } : { width: "100%" },
              ]}
              onPress={onClose}
              activeOpacity={0.9}
              testID="areas-modal-error-confirm"
            >
              <LinearGradient
                colors={["#007AFF", "#2563EB", "#1D4ED8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.closeButtonGradient}
              >
                <Ionicons name="checkmark-circle" size={18} color="white" />
                <Text className="text-base font-bold text-white">Đã hiểu</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Help Text */}
          <TouchableOpacity style={styles.helpButton} testID="areas-modal-error-help">
            <Text className="text-xs font-medium text-slate-400 dark:text-slate-500">
              Cần hỗ trợ? Liên hệ chúng tôi
            </Text>
          </TouchableOpacity>
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
    borderRadius: RADIUS.sheet,
    padding: 28,
    alignItems: "center",
    ...SHADOW.lg,
  },
  closeButton: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
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
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 12,
  },
  iconInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  messageBox: {
    width: "100%",
    borderRadius: RADIUS.button,
    padding: 16,
    marginBottom: 24,
  },
  messageContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: RADIUS.button,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonPrimary: {
    flex: 1,
  },
  closeButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: RADIUS.button,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  helpButton: {
    marginTop: 16,
    paddingVertical: 4,
  },
});

export default ErrorModal;
