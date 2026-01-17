// features/auth/services/auth.service.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "~/lib/api-client";

interface LoginInput {
  identifier: string;
    otpCode?: string | null;
    password?: string | null;
    deviceInfo?: string | null;
}
// Ngay trên export const AuthService = { ... }
export type CheckIdentifierResponse = {
  success: boolean;
  message: string;
  identifierType: "phone" | "email";
  accountExists: boolean;
  hasPassword: boolean;
  requiredMethod: "otp" | "password";
};

export type CheckSetPassword = {
  email : string,
  newPassword : string,
  confirmPassword : string
}

export const AuthService = {
  // ✅ loginUnified: dùng identifier + map sang LoginInput
  loginUnified: (params: {
    identifier: string;
    otpCode?: string | null;
    password?: string | null;
    deviceInfo?: string | null;
  }) => {
    const { identifier, otpCode, password, deviceInfo } = params;
    console.log("AuthService: ", identifier, otpCode, password, deviceInfo);
    
    const form: LoginInput = {
      
      identifier: identifier,
      otpCode: otpCode ?? "",
      password: password ?? "",
      deviceInfo: deviceInfo ?? "mobile-app",
    };

    return apiClient.post("/api/v1/auth/login", form);
  },

   checkIdentifier: (identifier: string) => {
    return apiClient.post<CheckIdentifierResponse>(
      "/api/v1/auth/check-identifier",
      { identifier }
    );
  },
  login: (form: LoginInput) =>
    apiClient.post("/api/v1/auth/login", form),

  googleMobileLogin(body: { idToken: string }) {
    return apiClient.post("/api/v1/auth/google/mobile", body);
  },

  getProfile: () => apiClient.get("/auth/profile"),

  sendOTP: (identifier: string) =>
    apiClient.post("/api/v1/auth/send-otp", { identifier }),

  setPassWord: (form: CheckSetPassword) =>
    apiClient.post("/api/v1/auth/set-password", form),

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

  refreshToken: async () => {
    const refreshToken = await AsyncStorage.getItem("refresh_token");
    if (!refreshToken) throw new Error("No refresh token");

    const res = await apiClient.post("/api/v1/auth/refresh-token", {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = res.data;

    await AsyncStorage.setItem("access_token", accessToken);
    await AsyncStorage.setItem("refresh_token", newRefreshToken);

    return accessToken;
  },
};
