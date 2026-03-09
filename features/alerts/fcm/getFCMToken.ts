// features/alerts/fcm/getFCMToken.ts
import messaging from "@react-native-firebase/messaging";
import { Platform } from "react-native";

/**
 * Requests notification permission from the user.
 * On Android 13+ this asks at runtime; on older Android/iOS it uses the OS prompt.
 * @returns true if permission was granted, false otherwise
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
    // Android < 13 permissions are granted by default
    if (Platform.OS === "android") {
        return true;
    }

    // iOS — must explicitly request
    const authStatus = await messaging().requestPermission();
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    console.log("[FCM] Permission status:", authStatus, "| Enabled:", enabled);
    return enabled;
};

/**
 * Retrieves the current FCM device token.
 * Includes the permission request so the caller only needs to call this function.
 * @returns FCM token string or null if unavailable
 */
export const getFCMToken = async (): Promise<string | null> => {
    try {
        const hasPermission = await requestNotificationPermission();
        if (!hasPermission) {
            console.log("[FCM] Notification permission denied — skipping token fetch");
            return null;
        }

        const token = await messaging().getToken();
        console.log("[FCM] Token:", token);
        return token;
    } catch (error) {
        console.error("[FCM] Error getting token:", error);
        return null;
    }
};

/**
 * Listens for FCM token refresh and calls the provided callback.
 * Call this once during app initialization.
 * @returns unsubscribe function
 */
export const onFCMTokenRefresh = (callback: (token: string) => void) => {
    return messaging().onTokenRefresh((token) => {
        console.log("[FCM] Token refreshed:", token);
        callback(token);
    });
};
