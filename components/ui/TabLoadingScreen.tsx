// components/ui/TabLoadingScreen.tsx
// Fullscreen loading overlay with Lottie animation for tab transitions
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface TabLoadingScreenProps {
  visible: boolean;
  message?: string;
}

export function TabLoadingScreen({
  visible,
  message = "Đang tải...",
}: TabLoadingScreenProps) {
  const { isDarkColorScheme } = useColorScheme();

  // Animation values
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const textOpacity = useSharedValue(0.6);

  useEffect(() => {
    if (visible) {
      // Fade in
      opacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.ease),
      });
      scale.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.back(1.5)),
      });
      // Pulsing text
      textOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800 }),
          withTiming(0.6, { duration: 800 }),
        ),
        -1,
        true,
      );
    } else {
      // Fade out
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

  if (!visible) return null;

  // Theme colors
  const colors = {
    background: isDarkColorScheme
      ? "rgba(15, 23, 42, 0.97)"
      : "rgba(248, 250, 252, 0.97)",
    card: isDarkColorScheme
      ? "rgba(30, 41, 59, 0.9)"
      : "rgba(255, 255, 255, 0.9)",
    text: isDarkColorScheme ? "#E2E8F0" : "#334155",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    accent: "#3B82F6",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
  };

  return (
    <Animated.View
      style={[
        styles.overlay,
        containerStyle,
        { backgroundColor: colors.background },
      ]}
    >
      {/* Subtle background pattern */}
      <View style={styles.backgroundPattern}>
        <LottieView
          source={require("../../assets/animations/water-rise.json")}
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
          contentStyle,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        {/* Lottie animation */}
        <View style={styles.lottieContainer}>
          <LottieView
            source={require("../../assets/animations/water-rise.json")}
            autoPlay
            loop
            speed={0.8}
            style={styles.lottie}
          />
        </View>

        {/* Loading dots animation */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((i) => (
            <LoadingDot key={i} delay={i * 150} color={colors.accent} />
          ))}
        </View>

        {/* Message text */}
        <Animated.Text
          style={[styles.message, textStyle, { color: colors.text }]}
        >
          {message}
        </Animated.Text>

        <Text style={[styles.hint, { color: colors.subtext }]}>
          Vui lòng chờ trong giây lát
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

// Individual loading dot with staggered animation
function LoadingDot({ delay, color }: { delay: number; color: string }) {
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    const startAnimation = () => {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 400, easing: Easing.out(Easing.ease) }),
          withTiming(0.6, { duration: 400, easing: Easing.in(Easing.ease) }),
        ),
        -1,
        true,
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.4, { duration: 400 }),
        ),
        -1,
        true,
      );
    };

    const timer = setTimeout(startAnimation, delay);
    return () => clearTimeout(timer);
  }, [delay, scale, opacity]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.dot, dotStyle, { backgroundColor: color }]} />
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
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
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
