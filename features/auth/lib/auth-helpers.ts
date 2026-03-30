// features/auth/lib/auth-helpers.ts
// Pure helper functions for auth feature

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_DATA_KEY,
  EXPIRES_AT_KEY,
} from "../constants";
import type { User } from "../types";

/**
 * Save auth data to AsyncStorage.
 */
export const saveAuthData = async (
  tokens: { accessToken: string; refreshToken: string; expiresAt: string },
  user: User,
) => {
  await AsyncStorage.multiSet([
    [ACCESS_TOKEN_KEY, tokens.accessToken],
    [REFRESH_TOKEN_KEY, tokens.refreshToken],
    [EXPIRES_AT_KEY, tokens.expiresAt],
    [USER_DATA_KEY, JSON.stringify(user)],
  ]);
};

/**
 * Clear all auth data from AsyncStorage.
 */
export const clearAuthData = async () => {
  await AsyncStorage.multiRemove([
    ACCESS_TOKEN_KEY,
    REFRESH_TOKEN_KEY,
    USER_DATA_KEY,
    EXPIRES_AT_KEY,
  ]);
};
