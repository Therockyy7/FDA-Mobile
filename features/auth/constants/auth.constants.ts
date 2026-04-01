// features/auth/constants/auth.constants.ts
// Auth-related constants extracted from auth.slice.ts

export const ACCESS_TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";
export const USER_DATA_KEY = "user_data";
export const EXPIRES_AT_KEY = "expires_at";

export const DEVICE_INFO = "mobile-app";
export const TOKEN_TYPE = "Bearer";

export const SESSION_EXPIRY_BUFFER_MS = 5 * 60 * 1000; // 5 minutes in milliseconds
