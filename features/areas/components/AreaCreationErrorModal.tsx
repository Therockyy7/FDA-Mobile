// features/areas/components/AreaCreationErrorModal.tsx
// Beautiful error modal specifically for area creation/update errors
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import {
  Dimensions,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Text } from "~/components/ui/text";
import type { AreaError } from "~/features/areas/hooks/useControlArea";
import { useColorScheme } from "~/lib/useColorScheme";

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
  const { isDarkColorScheme } = useColorScheme();

  // Animations
  const iconScale = useSharedValue(0);
  const iconRotate = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.6);
  const glowOpacity = useSharedValue(0.3);

  const colors = {
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    cardBorder: isDarkColorScheme ? "#334155" : "#E2E8F0",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#6B7280",
    overlay: "rgba(0, 0, 0, 0.7)",
    // Error colors
    errorPrimary: "#EF4444",
    errorLight: isDarkColorScheme
      ? "rgba(239, 68, 68, 0.15)"
      : "rgba(239, 68, 68, 0.08)",
    errorBorder: isDarkColorScheme
      ? "rgba(239, 68, 68, 0.3)"
      : "rgba(239, 68, 68, 0.2)",
    // Duplicate specific colors
    duplicateWarning: "#F59E0B",
    duplicateLight: isDarkColorScheme
      ? "rgba(245, 158, 11, 0.15)"
      : "rgba(245, 158, 11, 0.08)",
    duplicateBorder: isDarkColorScheme
      ? "rgba(245, 158, 11, 0.3)"
      : "rgba(245, 158, 11, 0.2)",
    // Button
    buttonSecondary: isDarkColorScheme ? "#334155" : "#F3F4F6",
  };

  // Determine colors based on error type
  const isDuplicateError = error?.type === "duplicate";
  const accentColor = isDuplicateError
    ? colors.duplicateWarning
    : colors.errorPrimary;
  const lightBg = isDuplicateError ? colors.duplicateLight : colors.errorLight;
  const borderColor = isDuplicateError
    ? colors.duplicateBorder
    : colors.errorBorder;

  useEffect(() => {
    if (visible) {
      // Icon entrance with bounce
      iconScale.value = withSequence(
        withDelay(100, withSpring(1.2, { damping: 8 })),
        withSpring(1, { damping: 10 }),
      );

      // Subtle rotation shake for attention
      iconRotate.value = withSequence(
        withDelay(200, withTiming(-10, { duration: 60 })),
        withTiming(10, { duration: 60 }),
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-4, { duration: 40 }),
        withTiming(0, { duration: 40 }),
      );

      // Pulse animation
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.15, {
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );

      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.3, {
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0.6, {
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        true,
      );

      // Glow animation
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
    } else {
      iconScale.value = 0;
      iconRotate.value = 0;
      pulseScale.value = 1;
      pulseOpacity.value = 0.6;
      glowOpacity.value = 0.3;
    }
  }, [
    visible,
    iconScale,
    iconRotate,
    pulseScale,
    pulseOpacity,
    glowOpacity,
  ]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value },
      { rotate: `${iconRotate.value}deg` },
    ],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  if (!error) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Animated Overlay */}
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={StyleSheet.absoluteFill}
        >
          {Platform.OS === "ios" ? (
            <BlurView
              intensity={25}
              tint="dark"
              style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.4)" }]}
            />
          ) : (
            <View style={[styles.overlay, { backgroundColor: colors.overlay }]} />
          )}
        </Animated.View>

        {/* Touchable overlay to close */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Modal Content */}
        <Animated.View
          entering={SlideInDown.springify().damping(15).stiffness(150)}
          exiting={SlideOutDown.duration(200)}
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.cardBg,
              borderColor: borderColor,
            },
          ]}
        >
          {/* Background glow effect */}
          <Animated.View
            style={[
              styles.glowEffect,
              { backgroundColor: accentColor },
              glowAnimatedStyle,
            ]}
          />

          {/* Close Button */}
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.buttonSecondary }]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={18} color={colors.subtext} />
          </TouchableOpacity>

          {/* Icon Container with Animations */}
          <View style={styles.iconWrapper}>
            {/* Pulse Ring */}
            <Animated.View
              style={[
                styles.pulseRing,
                { borderColor: accentColor },
                pulseAnimatedStyle,
              ]}
            />

            {/* Main Icon */}
            <Animated.View style={iconAnimatedStyle}>
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
            </Animated.View>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            {error.title}
          </Text>

          {/* Subtitle for duplicate error */}
          {isDuplicateError && error.existingAreaName && (
            <View
              style={[
                styles.existingAreaBadge,
                { backgroundColor: lightBg, borderColor: borderColor },
              ]}
            >
              <Ionicons name="pin" size={14} color={accentColor} />
              <Text style={[styles.existingAreaText, { color: accentColor }]}>
                {error.existingAreaName}
              </Text>
            </View>
          )}

          {/* Message Box */}
          <View
            style={[
              styles.messageBox,
              { backgroundColor: lightBg, borderColor: borderColor },
            ]}
          >
            <View style={styles.messageHeader}>
              <Ionicons
                name={isDuplicateError ? "information-circle" : "warning"}
                size={22}
                color={accentColor}
              />
              <Text style={[styles.messageLabel, { color: accentColor }]}>
                {isDuplicateError ? "Vị trí trùng lặp" : "Chi tiết lỗi"}
              </Text>
            </View>
            <Text style={[styles.messageText, { color: colors.subtext }]}>
              {error.message}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {isDuplicateError && onChangeLocation && (
              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  { backgroundColor: colors.buttonSecondary },
                ]}
                onPress={() => {
                  onClose();
                  onChangeLocation();
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="navigate" size={18} color={colors.text} />
                <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
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
            >
              <LinearGradient
                colors={["#3B82F6", "#2563EB", "#1D4ED8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButtonGradient}
              >
                <Ionicons name="checkmark-circle" size={18} color="white" />
                <Text style={styles.primaryButtonText}>Đã hiểu</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Tips Section */}
          {isDuplicateError && (
            <View style={styles.tipsContainer}>
              <View style={styles.tipRow}>
                <View style={[styles.tipBullet, { backgroundColor: accentColor }]} />
                <Text style={[styles.tipText, { color: colors.subtext }]}>
                  Di chuyển đến vị trí khác cách xa hơn 50m
                </Text>
              </View>
              <View style={styles.tipRow}>
                <View style={[styles.tipBullet, { backgroundColor: accentColor }]} />
                <Text style={[styles.tipText, { color: colors.subtext }]}>
                  Hoặc chỉnh sửa vùng "{error.existingAreaName}" hiện có
                </Text>
              </View>
            </View>
          )}
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
    maxWidth: 380,
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 30,
    overflow: "hidden",
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
  title: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 12,
    textAlign: "center",
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
  existingAreaText: {
    fontSize: 14,
    fontWeight: "700",
  },
  messageBox: {
    width: "100%",
    borderRadius: 16,
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
  messageLabel: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  primaryButton: {
    flex: 1,
  },
  primaryButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "white",
  },
  tipsContainer: {
    width: "100%",
    marginTop: 16,
    gap: 8,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  tipText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
});

export default AreaCreationErrorModal;
