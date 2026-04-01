// features/auth/types/login.types.ts
// Login-specific input/output types

export interface LoginInput {
  identifier: string;
  otpCode?: string | null;
  password?: string | null;
  deviceInfo?: string | null;
  fcmToken?: string | null;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SocialLoginData {
  provider: "google";
  idToken: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl: string;
  };
}

export interface OTPLoginData {
  identifier: string;
  otpCode: string;
  type: "email" | "phone";
}

export interface CheckIdentifierResponse {
  success: boolean;
  message: string;
  identifierType: "phone" | "email";
  accountExists: boolean;
  hasPassword: boolean;
  requiredMethod: "otp" | "password";
}

export interface CheckSetPassword {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}
