// features/auth/services/auth.service.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "~/lib/api-client";
import type {
  LoginInput,
  CheckIdentifierResponse,
  CheckSetPassword,
  ChangePasswordInput,
} from "../types";

export { CheckIdentifierResponse, CheckSetPassword, ChangePasswordInput };

export const AuthService = {
  /**
   * Unified login - handles email/phone with password or OTP.
   * Primary login method for the app.
   */
  loginUnified: (params: {
    identifier: string;
    otpCode?: string | null;
    password?: string | null;
    deviceInfo?: string | null;
    fcmToken?: string | null;
  }) => {
    const { identifier, otpCode, password, deviceInfo, fcmToken } = params;

    const form: LoginInput = {
      identifier,
      otpCode: otpCode ?? "",
      password: password ?? "",
      deviceInfo: deviceInfo ?? "mobile-app",
      fcmToken: fcmToken ?? null,
    };

    return apiClient.post("/api/v1/auth/login", form);
  },

  /**
   * Check if identifier (email/phone) exists and what auth method is required.
   */
  checkIdentifier: (identifier: string) => {
    return apiClient.post<CheckIdentifierResponse>(
      "/api/v1/auth/check-identifier",
      { identifier },
    );
  },

  /**
   * Google OAuth login for mobile.
   */
  googleMobileLogin(body: { idToken: string }) {
    return apiClient.post("/api/v1/auth/google/mobile", body);
  },

  /**
   * Get current user profile.
   */
  getProfile: () => apiClient.get("/api/v1/auth/profile"),

  /**
   * Send OTP code to email or phone.
   */
  sendOTP: (identifier: string) =>
    apiClient.post("/api/v1/auth/send-otp", { identifier }),

  /**
   * Set password for new account.
   */
  setPassWord: (form: CheckSetPassword) =>
    apiClient.post("/api/v1/auth/set-password", form),

  /**
   * Change password for authenticated user.
   */
  changePassword: (form: ChangePasswordInput) =>
    apiClient.post("/api/v1/auth/change-password", form),

  /**
   * Logout and clear tokens from storage.
   */
  logout: async (revokeAllTokens = false) => {
    const refreshToken = await AsyncStorage.getItem("refresh_token");
    try {
      if (refreshToken) {
        await apiClient.post("/api/v1/auth/logout", {
          refreshToken,
          revokeAllTokens,
        });
      }
    } finally {
      await AsyncStorage.multiRemove([
        "access_token",
        "refresh_token",
        "user_data",
      ]);
    }
  },

  /**
   * Refresh access token using refresh token.
   * Used by api-client.ts interceptor on 401 responses.
   */
  refreshToken: async (): Promise<string> => {
    const refreshToken = await AsyncStorage.getItem("refresh_token");
    if (!refreshToken) throw new Error("No refresh token");

    const res = await apiClient.post("/api/v1/auth/refresh-token", {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = res.data;

    await AsyncStorage.setItem("access_token", accessToken);
    if (newRefreshToken) {
      await AsyncStorage.setItem("refresh_token", newRefreshToken);
    }

    return accessToken;
  },
};
