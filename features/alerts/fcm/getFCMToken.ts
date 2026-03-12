// features/alerts/fcm/getFCMToken.ts
import {
    AuthorizationStatus,
    getMessaging,
    getToken,
    onTokenRefresh,
    requestPermission,
} from "@react-native-firebase/messaging";
import { PermissionsAndroid, Platform } from "react-native";

/**
 * Requests notification permission from the user.
 * On Android 13+ this asks at runtime; on older Android/iOS it uses the OS prompt.
 * @returns true if permission was granted, false otherwise
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
    // 1. Android 13+ requires explicit POST_NOTIFICATIONS runtime permission
    if (Platform.OS === "android" && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log("[FCM] Android 13+ Notification permission denied");
            return false;
        }
    }

    // 2. Dùng hàm của Firebase để xin quyền cho iOS (và đăng ký trên Android)
    const authStatus = await requestPermission(getMessaging());
    
    const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

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

        const token = await getToken(getMessaging());
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
    return onTokenRefresh(getMessaging(), (token) => {
        console.log("[FCM] Token refreshed:", token);
        callback(token);
    });
};
