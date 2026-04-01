// features/auth/stores/thunks/login.thunk.ts
// Login thunks: credentials, Google OAuth

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getFCMToken, registerFCMToken } from "~/features/alerts/fcm/getFCMToken";
import { ProfileService } from "~/features/profile/services/profile.service";
import { AuthService } from "../../services/auth.service";
import { saveAuthData } from "../../lib/auth-helpers";
import { USER_DATA_KEY } from "../../constants";
import type { AuthSuccessPayload, User } from "../../types";

/**
 * Sign in with email + password.
 */
export const signIn = createAsyncThunk<
  AuthSuccessPayload,
  { email: string; password: string },
  { rejectValue: { message: string } }
>("auth/signIn", async ({ email, password }, { rejectWithValue }) => {
  try {
    const fcmToken = await getFCMToken();

    const res = await AuthService.loginUnified({
      identifier: email,
      otpCode: null,
      password,
      deviceInfo: "mobile-app",
      fcmToken,
    });

    const { accessToken, refreshToken, expiresAt } = res.data;

    // Fetch latest profile
    const profileRes = await ProfileService.getProfile(accessToken);
    const profile = profileRes.data.profile as User;

    // Persist to storage
    await saveAuthData({ accessToken, refreshToken, expiresAt }, profile);

    return {
      user: profile,
      accessToken,
      refreshToken,
      expiresAt,
      isNewUser: false,
    };
  } catch (err: any) {
    return rejectWithValue({
      message: err?.response?.data?.message || "Đăng nhập thất bại.",
    });
  }
});

/**
 * Sign in with Google OAuth.
 */
export const signInByGoogle = createAsyncThunk<
  AuthSuccessPayload,
  {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    user: User;
    isNewUser?: boolean;
  },
  { rejectValue: { message: string } }
>("auth/signInByGoogle", async (payload, { rejectWithValue }) => {
  try {
    const { accessToken, refreshToken, expiresAt, isNewUser } = payload;

    // Register FCM token
    await registerFCMToken();

    // Save initial data
    await saveAuthData({ accessToken, refreshToken, expiresAt }, payload.user);

    // Fetch full profile from backend
    const profileRes = await ProfileService.getProfile(accessToken);
    const fullProfile = profileRes.data.profile as User;

    // Update storage with full profile
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(fullProfile));

    return {
      user: fullProfile,
      accessToken,
      refreshToken,
      expiresAt,
      isNewUser: isNewUser || false,
    };
  } catch (err: any) {
    console.error("Redux Google Login Error:", err);
    return rejectWithValue({
      message: "Không thể lấy thông tin người dùng.",
    });
  }
});
