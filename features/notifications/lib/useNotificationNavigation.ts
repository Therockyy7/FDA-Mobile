// features/notifications/lib/useNotificationNavigation.ts
/**
 * Hook điều hướng màn hình dựa vào FCMNotificationData.
 *
 * Backend payload (data object):
 *   notificationId : UUID của notification log → dùng để deep-link
 *   alertId        : UUID của alert trigger (fallback)
 *   timestamp      : ISO 8601
 *
 * Usage:
 *   const navigateToNotification = useNotificationNavigation();
 *   navigateToNotification(data); // data: FCMNotificationData
 */
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { FCMNotificationData } from "~/features/alerts/fcm/notificationHandler";

export const useNotificationNavigation = () => {
    const router = useRouter();

    const navigateToNotification = useCallback(
        (data: FCMNotificationData) => {
            const { notificationId, alertId } = data;

            console.log("[FCM Nav]", { notificationId, alertId });

            if (notificationId) {
                // Deep-link đến màn hình chi tiết bằng notificationId
                router.push({
                    pathname: "/(tabs)/notifications/[id]" as any,
                    params: { id: notificationId },
                });
            } else if (alertId) {
                // Fallback: dùng alertId nếu không có notificationId
                router.push({
                    pathname: "/(tabs)/notifications/[id]" as any,
                    params: { id: alertId },
                });
            } else {
                // Không có ID → mở danh sách notifications
                router.push("/(tabs)/notifications" as any);
            }
        },
        [router],
    );

    return navigateToNotification;
};
