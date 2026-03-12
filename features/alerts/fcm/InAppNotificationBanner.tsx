// features/alerts/fcm/InAppNotificationBanner.tsx
import React from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "~/lib/useColorScheme";
import {
  InAppNotificationPayload,
  NotificationSeverity,
} from "./useInAppNotification";

interface InAppNotificationBannerProps {
  notification: InAppNotificationPayload | null;
  visible: boolean;
  translateY: Animated.Value;
  onPress?: (notification: InAppNotificationPayload) => void;
  onDismiss?: () => void;
}

// ── Severity config – understated palette ────────────────────────────────────
const SEVERITY_CONFIG: Record<
  NotificationSeverity,
  { dot: string; label: string; labelColor: string }
> = {
  CRITICAL: {
    dot: "#EF4444",
    label: "Nguy hiểm",
    labelColor: "#F87171",
  },
  WARNING: {
    dot: "#F97316",
    label: "Cảnh báo",
    labelColor: "#FB923C",
  },
  CAUTION: {
    dot: "#EAB308",
    label: "Chú ý",
    labelColor: "#FACC15",
  },
  INFO: {
    dot: "#3B82F6",
    label: "Thông báo",
    labelColor: "#60A5FA",
  },
};

// ── Component ────────────────────────────────────────────────────────────────
export const InAppNotificationBanner: React.FC<
  InAppNotificationBannerProps
> = ({ notification, visible, translateY, onPress, onDismiss }) => {
  const insets = useSafeAreaInsets();
  const { isDarkColorScheme } = useColorScheme();

  const cfg = notification
    ? SEVERITY_CONFIG[notification.severity]
    : SEVERITY_CONFIG.INFO;

  const themeColors = {
    cardBg: isDarkColorScheme ? "#1A1A1A" : "hsl(240 10% 3.9%)", // Dark grey cho dark mode
    borderColor: isDarkColorScheme ? "#333333" : "#E5E7EB",
    title: isDarkColorScheme ? "#FFFFFF" : "#1F2937", // Trắng cho dark, tối cho light
    body: isDarkColorScheme ? "#E5E7EB" : "#4B5563", // Xám sáng cho dark, xám tối cho light
    closeIcon: isDarkColorScheme ? "#9CA3AF" : "#6B7280",
  };

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      style={[
        styles.container,
        { top: insets.top + 10, transform: [{ translateY }] },
      ]}
    >
      <Pressable
        onPress={() => {
          onDismiss?.();
          if (notification) onPress?.(notification);
        }}
        style={[
          styles.card,
          {
            backgroundColor: themeColors.cardBg,
            borderColor: themeColors.borderColor,
          },
        ]}
      >
        {/* Left accent bar */}
        <View style={[styles.accentBar, { backgroundColor: cfg.dot }]} />

        {/* Content */}
        <View style={styles.content}>
          {/* Top row: label chip + close */}
          <View style={styles.topRow}>
            <View style={styles.labelRow}>
              <View style={[styles.dot, { backgroundColor: cfg.dot }]} />
              <Text style={[styles.labelText, { color: cfg.labelColor }]}>
                {cfg.label}
              </Text>
              <Text style={styles.source}>· FDA Alert</Text>
            </View>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onDismiss?.();
              }}
              hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
            >
              <Text
                style={[styles.closeIcon, { color: themeColors.closeIcon }]}
              >
                ✕
              </Text>
            </Pressable>
          </View>

          {/* Title */}
          <Text
            style={[styles.title, { color: themeColors.title }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {notification?.title ?? ""}
          </Text>

          {/* Body */}
          <Text
            style={[styles.body, { color: themeColors.body }]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {notification?.body ?? ""}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 99999,
    elevation: 10,
    // Soft shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  card: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  accentBar: {
    width: 3,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  labelText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  source: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "400",
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 3,
    lineHeight: 20,
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
  },
  closeIcon: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default InAppNotificationBanner;
