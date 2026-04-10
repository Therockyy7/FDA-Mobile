// features/map/components/overlays/loading/MapLoadingOverlay.tsx
import LottieView from "lottie-react-native";
import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { OVERLAY_SHADOW } from "~/features/map/lib/map-ui-utils";
import { LoadingDot } from "./LoadingDot";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface MapLoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function MapLoadingOverlay({
  visible,
  message = "Đang tải bản đồ...",
}: MapLoadingOverlayProps) {
  const { isDarkColorScheme } = useColorScheme();
  const isDark = isDarkColorScheme;
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const textOpacity = useSharedValue(0.6);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.ease),
      });
      scale.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.back(1.5)),
      });
      textOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800 }),
          withTiming(0.6, { duration: 800 }),
        ),
        -1,
        true,
      );
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      scale.value = withTiming(0.8, { duration: 150 });
    }
  }, [visible, opacity, scale, textOpacity]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const colors = {
    background: isDark ? "rgba(15, 23, 42, 0.97)" : "rgba(255, 255, 255, 0.97)",
    cardBg: isDark ? "rgba(30, 41, 59, 0.9)" : "rgba(255, 255, 255, 0.9)",
    cardBorder: isDark ? "#334155" : "#E2E8F0",
    textPrimary: isDark ? "#E2E8F0" : "#1F2937",
    textSecondary: isDark ? "#94A3B8" : "#64748B",
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { backgroundColor: colors.background }, containerStyle]}>
      {/* Background pattern */}
      <View style={styles.backgroundPattern}>
        <LottieView
          source={require("../../../../../assets/animations/water-rise.json")}
          autoPlay
          loop
          speed={0.2}
          style={styles.backgroundLottie}
        />
      </View>

      {/* Main content card */}
      <Animated.View
        style={[
          styles.contentCard,
          { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
          contentStyle,
        ]}
      >
        <View style={styles.lottieContainer}>
          <LottieView
            source={require("../../../../../assets/animations/water-rise.json")}
            autoPlay
            loop
            speed={0.8}
            style={styles.lottie}
          />
        </View>

        {/* Loading dots */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((i) => (
            <LoadingDot key={i} delay={i * 150} />
          ))}
        </View>

        <Animated.Text style={[styles.message, { color: colors.textPrimary }, textStyle]}>
          {message}
        </Animated.Text>

        <Text style={[styles.hint, { color: colors.textSecondary }]}>Hệ thống cảnh báo ngập lụt</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  backgroundPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.08,
    overflow: "hidden",
  },
  backgroundLottie: {
    width: SCREEN_WIDTH * 2,
    height: SCREEN_HEIGHT,
    position: "absolute",
    left: -SCREEN_WIDTH / 2,
    top: 0,
  },
  contentCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 50,
    borderRadius: 28,
    borderWidth: 1,
    ...OVERLAY_SHADOW,
  },
  lottieContainer: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  lottie: {
    width: "100%",
    height: "100%",
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  message: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  hint: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
});
