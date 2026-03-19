import React, { useEffect } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "~/lib/useColorScheme";
import {
  InAppNotificationPayload,
  NotificationSeverity,
} from "./useInAppNotification";

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
    accent: string;
    chipBg: string;
    chipText: string;
    label: string;
  }
> = {
  CRITICAL: {
    accent: "#DC2626",
    chipBg: "#FEE2E2",
    chipText: "#B91C1C",
    label: "Nguy hiểm",
  },
  WARNING: {
    accent: "#EA580C",
    chipBg: "#FFEDD5",
    chipText: "#C2410C",
    label: "Cảnh báo",
  },
  CAUTION: {
    accent: "#CA8A04",
    chipBg: "#FEF9C3",
    chipText: "#A16207",
    label: "Chú ý",
  },
  INFO: {
    accent: "#2563EB",
    chipBg: "#DBEAFE",
    chipText: "#1D4ED8",
    label: "Thông báo",
  },
};

export const InAppNotificationBanner: React.FC<
  InAppNotificationBannerProps
> = ({ notification, visible, translateY, onPress, onDismiss }) => {
  const insets = useSafeAreaInsets();
  const { isDarkColorScheme } = useColorScheme();

  const translateX = useSharedValue(0);

  // Reset translateX mỗi khi banner hiện lại, tránh bị kẹt ngoài màn hình sau swipe dismiss
  useEffect(() => {
    if (visible) {
      translateX.value = 0;
    }
  }, [visible, translateX]);

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
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
  }));

  if (!visible || !notification) return null;

  const cfg = SEVERITY_CONFIG[notification.severity] ?? SEVERITY_CONFIG.INFO;

  const colors = {
    cardBg: isDarkColorScheme ? "#0F172A" : "#FFFFFF",
    border: isDarkColorScheme ? "#1E293B" : "#E2E8F0",
    title: isDarkColorScheme ? "#F8FAFC" : "#0F172A",
    body: isDarkColorScheme ? "#CBD5E1" : "#475569",
    meta: isDarkColorScheme ? "#94A3B8" : "#64748B",
    close: isDarkColorScheme ? "#CBD5E1" : "#475569",
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
            animatedStyle,
          ]}
        >
          <Pressable onPress={() => onPress?.(notification)}>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.cardBg,
                  borderColor: colors.border,
                  shadowColor: colors.shadow,
                },
              ]}
            >
              <View
                style={[styles.accentBar, { backgroundColor: cfg.accent }]}
              />

              <View style={styles.content}>
                <View style={styles.topRow}>
                  <View style={styles.leftTop}>
                    <View
                      style={[styles.chip, { backgroundColor: cfg.chipBg }]}
                    >
                      <View
                        style={[styles.dot, { backgroundColor: cfg.accent }]}
                      />
                      <Text style={[styles.chipText, { color: cfg.chipText }]}>
                        {cfg.label}
                      </Text>
                    </View>

                    <Text style={[styles.sourceText, { color: colors.meta }]}>
                      FDA Alert
                    </Text>
                  </View>

                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      onDismiss?.();
                    }}
                    hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
                    style={styles.closeButton}
                  >
                    <Text style={[styles.closeText, { color: colors.close }]}>
                      ✕
                    </Text>
                  </Pressable>
                </View>

                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[styles.title, { color: colors.title }]}
                >
                  {notification.title}
                </Text>

                <Text
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  style={[styles.body, { color: colors.body }]}
                >
                  {notification.body}
                </Text>
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
    minHeight: 84,
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    flexDirection: "row",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 14,
  },
  accentBar: {
    width: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  leftTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "700",
  },
  sourceText: {
    fontSize: 11,
    fontWeight: "600",
  },
  closeButton: {
    marginLeft: 12,
    paddingTop: 2,
    paddingHorizontal: 4,
  },
  closeText: {
    fontSize: 14,
    fontWeight: "700",
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 20,
    marginBottom: 3,
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
});
