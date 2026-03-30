// features/auth/stores/thunks/otp.thunk.ts
// OTP thunks: verify OTP login, resend OTP

import { createAsyncThunk } from "@reduxjs/toolkit";
import { getFCMToken } from "~/features/alerts/fcm/getFCMToken";
import { ProfileService } from "~/features/profile/services/profile.service";
import { AuthService } from "../../services/auth.service";
import { saveAuthData } from "../../lib/auth-helpers";
import type { AuthSuccessPayload, User } from "../../types";

/**
 * Verify OTP login (phone or email).
 */
export const verifyOtpLogin = createAsyncThunk<
  AuthSuccessPayload,
  { identifier: string; otpCode: string; type: "email" | "phone" },
  { rejectValue: { message: string } }
>("auth/verifyOtpLogin", async ({ identifier, otpCode }, { rejectWithValue }) => {
  try {
    const fcmToken = await getFCMToken();

    const res = await AuthService.loginUnified({
      identifier,
      otpCode,
      password: null,
      deviceInfo: "mobile-app",
      fcmToken,
    });

    // Check for business logic errors from backend
    if (res.data?.success === false || !res.data.accessToken) {
      return rejectWithValue({
        message: res.data.message || "OTP không hợp lệ",
      });
    }

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
      isNewUser: res.data.isNewUser || false,
    };
  } catch (err: any) {
    return rejectWithValue({
      message: err?.response?.data?.message || "Xác thực OTP thất bại.",
    });
  }
});

/**
 * Resend OTP code.
 */
export const resendOtp = createAsyncThunk<
  void,
  { identifier: string },
  { rejectValue: { message: string } }
>("auth/resendOtp", async ({ identifier }, { rejectWithValue }) => {
  try {
    await AuthService.sendOTP(identifier);
    return;
  } catch (err: any) {
    return rejectWithValue({
      message: err?.response?.data?.message || "Gửi lại mã thất bại. Vui lòng thử lại.",
    });
  }
});
