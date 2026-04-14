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
import { SHADOW, MAP_COLORS } from "~/lib/design-tokens";
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

  // Dark mode exception: semi-transparent overlay bg cannot use NativeWind classes
  const overlayBg = isDarkColorScheme
    ? "rgba(15, 23, 42, 0.97)"
    : "rgba(255, 255, 255, 0.97)";
  const cardBg = isDarkColorScheme
    ? "rgba(30, 41, 59, 0.9)"
    : "rgba(255, 255, 255, 0.9)";
  const cardBorder = isDarkColorScheme
    ? MAP_COLORS.dark.border
    : MAP_COLORS.light.border;
  const textPrimary = isDarkColorScheme
    ? MAP_COLORS.dark.text
    : MAP_COLORS.light.text;
  const textSecondary = isDarkColorScheme
    ? MAP_COLORS.dark.subtext
    : MAP_COLORS.light.subtext;

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.overlay, { backgroundColor: overlayBg }, containerStyle]}
      testID="map-overlay-loading"
    >
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
          { backgroundColor: cardBg, borderColor: cardBorder },
          SHADOW.lg,
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

        <Animated.Text style={[styles.message, { color: textPrimary }, textStyle]}>
          {message}
        </Animated.Text>

        <Text style={[styles.hint, { color: textSecondary }]}>Hệ thống cảnh báo ngập lụt</Text>
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
