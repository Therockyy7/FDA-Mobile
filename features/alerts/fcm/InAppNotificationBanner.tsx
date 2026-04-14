import React, { useEffect } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import { Text } from "~/components/ui/text";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  cancelAnimation,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "~/lib/useColorScheme";
import {
  InAppNotificationPayload,
  NotificationSeverity,
  BANNER_DURATION_MS,
} from "./useInAppNotification";
import {
  AlertOctagon,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
} from "lucide-react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const DISMISS_THRESHOLD = SCREEN_WIDTH * 0.25;

interface InAppNotificationBannerProps {
  notification: InAppNotificationPayload | null;
  visible: boolean;
  translateY: SharedValue<number>;
  onPress?: (notification: InAppNotificationPayload) => void;
  onDismiss?: () => void;
}

// Flood severity color tokens — sourced from tailwind.config.js flood-* / standard Tailwind palette
// bgLight/bgDark must stay as JS values (StyleSheet.create + dynamic backgroundColor)
const SEVERITY_CONFIG: Record<
  NotificationSeverity,
  {
    bgLight: string;
    bgDark: string;
    borderLight: string;
    borderDark: string;
    icon: React.ElementType;
    iconColor: string;
    label: string;
    badgeBg: string; // matches flood-* tokens: danger=#EF4444, warning=#F59E0B, caution=#F59E0B, info=#0077BE
  }
> = {
  CRITICAL: {
    bgLight: "#fef2f2",           // red-50
    bgDark: "rgba(69,10,10,0.4)", // red-950/40
    borderLight: "#fecaca",       // red-200
    borderDark: "#991b1b",        // red-800
    icon: AlertOctagon,
    iconColor: "#EF4444",         // flood-danger
    label: "CRITICAL",
    badgeBg: "#EF4444",           // flood-danger
  },
  WARNING: {
    bgLight: "#fffbeb",              // amber-50
    bgDark: "rgba(69,26,3,0.4)",    // amber-950/40
    borderLight: "#fde68a",         // amber-200
    borderDark: "#92400e",          // amber-800
    icon: AlertTriangle,
    iconColor: "#F97316",           // flood-warning (orange)
    label: "WARNING",
    badgeBg: "#F97316",             // flood-warning
  },
  CAUTION: {
    bgLight: "#fefce8",              // yellow-50
    bgDark: "rgba(66,32,6,0.4)",    // yellow-950/40
    borderLight: "#fef08a",         // yellow-200
    borderDark: "#854d0e",          // yellow-800
    icon: AlertCircle,
    iconColor: "#F59E0B",           // flood-warning (amber)
    label: "CAUTION",
    badgeBg: "#F59E0B",             // flood-warning
  },
  INFO: {
    bgLight: "#eff6ff",              // blue-50
    bgDark: "rgba(23,37,84,0.4)",   // blue-950/40
    borderLight: "#bfdbfe",         // blue-200
    borderDark: "#1e40af",          // blue-800
    icon: Info,
    iconColor: "#0077BE",           // flood-info / brand primary
    label: "INFO",
    badgeBg: "#0077BE",             // flood-info
  },
};

export const InAppNotificationBanner: React.FC<
  InAppNotificationBannerProps
> = ({ notification, visible, translateY, onPress, onDismiss }) => {
  const insets = useSafeAreaInsets();
  const { isDarkColorScheme } = useColorScheme();

  const translateX = useSharedValue(0);
  const progressPercent = useSharedValue(100);

  useEffect(() => {
    if (visible && notification) {
      translateX.value = 0;
      progressPercent.value = 100;
      progressPercent.value = withTiming(0, { duration: BANNER_DURATION_MS });
    } else {
      cancelAnimation(progressPercent);
    }
  }, [visible, notification, translateX, progressPercent]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd(() => {
      if (Math.abs(translateX.value) > DISMISS_THRESHOLD) {
        const direction = translateX.value > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH;
        translateX.value = withTiming(direction, { duration: 180 }, () => {
          "worklet";
          if (onDismiss) runOnJS(onDismiss)();
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value as number },
      { translateX: translateX.value as number },
    ] as never,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, progressPercent.value)}%`,
  }));

  if (!visible || !notification) return null;

  const cfg = SEVERITY_CONFIG[notification.severity] ?? SEVERITY_CONFIG.INFO;
  const SeverityIcon = cfg.icon;

  // JS-only dark-mode exception: backgroundColor from SEVERITY_CONFIG must stay as inline style
  // Use strict equality to avoid falsy coercion issues if hook returns null
  const bgColor = isDarkColorScheme === true ? cfg.bgDark : cfg.bgLight;
  const borderColor = isDarkColorScheme === true ? cfg.borderDark : cfg.borderLight;
  const progressBg = isDarkColorScheme === true
    ? "rgba(51,65,85,0.6)"
    : "rgba(226,232,240,0.6)";

  return (
    <View style={styles.host} pointerEvents="box-none" testID="alerts-banner-host">
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[styles.bannerWrap, { top: insets.top + 10 }, animatedStyle as never]}
          testID="alerts-banner-wrap"
        >
          <Pressable onPress={() => onPress?.(notification)} testID="alerts-banner-pressable">
            <View
              style={[styles.card, { backgroundColor: bgColor, borderColor, shadowColor: "#000" }]}
              testID="alerts-banner-card"
            >
              <View style={styles.headerRow}>
                <View
                  style={[styles.iconBox, { backgroundColor: cfg.badgeBg }]}
                  testID="alerts-banner-icon-box"
                >
                  <SeverityIcon size={14} color="#FFF" />
                </View>
                <Text
                  className="text-xs font-extrabold uppercase ml-2"
                  style={{ color: isDarkColorScheme ? "#94A3B8" : "#64748B", letterSpacing: 0.5 }}
                  testID="alerts-banner-label"
                >
                  FDA {cfg.label}
                </Text>

                <View style={styles.headerRight}>
                  <Text
                    className="text-xs"
                    style={{ color: isDarkColorScheme ? "#94A3B8" : "#64748B" }}
                    testID="alerts-banner-time"
                  >
                    Vừa xong
                  </Text>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      onDismiss?.();
                    }}
                    hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
                    testID="alerts-banner-dismiss"
                  >
                    <X size={14} color={isDarkColorScheme ? "#94A3B8" : "#64748B"} />
                  </Pressable>
                </View>
              </View>

              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                className="text-base font-extrabold mb-1"
                style={{ color: isDarkColorScheme ? "#FFFFFF" : "#0F172A" }}
                testID="alerts-banner-title"
              >
                {notification.title}
              </Text>

              <Text
                numberOfLines={3}
                ellipsizeMode="tail"
                className="text-sm leading-snug"
                style={{ color: isDarkColorScheme ? "#CBD5E1" : "#475569" }}
                testID="alerts-banner-body"
              >
                {notification.body}
              </Text>

              <View
                style={[styles.progressTrack, { backgroundColor: progressBg }]}
                testID="alerts-banner-progress-track"
              >
                <Animated.View
                  style={[styles.progressBar, { backgroundColor: cfg.badgeBg }, progressStyle]}
                  testID="alerts-banner-progress-bar"
                />
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    elevation: 99999,
  },
  bannerWrap: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 99999,
    elevation: 99999,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
    gap: 8,
  },
  progressTrack: {
    marginTop: 12,
    height: 3,
    width: "100%",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 999,
    opacity: 0.6,
  },
});
