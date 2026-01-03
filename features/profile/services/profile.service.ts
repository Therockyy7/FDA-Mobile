// features/auth/services/auth.service.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "~/lib/api-client";



export const ProfileService = {
  getProfile: () => apiClient.get("/api/v1/user-profile"),
  
  updateProfile: (formData: FormData) => 
    apiClient.put("/api/v1/user-profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

};
