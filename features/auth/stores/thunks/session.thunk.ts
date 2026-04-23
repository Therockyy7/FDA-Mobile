// features/auth/stores/thunks/session.thunk.ts
// Session management thunks: restore, refresh

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { registerFCMToken, onFCMTokenRefresh } from "~/features/alerts/fcm/getFCMToken";
import { ProfileService } from "~/features/profile/services/profile.service";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_DATA_KEY,
  EXPIRES_AT_KEY,
} from "../../constants";
import type { User } from "../../types";

/**
 * Restore session from storage on app startup.
 */
export const initializeAuth = createAsyncThunk<
  { isAuthenticated: boolean; user: User | null; accessToken?: string; refreshToken?: string; expiresAt?: string },
  void,
  { rejectValue: { message: string } }
>("auth/initialize", async (_, { rejectWithValue }) => {
  const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  const storedUser = await AsyncStorage.getItem(USER_DATA_KEY);

  if (!accessToken || !refreshToken) {
    return { isAuthenticated: false, user: null };
  }

  // Quick: load from storage first for fast UI (available in catch fallback)
  let user: User | null = storedUser ? JSON.parse(storedUser) : null;

  try {
    // Then fetch latest from API
    const res = await ProfileService.getProfile();
    user = res.data.profile as User;

    // Update storage with latest data
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));

    // Register FCM token on app open (token may have changed)
    registerFCMToken().catch(() => {});

    // Listen for FCM token refresh → auto-register to backend
    onFCMTokenRefresh();

    return {
      isAuthenticated: true,
      user,
      accessToken,
      refreshToken,
      expiresAt: (await AsyncStorage.getItem(EXPIRES_AT_KEY)) || undefined,
    };
  } catch (err: any) {
    const status = err?.response?.status;
    const isAuthError = status === 401 || status === 403;

    if (isAuthError) {
      // Token thực sự invalid/expired → clear và logout
      await AsyncStorage.multiRemove([
        ACCESS_TOKEN_KEY,
        REFRESH_TOKEN_KEY,
        USER_DATA_KEY,
        EXPIRES_AT_KEY,
      ]);
      return { isAuthenticated: false, user: null };
    }

    // Lỗi mạng hoặc server error → dùng cached user, giữ token
    if (user) {
      return {
        isAuthenticated: true,
        user,
        accessToken,
        refreshToken,
        expiresAt: (await AsyncStorage.getItem(EXPIRES_AT_KEY)) || undefined,
      };
    }

    return { isAuthenticated: false, user: null };
  }
});
