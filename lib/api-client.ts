import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthService } from "~/features/auth/services/auth.service";

export const apiClient = axios.create({
  baseURL: "https://fda.id.vn",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Đính access_token vào mỗi request
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tự refresh khi 401
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Không phải 401 hoặc đã retry rồi → throw luôn
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      // Nếu đang refresh → đợi xong rồi retry
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const newAccessToken = await AuthService.refreshToken(); // 

      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (err) {
      processQueue(err, null);
      await AsyncStorage.multiRemove([
        "access_token",
        "refresh_token",
        "user_data",
        "expires_at",
      ]);
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);
