// features/auth/stores/auth.slice.ts
// Redux slice - reducers only, thunks moved to stores/thunks/

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, AuthSuccessPayload, AuthError } from "../types";

// --- THUNK IMPORTS ---
import { initializeAuth } from "./thunks/session.thunk";
import { signIn, signInByGoogle } from "./thunks/login.thunk";
import { verifyOtpLogin, resendOtp } from "./thunks/otp.thunk";
import { verifyLogin } from "./thunks/register.thunk";
import { signOut } from "./thunks/logout.thunk";

// Re-export types for convenience
export type { User } from "../types";
export type { Session } from "../types";
export type { AuthError } from "../types";
export type { AuthStatus } from "../types";
export type { AuthState, AuthSuccessPayload } from "../types";

// Re-export thunks for backward compatibility
export { initializeAuth } from "./thunks/session.thunk";
export { signIn, signInByGoogle } from "./thunks/login.thunk";
export { verifyOtpLogin, resendOtp } from "./thunks/otp.thunk";
export { verifyLogin, changePassword } from "./thunks/register.thunk";
export { signOut } from "./thunks/logout.thunk";
export { registerFcmToken, subscribeToFcmRefresh } from "./thunks/fcm.thunk";

// --- INITIAL STATE ---
const initialState: AuthState = {
  user: null,
  session: null,
  status: "checking",
  loading: true,
  isNewUser: false,
  error: null,
};

// --- HELPER HANDLERS ---
function handleLoginSuccess(
  state: AuthState,
  action: PayloadAction<AuthSuccessPayload>,
) {
  state.status = "authenticated";
  state.user = action.payload.user;
  state.session = {
    user: action.payload.user,
    accessToken: action.payload.accessToken,
    refreshToken: action.payload.refreshToken,
    expiresAt: action.payload.expiresAt,
  };
  state.isNewUser = action.payload.isNewUser;
  state.error = null;
}

function handleLoginError(
  state: AuthState,
  action: PayloadAction<AuthError | undefined>,
) {
  state.error = action.payload?.message || "Lỗi xác thực không xác định";
  // Note: do NOT set status = 'unauthenticated' here
  // to prevent auto-redirect while user is filling the form
}

// --- SLICE ---
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<import("../types").User | null>) {
      state.user = action.payload;
      if (state.session) {
        state.session.user = action.payload;
      }
    },
    setSession(
      state,
      action: PayloadAction<import("../types").Session | null>,
    ) {
      state.session = action.payload;
      state.user = action.payload?.user ?? null;
      if (action.payload?.user) state.status = "authenticated";
    },
    setStatus(state, action: PayloadAction<import("../types").AuthStatus>) {
      state.status = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    finishOnboarding(state) {
      state.isNewUser = false;
    },
    setPendingVerificationEmail(state, action: PayloadAction<string | null>) {
      state.pendingVerificationEmail = action.payload;
    },
    setPendingResetEmail(state, action: PayloadAction<string | null>) {
      state.pendingResetEmail = action.payload;
    },
  },
  extraReducers: (builder) => {
    // --- SESSION THUNKS ---
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.status = "checking";
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.isAuthenticated) {
          state.status = "authenticated";
          state.user = action.payload.user;
          state.session = {
            user: action.payload.user,
            accessToken: action.payload.accessToken,
            refreshToken: action.payload.refreshToken,
            expiresAt: action.payload.expiresAt,
          };
        } else {
          state.status = "unauthenticated";
          state.user = null;
          state.session = null;
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false;
        state.status = "unauthenticated";
      });

    // --- LOGIN THUNKS ---
    builder
      .addCase(signIn.fulfilled, handleLoginSuccess)
      .addCase(signIn.rejected, handleLoginError)

      .addCase(signInByGoogle.fulfilled, handleLoginSuccess)
      .addCase(signInByGoogle.rejected, handleLoginError)

      .addCase(verifyLogin.fulfilled, handleLoginSuccess)
      .addCase(verifyLogin.rejected, handleLoginError)

      .addCase(verifyOtpLogin.fulfilled, handleLoginSuccess)
      .addCase(verifyOtpLogin.rejected, handleLoginError);

    // --- OTP THUNKS ---
    builder.addCase(resendOtp.rejected, handleLoginError);

    // --- LOGOUT ---
    builder.addCase(signOut.fulfilled, (state) => {
      state.user = null;
      state.session = null;
      state.status = "unauthenticated";
      state.isNewUser = false;
      state.error = null;
    });
  },
});

// --- EXPORTS ---
export const {
  setUser,
  setSession,
  setStatus,
  setError,
  clearError,
  finishOnboarding,
  setPendingVerificationEmail,
  setPendingResetEmail,
} = authSlice.actions;

export default authSlice.reducer;
