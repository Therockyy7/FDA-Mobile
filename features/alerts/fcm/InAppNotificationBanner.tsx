import React, { useEffect } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
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

const SEVERITY_CONFIG: Record<
  NotificationSeverity,
  {
    bgLight: string;
    bgDark: string;
    borderLight: string;
    borderDark: string;
    icon: any;
    iconColor: string;
    label: string;
    badgeBg: string;
  }
> = {
  CRITICAL: {
    bgLight: "#fef2f2", // red-50
    bgDark: "rgba(69, 10, 10, 0.4)", // red-950/40
    borderLight: "#fecaca", // red-200
    borderDark: "#991b1b", // red-800
    icon: AlertOctagon,
    iconColor: "#ef4444", // red-500
    label: "CRITICAL",
    badgeBg: "#ef4444", // red-500
  },
  WARNING: {
    bgLight: "#fffbeb", // amber-50
    bgDark: "rgba(69, 26, 3, 0.4)", // amber-950/40
    borderLight: "#fde68a", // amber-200
    borderDark: "#92400e", // amber-800
    icon: AlertTriangle,
    iconColor: "#f59e0b", // amber-500
    label: "WARNING",
    badgeBg: "#f59e0b", // amber-500
  },
  CAUTION: {
    bgLight: "#fefce8", // yellow-50
    bgDark: "rgba(66, 32, 6, 0.4)", // yellow-950/40
    borderLight: "#fef08a", // yellow-200
    borderDark: "#854d0e", // yellow-800
    icon: AlertCircle,
    iconColor: "#eab308", // yellow-500
    label: "CAUTION",
    badgeBg: "#eab308", // yellow-500
  },
  INFO: {
    bgLight: "#eff6ff", // blue-50
    bgDark: "rgba(23, 37, 84, 0.4)", // blue-950/40
    borderLight: "#bfdbfe", // blue-200
    borderDark: "#1e40af", // blue-800
    icon: Info,
    iconColor: "#3b82f6", // blue-500
    label: "INFO",
    badgeBg: "#3b82f6", // blue-500
  },
};

export const InAppNotificationBanner: React.FC<
  InAppNotificationBannerProps
> = ({ notification, visible, translateY, onPress, onDismiss }) => {
  const insets = useSafeAreaInsets();
  const { isDarkColorScheme } = useColorScheme();

  const translateX = useSharedValue(0);
  const progressPercent = useSharedValue(100);

  // Reset translateX mỗi khi notification hiện lại, tránh bị kẹt ngoài màn hình sau swipe dismiss
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
    ] as any,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, progressPercent.value)}%`,
  }));

  if (!visible || !notification) return null;

  const cfg = SEVERITY_CONFIG[notification.severity] ?? SEVERITY_CONFIG.INFO;
  const SeverityIcon = cfg.icon;

  const colors = {
    bg: isDarkColorScheme ? cfg.bgDark : cfg.bgLight,
    border: isDarkColorScheme ? cfg.borderDark : cfg.borderLight,
    title: isDarkColorScheme ? "#FFFFFF" : "#0F172A",
    body: isDarkColorScheme ? "#CBD5E1" : "#475569",
    meta: isDarkColorScheme ? "#94A3B8" : "#64748B",
    progressBg: isDarkColorScheme ? "rgba(51, 65, 85, 0.6)" : "rgba(226, 232, 240, 0.6)",
    shadow: "#000000",
  };

  return (
    <View style={styles.host} pointerEvents="box-none">
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.bannerWrap,
            {
              top: insets.top + 10,
            },
            animatedStyle as any,
          ]}
        >
          <Pressable onPress={() => onPress?.(notification)}>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  shadowColor: colors.shadow,
                },
              ]}
            >
              <View style={styles.headerRow}>
                <View style={[styles.iconBox, { backgroundColor: cfg.badgeBg }]}>
                  <SeverityIcon size={14} color="#FFF" />
                </View>
                <Text style={[styles.headerLabel, { color: colors.meta }]}>
                  FDA {cfg.label}
                </Text>
                
                <View style={styles.headerRight}>
                  <Text style={[styles.headerTime, { color: colors.meta }]}>
                    Vừa xong
                  </Text>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      onDismiss?.();
                    }}
                    hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
                  >
                    <X size={14} color={colors.meta} />
                  </Pressable>
                </View>
              </View>

              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.title, { color: colors.title }]}
              >
                {notification.title}
              </Text>

              <Text
                numberOfLines={3}
                ellipsizeMode="tail"
                style={[styles.body, { color: colors.body }]}
              >
                {notification.body}
              </Text>

              <View style={[styles.progressTrack, { backgroundColor: colors.progressBg }]}>
                 <Animated.View style={[styles.progressBar, { backgroundColor: cfg.badgeBg }, progressStyle]} />
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
  headerLabel: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
    gap: 8,
  },
  headerTime: {
    fontSize: 11,
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
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
