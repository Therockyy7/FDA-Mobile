
import { useSelector, useDispatch } from "react-redux";

import {
  signIn,
  signUp,
  signOut,
  verifyPhoneLogin,
  resendConfirmation,
  AuthStatus,
  User,
  signInByGoogle,
} from "./auth.slice";
import { AppDispatch, RootState } from "~/app/store";
import { useEffect } from "react";
import * as Linking from "expo-linking";

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

export const useVerifyPhoneLogin = () => {
  const dispatch = useDispatch<AppDispatch>();
  return (phoneNumber: string, otpCode: string) =>
    dispatch(verifyPhoneLogin({ phoneNumber, otpCode })).unwrap();
}

export const useSignInByGoogle = () => {
  const dispatch = useDispatch<AppDispatch>();
  return (params: {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    user: User;
  }) => dispatch(signInByGoogle(params)).unwrap();
};

// export const useGoogleAuthListener = () => {
//   const signInByGoogle = useSignInByGoogle(); // hook wrapper của thunk

//   useEffect(() => {
//     const sub = Linking.addEventListener("url", async (event) => {
//       const { path, queryParams } = Linking.parse(event.url);

//       if (path === "auth/google/callback" && queryParams) {
//         try {
//           const accessToken = String(queryParams.accessToken || "");
//           const refreshToken = String(queryParams.refreshToken || "");
//           const expiresAt = String(queryParams.expiresAt || "");
//           const userJson = String(queryParams.user || "");

//           const user: User = JSON.parse(
//             Buffer.from(userJson, "base64").toString("utf8")
//           );

//           await signInByGoogle({ accessToken, refreshToken, expiresAt, user });
//           // Sau đây Redux đã authenticated, RootStack sẽ hiển thị (tabs)
//         } catch (e) {
//           console.log("Google callback error", e);
//         }
//       }
//     });

//     return () => sub.remove();
//   }, [signInByGoogle]);
// };




export const useSignOut = () => {
  const dispatch = useDispatch<AppDispatch>();
  return () => dispatch(signOut()).unwrap();
};



export const useResendConfirmation = () => {
  const dispatch = useDispatch<AppDispatch>();
  return (email: string) =>
    dispatch(resendConfirmation({ email })).unwrap();
};
