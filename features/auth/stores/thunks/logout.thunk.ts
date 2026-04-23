// features/auth/stores/thunks/logout.thunk.ts
// Logout thunk

import { createAsyncThunk } from "@reduxjs/toolkit";
import { ProfileService } from "~/features/profile/services/profile.service";
import { AuthService } from "../../services/auth.service";
import { clearAuthData } from "../../lib/auth-helpers";

/**
 * Sign out - clears session and storage.
 */
export const signOut = createAsyncThunk("auth/signOut", async () => {
  // Clear FCM token on backend BEFORE logout — accessToken is still valid here.
  // Doing this after logout would fail because the token gets revoked.
  try {
    await ProfileService.updateFcmToken("123");
  } catch {
    // Don't block logout if this fails (e.g. offline)
  }

  try {
    await AuthService.logout(false);
  } catch {
    // Ignore logout errors - always clear local state
  }
  await clearAuthData();
  return;
});
