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
import { useColorScheme } from "~/lib/useColorScheme";

interface ErrorModalProps {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  // Optional action button
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
  const { isDarkColorScheme } = useColorScheme();

  // Animations
  const iconScale = useSharedValue(0);
  const iconShake = useSharedValue(0);
  const pulseOpacity = useSharedValue(0.4);
  const contentScale = useSharedValue(0.8);
  const contentOpacity = useSharedValue(0);

  const colors = {
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#6B7280",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    overlay: "rgba(0, 0, 0, 0.65)",
    error: "#EF4444",
    errorLight: isDarkColorScheme
      ? "rgba(239, 68, 68, 0.15)"
      : "rgba(239, 68, 68, 0.08)",
    buttonBg: isDarkColorScheme ? "#334155" : "#F3F4F6",
  };

  useEffect(() => {
    if (visible) {
      contentScale.value = withSpring(1, { damping: 12, stiffness: 200 });
      contentOpacity.value = withSpring(1);

      // Icon entrance with bounce
      iconScale.value = withSequence(
        withDelay(100, withSpring(1.3, { damping: 6 })),
        withSpring(1, { damping: 8 }),
      );

      // Shake animation
      iconShake.value = withSequence(
        withDelay(200, withTiming(-8, { duration: 50 })),
        withTiming(8, { duration: 50 }),
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(-3, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );

      // Pulse effect
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, {
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0.3, {
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
          }),
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
  }, [
    visible,
    contentScale,
    contentOpacity,
    iconScale,
    iconShake,
    pulseOpacity,
  ]);

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
      <View style={styles.container}>
        {/* Overlay Background */}
        <TouchableOpacity
          style={[styles.overlay, { backgroundColor: colors.overlay }]}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContent,
            { backgroundColor: colors.cardBg },
            contentAnimatedStyle,
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.border }]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={18} color={colors.subtext} />
          </TouchableOpacity>

          {/* Error Icon with Animations */}
          <View style={styles.iconWrapper}>
            {/* Pulse Ring */}
            <Animated.View
              style={[
                styles.pulseRing,
                { borderColor: colors.error },
                pulseStyle,
              ]}
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
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

          {/* Error Message Box */}
          <View
            style={[styles.messageBox, { backgroundColor: colors.errorLight }]}
          >
            <View style={styles.messageContent}>
              <Ionicons
                name="information-circle"
                size={20}
                color={colors.error}
              />
              <Text style={[styles.messageText, { color: colors.subtext }]}>
                {message}
              </Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {onAction && actionText && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.buttonBg },
                ]}
                onPress={onAction}
                activeOpacity={0.7}
              >
                <Text style={[styles.actionText, { color: colors.text }]}>
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
            >
              <LinearGradient
                colors={["#3B82F6", "#2563EB", "#1D4ED8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.closeButtonGradient}
              >
                <Ionicons name="checkmark-circle" size={18} color="white" />
                <Text style={styles.closeButtonText}>Đã hiểu</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Help Text */}
          <TouchableOpacity style={styles.helpButton}>
            <Text style={[styles.helpText, { color: colors.subtext }]}>
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
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 25,
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
  title: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 16,
    textAlign: "center",
  },
  messageBox: {
    width: "100%",
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  messageContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "700",
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
    borderRadius: 14,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "white",
  },
  helpButton: {
    marginTop: 16,
    paddingVertical: 4,
  },
  helpText: {
    fontSize: 12,
    fontWeight: "500",
  },
});

export default ErrorModal;
