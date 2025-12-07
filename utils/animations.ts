import { Animated } from "react-native";

// Animation configuration interface
interface HeaderAnimationConfig {
  scrollThreshold: number;
  titleHeight: number;
}

// Default configuration for header animations
export const DEFAULT_HEADER_CONFIG: HeaderAnimationConfig = {
  scrollThreshold: 50,
  titleHeight: 80,
};

// Create scroll-based opacity interpolation
export const createScrollOpacity = (
  scrollY: Animated.Value,
  config: HeaderAnimationConfig = DEFAULT_HEADER_CONFIG
) => {
  return scrollY.interpolate({
    inputRange: [0, config.scrollThreshold],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
};

// Create scroll-based height interpolation
export const createScrollHeight = (
  scrollY: Animated.Value,
  config: HeaderAnimationConfig = DEFAULT_HEADER_CONFIG
) => {
  return scrollY.interpolate({
    inputRange: [0, config.scrollThreshold],
    outputRange: [config.titleHeight, 0],
    extrapolate: "clamp",
  });
};

// Create animated scroll event handler
export const createScrollHandler = (scrollY: Animated.Value) => {
  return Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: false,
  });
};
