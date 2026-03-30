// features/auth/stores/thunks/register.thunk.ts
// Register thunks: password variant login, change password

import { createAsyncThunk } from "@reduxjs/toolkit";
import { getFCMToken } from "~/features/alerts/fcm/getFCMToken";
import { ProfileService } from "~/features/profile/services/profile.service";
import { AuthService } from "../../services/auth.service";
import { saveAuthData } from "../../lib/auth-helpers";
import type {
  AuthSuccessPayload,
  ChangePasswordInput,
  User,
} from "../../types";

/**
 * Verify login with password + OTP (2FA variant).
 */
export const verifyLogin = createAsyncThunk<
  AuthSuccessPayload,
  { email: string; otpCode: string; password: string; deviceInfo: string },
  { rejectValue: { message: string } }
>("auth/verifyLogin", async (payload, { rejectWithValue }) => {
  try {
    const fcmToken = await getFCMToken();

    const res = await AuthService.loginUnified({
      identifier: payload.email,
      otpCode: payload.otpCode,
      password: payload.password,
      deviceInfo: payload.deviceInfo,
      fcmToken,
    });

    const { accessToken, refreshToken, expiresAt } = res.data;

    // Fetch latest profile
    const profileRes = await ProfileService.getProfile(accessToken);
    const profile = profileRes.data.profile as User;

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
 * Change password for authenticated user.
 */
export const changePassword = createAsyncThunk<
  void,
  ChangePasswordInput,
  { rejectValue: { message: string } }
>("auth/changePassword", async (form, { rejectWithValue }) => {
  try {
    await AuthService.changePassword(form);
    return;
  } catch (err: any) {
    return rejectWithValue({
      message: err?.response?.data?.message || "Đổi mật khẩu thất bại.",
    });
  }
});
