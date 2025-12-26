
import { useSelector, useDispatch } from "react-redux";

import {
  signIn,
  signUp,
  signOut,
  verifyOtp,
  resendConfirmation,
  AuthStatus,
} from "./auth.slice";
import { AppDispatch, RootState } from "~/app/store";

export const useUser = () =>
  useSelector((state: RootState) => state.auth.user);

export const useSession = () =>
  useSelector((state: RootState) => state.auth.session);

export const useAuthStatus = (): AuthStatus =>
  useSelector((state: RootState) => state.auth.status);

export const useAuthLoading = () =>
  useSelector((state: RootState) => state.auth.loading);

export const useSignIn = () => {
  const dispatch = useDispatch<AppDispatch>();
  return (email: string, password: string) =>
    dispatch(signIn({ email, password })).unwrap();
};

export const useSignUp = () => {
  const dispatch = useDispatch<AppDispatch>();
  return (email: string, password: string) =>
    dispatch(signUp({ email, password })).unwrap();
};

export const useSignOut = () => {
  const dispatch = useDispatch<AppDispatch>();
  return () => dispatch(signOut()).unwrap();
};

export const useVerifyOtp = () => {
  const dispatch = useDispatch<AppDispatch>();
  return (email: string, token: string) =>
    dispatch(verifyOtp({ email, token })).unwrap();
};

export const useResendConfirmation = () => {
  const dispatch = useDispatch<AppDispatch>();
  return (email: string) =>
    dispatch(resendConfirmation({ email })).unwrap();
};
