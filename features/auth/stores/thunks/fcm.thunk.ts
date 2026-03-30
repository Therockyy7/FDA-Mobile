// features/auth/stores/thunks/fcm.thunk.ts
// FCM token management thunks

import { createAsyncThunk } from "@reduxjs/toolkit";
import { registerFCMToken, onFCMTokenRefresh } from "~/features/alerts/fcm/getFCMToken";

/**
 * Register FCM token to backend.
 * Called after successful login.
 */
export const registerFcmToken = createAsyncThunk<
  void,
  void,
  { rejectValue: { message: string } }
>("auth/registerFcmToken", async (_, { rejectWithValue }) => {
  try {
    await registerFCMToken();
    return;
  } catch (err: any) {
    return rejectWithValue({
      message: err?.message || "Không thể đăng ký thông báo.",
    });
  }
});

/**
 * Subscribe to FCM token refresh events.
 * Called once on app startup.
 */
export const subscribeToFcmRefresh = createAsyncThunk(
  "auth/subscribeToFcmRefresh",
  async () => {
    onFCMTokenRefresh();
  },
);
