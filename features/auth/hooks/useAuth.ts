// features/auth/hooks/useAuth.ts
// Core auth selectors and actions wrapper

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import {
  signIn,
  signInByGoogle,
  signOut,
  initializeAuth,
  finishOnboarding,
  User,
} from "../stores/auth.slice";
import type { AuthStatus } from "../types";

// --- SELECTORS ---
export const useUser = () => useAppSelector((state) => state.auth.user);

export const useSession = () => useAppSelector((state) => state.auth.session);

export const useAuthStatus = (): AuthStatus =>
  useAppSelector((state) => state.auth.status);

export const useAuthLoading = () =>
  useAppSelector((state) => state.auth.loading);

export const useAuthError = () =>
  useAppSelector((state) => state.auth.error);

export const useIsNewUser = () =>
  useAppSelector((state) => state.auth.isNewUser);

export const useIsAuthenticated = () =>
  useAppSelector((state) => state.auth.status === "authenticated");

// --- ACTIONS ---
export const useInitializeAuth = () => {
  const dispatch = useAppDispatch();
  return useCallback(() => dispatch(initializeAuth()), [dispatch]);
};

export const useSignIn = () => {
  const dispatch = useAppDispatch();
  return useCallback(
    (email: string, password: string) =>
      dispatch(signIn({ email, password })).unwrap(),
    [dispatch],
  );
};

export const useSignInByGoogle = () => {
  const dispatch = useAppDispatch();
  return useCallback(
    (params: {
      accessToken: string;
      refreshToken: string;
      expiresAt: string;
      user: User;
      isNewUser?: boolean;
    }) => dispatch(signInByGoogle(params)).unwrap(),
    [dispatch],
  );
};

export const useSignOut = () => {
  const dispatch = useAppDispatch();
  return useCallback(() => dispatch(signOut()).unwrap(), [dispatch]);
};

export const useFinishOnboarding = () => {
  const dispatch = useAppDispatch();
  return useCallback(() => dispatch(finishOnboarding()), [dispatch]);
};
