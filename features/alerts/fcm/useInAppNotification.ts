// features/alerts/fcm/useInAppNotification.ts
import { useCallback, useRef, useState } from "react";
import { Animated } from "react-native";
import { FCMNotificationData } from "./notificationHandler";

export type NotificationSeverity = "CRITICAL" | "WARNING" | "CAUTION" | "INFO";

export interface InAppNotificationPayload {
    title: string;
    body: string;
    severity: NotificationSeverity;
    data?: FCMNotificationData;
}

const BANNER_DURATION_MS = 5000;
const ANIMATION_DURATION_MS = 320;

/**
 * Parses severity from FCM notification title or data.
 * Backend puts severity in title like "🚨 CRITICAL: ..." or "⚠️ WARNING: ..."
 */
const parseSeverity = (data: FCMNotificationData): NotificationSeverity => {
    const title = (data.title ?? "").toUpperCase();
    if (title.includes("CRITICAL") || title.includes("NGUY HIỂM")) return "CRITICAL";
    if (title.includes("WARNING") || title.includes("CẢNH BÁO")) return "WARNING";
    if (title.includes("CAUTION") || title.includes("CHÚ Ý")) return "CAUTION";
    return "INFO";
};

export const useInAppNotification = () => {
    const [notification, setNotification] =
        useState<InAppNotificationPayload | null>(null);
    const [visible, setVisible] = useState(false);

    const translateY = useRef(new Animated.Value(-120)).current;
    const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const dismiss = useCallback(() => {
        if (dismissTimer.current) clearTimeout(dismissTimer.current);
        Animated.timing(translateY, {
            toValue: -120,
            duration: ANIMATION_DURATION_MS,
            useNativeDriver: true,
        }).start(() => {
            setVisible(false);
            setNotification(null);
        });
    }, [translateY]);

    const triggerNotification = useCallback(
        (data: FCMNotificationData) => {
            // Clear any existing banner
            if (dismissTimer.current) clearTimeout(dismissTimer.current);

            const payload: InAppNotificationPayload = {
                title: data.title ?? "Cảnh báo lũ",
                body: data.body ?? "Bạn có một cảnh báo mới.",
                severity: parseSeverity(data),
                data,
            };

            setNotification(payload);
            setVisible(true);

            // Reset and animate slide-in
            translateY.setValue(-120);

            Animated.timing(translateY, {
                toValue: 0,
                duration: ANIMATION_DURATION_MS,
                useNativeDriver: true,
            }).start();

            // Auto dismiss
            dismissTimer.current = setTimeout(() => {
                dismiss();
            }, BANNER_DURATION_MS);
        },
        [translateY, dismiss],
    );

    return {
        notification,
        visible,
        translateY,
        triggerNotification,
        dismiss,
    };
};
