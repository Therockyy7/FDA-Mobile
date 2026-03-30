// features/auth/hooks/useAuthGuard.ts
// Protected route guard - redirects if not authenticated

import { useEffect } from "react";
import { router } from "expo-router";
import { useAuthStatus, useAuthLoading } from "./useAuth";

interface UseAuthGuardOptions {
  /**
   * Path to redirect to if not authenticated.
   * @default "/(auth)/sign-in"
   */
  redirectTo?: "/(auth)/sign-in" | string;

  /**
   * If true, also redirects authenticated users away (e.g., to home).
   * @default false
   */
  inverse?: boolean;
}

/**
 * Hook to protect routes that require authentication.
 * Redirects to sign-in if user is not authenticated.
 */
export const useAuthGuard = (options: UseAuthGuardOptions = {}) => {
  const { redirectTo = "/(auth)/sign-in", inverse = false } = options;

  const status = useAuthStatus();
  const loading = useAuthLoading();

  useEffect(() => {
    // Wait for auth to finish checking
    if (loading) return;

    if (inverse) {
      // Redirect authenticated users away (e.g., from login page)
      if (status === "authenticated") {
        router.replace(redirectTo as "/(auth)/sign-in");
      }
    } else {
      // Redirect unauthenticated users to login
      if (status === "unauthenticated") {
        router.replace(redirectTo as "/(auth)/sign-in");
      }
    }
  }, [status, loading, redirectTo, inverse]);

  return {
    isLoading: loading,
    isAuthenticated: status === "authenticated",
    isUnauthenticated: status === "unauthenticated",
  };
};
