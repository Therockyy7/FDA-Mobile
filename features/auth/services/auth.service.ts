// features/auth/lib/api.ts (Chỉ Auth APIs)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '~/lib/api-client';

interface LoginInput {
  phoneNumber: string,
  otpCode: string,
  email: string,
  password: string,
  deviceInfo: string
}

export const AuthService  = {
  login: (form : LoginInput) => 
    apiClient.post('/api/v1/auth/login', form),
 
  googleMobileLogin(body: { idToken: string }) {
    return apiClient.post("/api/v1/auth/google/mobile", body);
  },
  getProfile: () => apiClient.get('/auth/profile'),
  sendOTP: (phoneNumber: string) => apiClient.post('/api/v1/auth/send-otp', { phoneNumber }),
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
