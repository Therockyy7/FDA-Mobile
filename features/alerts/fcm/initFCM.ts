/**
 * features/alerts/fcm/initFCM.ts
 *
 * ⚠️  BACKGROUND HANDLER REGISTRATION (module-level, outside any component)
 *
 * `setBackgroundMessageHandler` MUST be called at module level — before React
 * renders — so Firebase can run it as a headless task when the app is in the
 * background or fully killed.
 *
 * This file is imported at the very top of `app/_layout.tsx` via:
 *   import "~/features/alerts/fcm/initFCM";
 */
import messaging, {
    FirebaseMessagingTypes,
} from "@react-native-firebase/messaging";
import {
    checkKilledStateNotification,
    FCMNotificationData,
    registerBackgroundTapHandler,
    registerForegroundHandler,
} from "./notificationHandler";

// ─── Background / killed-app data handler (module-level) ──────────────────────
messaging().setBackgroundMessageHandler(
    async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        console.log("[FCM][BACKGROUND_DATA] Message received:", remoteMessage);
        // Perform silent data processing here (e.g. update badge, AsyncStorage)
    }
);

// ─── initFCM ─────────────────────────────────────────────────────────────────

/**
 * Registers all FCM notification listeners.
 * Call this inside a `useEffect` in `app/_layout.tsx`.
 *
 * @param onNavigate — optional callback that receives parsed data so the caller
 *                     can trigger navigation (e.g. router.push)
 * @returns cleanup function — pass it as the useEffect return value
 *
 * @example
 * useEffect(() => {
 *   return initFCM();
 * }, []);
 *
 * // With navigation:
 * useEffect(() => {
 *   return initFCM((data) => navigateToNotification(data));
 * }, [navigateToNotification]);
 */
export const initFCM = (
    onNavigate?: (data: FCMNotificationData) => void,
    onShowBanner?: (data: FCMNotificationData) => void,
): (() => void) => {
    // 1. Foreground listener — shows in-app banner if onShowBanner provided
    const unsubscribeForeground = registerForegroundHandler(onShowBanner, onNavigate);

    // 2. Background-tap listener
    const unsubscribeBackground = registerBackgroundTapHandler(onNavigate);

    // 3. Killed-state — checked once, no listener to unsubscribe
    //    Defer 500 ms so the navigator has time to mount before we push a route
    setTimeout(() => checkKilledStateNotification(onNavigate), 500);

    // Return cleanup function for useEffect
    return () => {
        unsubscribeForeground();
        unsubscribeBackground();
    };
};
