// features/alerts/fcm/InAppNotificationBanner.tsx
import React from "react";
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { InAppNotificationPayload, NotificationSeverity } from "./useInAppNotification";

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
export const InAppNotificationBanner: React.FC<InAppNotificationBannerProps> = ({
    notification,
    visible,
    translateY,
    onPress,
    onDismiss,
}) => {
    const insets = useSafeAreaInsets();

    if (!visible || !notification) return null;

    const cfg = SEVERITY_CONFIG[notification.severity];

    return (
        <Animated.View
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
                style={({ pressed }) => [
                    styles.card,
                    { opacity: pressed ? 0.88 : 1 },
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
                            onPress={(e) => { e.stopPropagation(); onDismiss?.(); }}
                            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                        >
                            <Text style={styles.closeIcon}>✕</Text>
                        </Pressable>
                    </View>

                    {/* Title */}
                    <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                        {notification.title}
                    </Text>

                    {/* Body */}
                    <Text style={styles.body} numberOfLines={2} ellipsizeMode="tail">
                        {notification.body}
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
        zIndex: 9999,
        elevation: 20,
        // Soft shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.28,
        shadowRadius: 14,
    },
    card: {
        flexDirection: "row",
        backgroundColor: "#1C2A3E",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#253347",
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
        fontSize: 13,
        fontWeight: "700",
        color: "#E2E8F0",
        marginBottom: 3,
        lineHeight: 18,
    },
    body: {
        fontSize: 12,
        color: "#64748B",
        lineHeight: 17,
    },
    closeIcon: {
        fontSize: 12,
        color: "#334155",
        fontWeight: "600",
    },
});

export default InAppNotificationBanner;
