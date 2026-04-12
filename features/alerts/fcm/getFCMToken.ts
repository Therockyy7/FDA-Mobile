// features/alerts/fcm/getFCMToken.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    AuthorizationStatus,
    getMessaging,
    getToken,
    onTokenRefresh,
    requestPermission,
} from "@react-native-firebase/messaging";
import { PermissionsAndroid, Platform } from "react-native";
import { ProfileService } from "~/features/profile/services/profile.service";

/**
 * Requests notification permission from the user.
 * On Android 13+ this asks at runtime; on older Android/iOS it uses the OS prompt.
 * @returns true if permission was granted, false otherwise
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  // 1. Android 13+ requires explicit POST_NOTIFICATIONS runtime permission
  if (Platform.OS === "android" && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
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
      console.log(
        "[FCM] Notification permission denied — skipping token fetch",
      );
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
 * Lấy FCM token và gửi lên Backend qua PUT /api/v1/profile/fcm-token.
 * Gọi hàm này khi:
 *  - App mở và user đã đăng nhập (initializeAuth)
 *  - Sau khi đăng nhập Google (vì Google login không gửi fcmToken qua body login)
 * @returns FCM token string hoặc null
 */
export const registerFCMToken = async (): Promise<string | null> => {
  try {
    const token = await getFCMToken();
    if (token) {
      const refreshToken = await AsyncStorage.getItem("refresh_token");
      if (refreshToken) {
        await ProfileService.updateFcmToken(token);
        console.log("[FCM] Token registered to backend successfully");
      } else {
        console.log(
          "[FCM] Token fetched but user is not logged in, skipping backend registration",
        );
      }
    }
    return token;
  } catch (error: any) {
    console.error(
      "[FCM] Error registering token to backend:",
      error.message,
      error.response?.data || "No response data",
    );
    return null;
  }
};

/**
 * Listens for FCM token refresh and automatically sends the new token to backend.
 * Call this once during app initialization (khi user đã đăng nhập).
 * @returns unsubscribe function
 */
export const onFCMTokenRefresh = (callback?: (token: string) => void) => {
  return onTokenRefresh(getMessaging(), async (token) => {
    console.log("[FCM] Token refreshed:", token);

    // Tự động gửi token mới lên backend
    try {
      const refreshToken = await AsyncStorage.getItem("refresh_token");
      if (refreshToken) {
        await ProfileService.updateFcmToken(token);
        console.log("[FCM] Refreshed token sent to backend successfully");
      } else {
        console.log(
          "[FCM] Refreshed token fetched but user is not logged in, skipping backend registration",
        );
      }
    } catch (error) {
      console.error("[FCM] Error sending refreshed token to backend:", error);
    }

    // Gọi callback bổ sung nếu có
    callback?.(token);
  });
};
