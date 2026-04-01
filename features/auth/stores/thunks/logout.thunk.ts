// features/auth/stores/thunks/logout.thunk.ts
// Logout thunk

import { createAsyncThunk } from "@reduxjs/toolkit";
import { AuthService } from "../../services/auth.service";
import { clearAuthData } from "../../lib/auth-helpers";

/**
 * Sign out - clears session and storage.
 */
export const signOut = createAsyncThunk("auth/signOut", async () => {
  try {
    await AuthService.logout(false);
  } catch {
    // Ignore logout errors - always clear local state
  }
  await clearAuthData();
  return;
});
