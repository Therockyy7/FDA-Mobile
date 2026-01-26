// features/areas/components/AreaCreationLoadingOverlay.tsx
// Beautiful loading overlay for area creation process
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

interface AreaCreationLoadingOverlayProps {
  visible: boolean;
  message?: string;
  subMessage?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function AreaCreationLoadingOverlay({
  visible,
  message = "Đang tải...",
  subMessage = "Vui lòng chờ trong giây lát",
}: AreaCreationLoadingOverlayProps) {
  const { isDarkColorScheme } = useColorScheme();

  // Animations
  const iconScale = useSharedValue(1);
  const iconRotate = useSharedValue(0);
  const pulseOpacity = useSharedValue(0.3);

  const colors = {
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#6B7280",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    overlay: isDarkColorScheme ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)",
  };

  useEffect(() => {
    if (visible) {
      // Pulse scale animation
      iconScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );

      // Subtle rotation
      iconRotate.value = withRepeat(
        withTiming(360, { duration: 3000, easing: Easing.linear }),
        -1,
        false,
      );

      // Pulse opacity
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
    } else {
      iconScale.value = 1;
      iconRotate.value = 0;
      pulseOpacity.value = 0.3;
    }
  }, [visible, iconScale, iconRotate, pulseOpacity]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const ringAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${iconRotate.value}deg` }],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={styles.container}
    >
      {/* Blur/Overlay Background */}
      {Platform.OS === "ios" ? (
        <BlurView
          intensity={30}
          tint="dark"
          style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.3)" }]}
        />
      ) : (
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]} />
      )}

      {/* Loading Card */}
      <Animated.View
        entering={FadeIn.delay(100).duration(300)}
        style={[styles.loadingCard, { backgroundColor: colors.cardBg }]}
      >
        {/* Animated Icon Container */}
        <View style={styles.iconWrapper}>
          {/* Rotating Ring */}
          <Animated.View style={[styles.rotatingRing, ringAnimatedStyle]}>
            <LinearGradient
              colors={["#10B981", "#3B82F6", "#8B5CF6", "#10B981"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientRing}
            />
          </Animated.View>

          {/* Pulse Effect */}
          <Animated.View
            style={[
              styles.pulseCircle,
              { backgroundColor: "#10B981" },
              pulseAnimatedStyle,
            ]}
          />

          {/* Icon */}
          <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
            <LinearGradient
              colors={["#10B981", "#059669"]}
              style={styles.iconGradient}
            >
              <Ionicons name="location" size={32} color="white" />
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Loading Indicator */}
        <ActivityIndicator
          size="small"
          color="#10B981"
          style={styles.spinner}
        />

        {/* Text */}
        <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
        <Text style={[styles.subMessage, { color: colors.subtext }]}>
          {subMessage}
        </Text>

        {/* Progress Dots */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={index}
              entering={FadeIn.delay(100 * index).duration(300)}
              style={[
                styles.dot,
                {
                  backgroundColor: colors.border,
                },
              ]}
            />
          ))}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingCard: {
    width: SCREEN_WIDTH - 80,
    maxWidth: 300,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 25,
  },
  iconWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    width: 100,
    height: 100,
  },
  rotatingRing: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
  },
  gradientRing: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
    padding: 3,
  },
  pulseCircle: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  iconContainer: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: "hidden",
  },
  iconGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    marginBottom: 12,
  },
  message: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  subMessage: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 6,
    marginTop: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export default AreaCreationLoadingOverlay;
