// features/map/components/overlays/loading/LoadingDot.tsx
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet } from "react-native";
import { useEffect } from "react";

interface LoadingDotProps {
  delay: number;
}

export function LoadingDot({ delay }: LoadingDotProps) {
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

  return <Animated.View style={[styles.dot, dotStyle]} />;
}

const styles = StyleSheet.create({
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    // bg-primary token: #007AFF (FDA brand primary)
    backgroundColor: "#007AFF",
  },
});
