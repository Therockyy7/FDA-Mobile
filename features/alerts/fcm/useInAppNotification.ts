import { useCallback, useEffect, useRef, useState } from "react";
import {
  cancelAnimation,
  runOnJS,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { FCMNotificationData } from "./notificationHandler";

export type NotificationSeverity = "CRITICAL" | "WARNING" | "CAUTION" | "INFO";

export interface InAppNotificationPayload {
  title: string;
  body: string;
  severity: NotificationSeverity;
  data?: FCMNotificationData;
}

export const BANNER_DURATION_MS = 10000;
const ANIMATION_DURATION_MS = 320;
const HIDDEN_TRANSLATE_Y = -140;

const parseSeverity = (data: FCMNotificationData): NotificationSeverity => {
  const title = (data.title ?? "").toUpperCase();

  if (title.includes("CRITICAL") || title.includes("NGUY HIỂM")) {
    return "CRITICAL";
  }
  if (title.includes("WARNING") || title.includes("CẢNH BÁO")) {
    return "WARNING";
  }
  if (title.includes("CAUTION") || title.includes("CHÚ Ý")) {
    return "CAUTION";
  }

  return "INFO";
};

export const useInAppNotification = () => {
  const [notification, setNotification] =
    useState<InAppNotificationPayload | null>(null);
  const [visible, setVisible] = useState(false);

  // SharedValue — compatible với useAnimatedStyle trong banner
  const translateY = useSharedValue(HIDDEN_TRANSLATE_Y);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDismissTimer = useCallback(() => {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }
  }, []);

  const dismiss = useCallback(() => {
    clearDismissTimer();

    translateY.value = withTiming(
      HIDDEN_TRANSLATE_Y,
      { duration: ANIMATION_DURATION_MS },
      (finished) => {
        "worklet";
        if (finished) {
          runOnJS(setVisible)(false);
          runOnJS(setNotification)(null);
        }
      },
    );
  }, [clearDismissTimer, translateY]);

  const scheduleAutoDismiss = useCallback(() => {
    clearDismissTimer();
    dismissTimer.current = setTimeout(dismiss, BANNER_DURATION_MS);
  }, [clearDismissTimer, dismiss]);

  const runShowAnimation = useCallback(() => {
    clearDismissTimer();

    cancelAnimation(translateY);
    translateY.value = HIDDEN_TRANSLATE_Y;
    translateY.value = withTiming(0, { duration: 380 }, (finished) => {
      "worklet";
      if (finished) {
        runOnJS(scheduleAutoDismiss)();
      }
    });
  }, [clearDismissTimer, scheduleAutoDismiss, translateY]);

  const triggerNotification = useCallback(
    (data: FCMNotificationData) => {
      const payload: InAppNotificationPayload = {
        title: data.title ?? "Cảnh báo lũ",
        body: data.body ?? "Bạn có một cảnh báo mới.",
        severity: parseSeverity(data),
        data,
      };

      console.log("🔥 [DEBUG] triggerNotification payload:", payload);

      setNotification(payload);

      if (!visible) {
        setVisible(true);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            runShowAnimation();
          });
        });

        return;
      }

      requestAnimationFrame(() => {
        runShowAnimation();
      });
    },
    [runShowAnimation, visible],
  );

  useEffect(() => {
    return () => {
      clearDismissTimer();
    };
  }, [clearDismissTimer]);

  return {
    notification,
    visible,
    translateY,
    triggerNotification,
    dismiss,
  };
};
