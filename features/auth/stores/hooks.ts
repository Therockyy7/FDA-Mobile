import { unwrapResult } from "@reduxjs/toolkit";
import { useAppDispatch, useAppSelector } from "~/app/hooks"; // ✅ Dùng hook typed của dự án
import {
  signIn,
  signOut,
  signInByGoogle,
  verifyOtpLogin, // ✅ Import thunk gộp mới
  verifyLogin,
  User,
  AuthStatus,
  finishOnboarding,
  resendOtp, // ✅ Import action tắt TourGuide
} from "./auth.slice";

// --- 1. SELECTORS (Lấy dữ liệu) ---

export const useUser = () => 
  useAppSelector((state) => state.auth.user);

export const useSession = () => 
  useAppSelector((state) => state.auth.session);

export const useAuthStatus = (): AuthStatus => 
  useAppSelector((state) => state.auth.status);

export const useAuthLoading = () => 
  useAppSelector((state) => state.auth.loading);

// ✅ Selector mới: Lấy lỗi Global (nếu cần hiển thị Toast lỗi chung)
export const useAuthError = () => 
  useAppSelector((state) => state.auth.error);

// ✅ Selector mới: Kiểm tra User mới cho tính năng TourGuide
export const useIsNewUser = () => 
  useAppSelector((state) => state.auth.isNewUser);


// --- 2. ACTIONS (Gọi hàm xử lý) ---

// Login bằng Email + Password
export const useSignIn = () => {
  const dispatch = useAppDispatch();
  return (email: string, password: string) =>
    dispatch(signIn({ email, password })).unwrap();
};

// Login bằng Phone + OTP
export const useVerifyPhoneLogin = () => {
  const dispatch = useAppDispatch();
  return (phoneNumber: string, otpCode: string) =>
    // ✅ Gọi thunk gộp và truyền type="phone"
    dispatch(verifyOtpLogin({ 
      identifier: phoneNumber, 
      otpCode, 
      type: 'phone' 
    })).unwrap();
};

// Login bằng Email + OTP (User mới)
export const useVerifyEmailLogin = () => {
  const dispatch = useAppDispatch();
  return (email: string, otpCode: string) =>
    // ✅ Gọi thunk gộp và truyền type="email"
    dispatch(verifyOtpLogin({ 
      identifier: email, 
      otpCode, 
      type: 'email' 
    })).unwrap();
};

// Login bằng Password + OTP (2FA)
export const useVerifyLogin = () => {
  const dispatch = useAppDispatch();
  return (payload: { email: string; otpCode: string; password: string; deviceInfo: string }) =>
    dispatch(verifyLogin(payload)).unwrap();
};

// Login bằng Google
export const useSignInByGoogle = () => {
  const dispatch = useAppDispatch();
  return (params: {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    user: User;
    isNewUser?: boolean; // ✅ Cho phép truyền cờ user mới vào
  }) => dispatch(signInByGoogle(params)).unwrap();
};

// Đăng xuất
export const useSignOut = () => {
  const dispatch = useAppDispatch();
  return () => dispatch(signOut()).unwrap();
};

export const useResendOtp = () => {
  const dispatch = useAppDispatch();
  return (identifier: string) => 
    dispatch(resendOtp({ identifier })).unwrap();
};

// ✅ Hook mới: Tắt trạng thái User mới (Gọi khi xem xong TourGuide)
export const useFinishOnboarding = () => {
  const dispatch = useAppDispatch();
  return () => dispatch(finishOnboarding());
};