// features/alerts/fcm/notificationHandler.ts
import {
    FirebaseMessagingTypes,
    getInitialNotification,
    getMessaging,
    onMessage,
    onNotificationOpenedApp
} from "@react-native-firebase/messaging";

/**
 * Expected shape of the FCM data payload from the backend.
 * Backend should send these fields in the `data` block of the FCM message.
 */
export interface FCMNotificationData {
    // Notification Display (từ Firebase notification object)
    title?: string;         // "🚨 CRITICAL: Flood Alert - CRITICAL"
    body?: string;          // Full formatted message từ backend

    // Identifiers (từ data)
    notificationId?: string; // UUID của notification log
    alertId?: string;        // UUID của alert trigger

    // Timestamps (từ data)
    timestamp?: string;      // ISO 8601
}

/**
 * Extracts and normalises the typed data payload from a RemoteMessage.
 */
const parseMessageData = (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): FCMNotificationData => {
    const raw = remoteMessage.data ?? {};
    const notification = remoteMessage.notification ?? {};

    return {
        // From notification object
        title: notification.title ? String(notification.title) : undefined,
        body: notification.body ? String(notification.body) : undefined,

        // From data object
        notificationId: raw.notificationId ? String(raw.notificationId) : undefined,
        alertId: raw.alertId ? String(raw.alertId) : undefined,
        timestamp: raw.timestamp ? String(raw.timestamp) : undefined,
    };
};

/**
 * Handles a notification in any app state.
 * Pass a navigation callback here when you're ready to deep-link.
 *
 * @param remoteMessage — the FCM message
 * @param onNavigate    — optional callback receives parsed data for navigation
 */
const handleMessage = (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
    label: string,
    onNavigate?: (data: FCMNotificationData) => void,
) => {
    const data = parseMessageData(remoteMessage);

    // ── FCM log ──────────────────────────────────────────────────────────────
    console.log(`\n${"━".repeat(60)}`);
    console.log(`[FCM] ▶ ${label}`);
    console.log(`${"─".repeat(60)}`);

    // Meta
    console.log("[FCM] messageId :", remoteMessage.messageId ?? "(none)");
    console.log("[FCM] sentTime  :", remoteMessage.sentTime
        ? new Date(remoteMessage.sentTime).toISOString()
        : "(none)");
    console.log("[FCM] from      :", remoteMessage.from ?? "(none)");

    // Notification block
    console.log("[FCM] notification:", JSON.stringify(remoteMessage.notification ?? {}, null, 2));

    // Data block
    console.log("[FCM] data      :", JSON.stringify(remoteMessage.data ?? {}, null, 2));

    // Parsed convenient fields
    console.log("[FCM] parsed    :", JSON.stringify(data, null, 2));

    // Full raw dump (useful when unexpected fields appear)
    console.log("[FCM] raw (full):", JSON.stringify(remoteMessage, null, 2));

    console.log(`${"━".repeat(60)}\n`);
    // ─────────────────────────────────────────────────────────────────────────

    // 👉 Invoke navigation callback when provided (e.g. router.push)
    onNavigate?.(data);
};

// ─── Exported handlers ────────────────────────────────────────────────────────

/**
 * 1. FOREGROUND — app is open and active.
 *    Returns an unsubscribe function; call it on cleanup.
 *
 * @param onShowBanner — called with parsed data to show an in-app banner.
 *                       When provided, banner is shown instead of navigating.
 * @param onNavigate   — navigation callback (used when user taps the banner).
 */
export const registerForegroundHandler = (
    onShowBanner?: (data: FCMNotificationData) => void,
    onNavigate?: (data: FCMNotificationData) => void,
) => {
    return onMessage(getMessaging(), async (remoteMessage) => {
        // Always log the message
        handleMessage(remoteMessage, "FOREGROUND", undefined);
        // Show in-app banner if callback provided; otherwise navigate directly
        const data = {
            title: remoteMessage.notification?.title
                ? String(remoteMessage.notification.title)
                : undefined,
            body: remoteMessage.notification?.body
                ? String(remoteMessage.notification.body)
                : undefined,
            notificationId: remoteMessage.data?.notificationId
                ? String(remoteMessage.data.notificationId)
                : undefined,
            alertId: remoteMessage.data?.alertId
                ? String(remoteMessage.data.alertId)
                : undefined,
            timestamp: remoteMessage.data?.timestamp
                ? String(remoteMessage.data.timestamp)
                : undefined,
        };
        if (onShowBanner) {
            onShowBanner(data);
        } else {
            onNavigate?.(data);
        }
    },
    );
};

/**
 * 2. BACKGROUND → user taps notification to bring app to foreground.
 *    Returns an unsubscribe function; call it on cleanup.
 */
export const registerBackgroundTapHandler = (
    onNavigate?: (data: FCMNotificationData) => void,
) => {
    return onNotificationOpenedApp(getMessaging(), (remoteMessage) => {
        handleMessage(remoteMessage, "BACKGROUND_TAP", onNavigate);
    },
    );
};

/**
 * 3. KILLED STATE — app was closed; user tapped notification to launch it.
 *    Must be called once on app start (not inside a listener — no unsubscribe needed).
 */
export const checkKilledStateNotification = async (
    onNavigate?: (data: FCMNotificationData) => void,
): Promise<void> => {
    const remoteMessage = await getInitialNotification(getMessaging());
    if (remoteMessage) {
        handleMessage(remoteMessage, "KILLED_STATE", onNavigate);
    }
};
