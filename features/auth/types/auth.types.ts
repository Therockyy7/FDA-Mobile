// features/auth/types/auth.types.ts
// Core auth types extracted from auth.slice.ts

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  avatarUrl: string;
  roles: string[];
}

export interface Session {
  user: User | null;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
}

export interface AuthError {
  message: string;
}

export type AuthStatus = "checking" | "authenticated" | "unauthenticated";

export interface AuthState {
  user: User | null;
  session: Session | null;
  status: AuthStatus;
  loading: boolean;
  isNewUser: boolean;
  error: string | null;
  pendingVerificationEmail?: string | null;
  pendingResetEmail?: string | null;
  resetToken?: string | null;
}

export interface AuthSuccessPayload {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  isNewUser: boolean;
}

export const AUTH_SLICE_NAME = "auth" as const;
