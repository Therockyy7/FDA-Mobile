// features/auth/services/auth.service.ts
import { apiClient } from "~/lib/api-client";



export const ProfileService = {
  getProfile: (accessToken?: string) => {
    const config = accessToken 
      ? { headers: { Authorization: `Bearer ${accessToken}` } } // Nếu có token truyền vào -> Dùng nó
      : {}; // Nếu không -> Để Interceptor tự lo

    return apiClient.get("/api/v1/user-profile", config);
  },
  
  updateProfile: (data: FormData) => {
    return apiClient.put("/api/v1/user-profile", data, {
        headers: {
            
            "Content-Type": "multipart/form-data",
        } as any, 
    });
  },

  sendPhoneOTP: (phoneNumber: string) => {
    return apiClient.post("/api/v1/auth/send-otp", { identifier: phoneNumber });
  },

  updatePhoneNumber: (data: { newPhoneNumber: string; otpCode: string }) => {
    return apiClient.post("/api/v1/user-profile/update-phoneNumber", data);
  },
};
