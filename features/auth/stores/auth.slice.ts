import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProfileService } from "~/features/profile/services/profile.service";
import { AuthService } from "../services/auth.service";

// --- TYPES ---
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
  loading: boolean; // Chỉ dùng cho lúc khởi động app (initialize)
  isNewUser: boolean; // Dùng cho TourGuide
  error: string | null; // Lưu lỗi global nếu cần
}

const initialState: AuthState = {
  user: null,
  session: null,
  status: "checking",
  loading: true,
  isNewUser: false,
  error: null,
};

// --- CONSTANTS ---
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_DATA_KEY = "user_data";
const EXPIRES_AT_KEY = "expires_at";

// --- HELPERS ---
// Hàm phụ trợ để lưu data vào AsyncStorage, tránh viết lặp lại code
const saveAuthData = async (tokens: { accessToken: string; refreshToken: string; expiresAt: string }, user: User) => {
  await AsyncStorage.multiSet([
    [ACCESS_TOKEN_KEY, tokens.accessToken],
    [REFRESH_TOKEN_KEY, tokens.refreshToken],
    [EXPIRES_AT_KEY, tokens.expiresAt],
    [USER_DATA_KEY, JSON.stringify(user)],
  ]);
};

const clearAuthData = async () => {
  await AsyncStorage.multiRemove([
    ACCESS_TOKEN_KEY,
    REFRESH_TOKEN_KEY,
    USER_DATA_KEY,
    EXPIRES_AT_KEY,
  ]);
};

// --- THUNKS ---

// 1. Initialize Auth (Khởi động App)
export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { dispatch }) => {
    const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    const storedUser = await AsyncStorage.getItem(USER_DATA_KEY);

    if (!accessToken || !refreshToken) {
      return { isAuthenticated: false, user: null };
    }

    try {
      // Ưu tiên lấy từ Storage trước cho nhanh để hiện UI
      let user = storedUser ? JSON.parse(storedUser) : null;
      
      // Sau đó gọi API để update thông tin mới nhất (ngầm)
      const res = await ProfileService.getProfile();
      user = res.data.profile as User;
      
      // Cập nhật lại user mới nhất vào storage
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));

      return { 
        isAuthenticated: true, 
        user, 
        accessToken, 
        refreshToken,
        expiresAt: (await AsyncStorage.getItem(EXPIRES_AT_KEY)) || undefined
      };
    } catch {
      await clearAuthData();
      return { isAuthenticated: false, user: null };
    }
  }
);

// Interface trả về chung cho các hành động Login thành công
interface AuthSuccessPayload {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  isNewUser: boolean;
}

// 2. Sign In (Email + Password)
export const signIn = createAsyncThunk<
  AuthSuccessPayload, // Return Type
  { email: string; password: string }, // Agrument Type
  { rejectValue: AuthError } // Config
>("auth/signIn", async ({ email, password }, { rejectWithValue }) => {
  try {
    const res = await AuthService.loginUnified({
      identifier: email,
      otpCode: null,
      password,
      deviceInfo: "mobile-app",
    });

    const { accessToken, refreshToken, expiresAt } = res.data;

    // Fetch Profile
    const profileRes = await ProfileService.getProfile(accessToken);
    const profile = profileRes.data.profile as User;

    // Save Storage
    await saveAuthData({ accessToken, refreshToken, expiresAt }, profile);

    // Return data for extraReducers
    return { 
      user: profile, 
      accessToken, 
      refreshToken, 
      expiresAt, 
      isNewUser: false 
    };
  } catch (err: any) {
    const message = err?.response?.data?.message || "Đăng nhập thất bại.";
    return rejectWithValue({ message });
  }
});

// 3. Verify Login (Password Variant)
export const verifyLogin = createAsyncThunk<
  AuthSuccessPayload,
  { email: string; otpCode: string; password: string; deviceInfo: string },
  { rejectValue: AuthError }
>("auth/verifyLogin", async (payload, { rejectWithValue }) => {
  try {
    const res = await AuthService.loginUnified({
      identifier: payload.email,
      otpCode: payload.otpCode,
      password: payload.password,
      deviceInfo: payload.deviceInfo,
    });

    const { accessToken, refreshToken, expiresAt } = res.data;
    const profileRes = await ProfileService.getProfile(accessToken);
    const profile = profileRes.data.profile as User;

    await saveAuthData({ accessToken, refreshToken, expiresAt }, profile);

    return { 
      user: profile, 
      accessToken, 
      refreshToken, 
      expiresAt, 
      isNewUser: false 
    };
  } catch (err: any) {
    return rejectWithValue({ message: err?.response?.data?.message || "Đăng nhập thất bại." });
  }
});

// 4. Verify Phone/Email Login (OTP)
// Gom chung Phone và Email vì logic giống hệt nhau, chỉ khác tham số truyền vào service
export const verifyOtpLogin = createAsyncThunk<
  AuthSuccessPayload,
  { identifier: string; otpCode: string; type: 'email' | 'phone' },
  { rejectValue: AuthError }
>("auth/verifyOtpLogin", async ({ identifier, otpCode }, { rejectWithValue }) => {
  try {
    const res = await AuthService.loginUnified({
      identifier,
      otpCode,
      password: null,
      deviceInfo: "mobile-app",
    });

    // Check trường hợp logic riêng của backend bạn
    if (res.data?.success === false || !res.data.accessToken) {
       return rejectWithValue({ message: res.data.message || "OTP không hợp lệ" });
    }

    const { accessToken, refreshToken, expiresAt } = res.data;
    const profileRes = await ProfileService.getProfile(accessToken);
    const profile = profileRes.data.profile as User;

    await saveAuthData({ accessToken, refreshToken, expiresAt }, profile);

    // Giả sử logic check new user nằm ở đây, tạm thời để false hoặc lấy từ res.data nếu có
    return { 
      user: profile, 
      accessToken, 
      refreshToken, 
      expiresAt, 
      isNewUser: res.data.isNewUser || false // Lấy từ response nếu có
    };
  } catch (err: any) {
    return rejectWithValue({ message: err?.response?.data?.message || "Xác thực OTP thất bại." });
  }
});

// 5. Sign In By Google
export const signInByGoogle = createAsyncThunk<
  AuthSuccessPayload,
  { accessToken: string; refreshToken: string; expiresAt: string; user: User; isNewUser?: boolean },
  { rejectValue: AuthError }
>("auth/signInByGoogle", async (payload, { rejectWithValue }) => {
  try {
    const { accessToken, refreshToken, expiresAt, isNewUser } = payload;

    await saveAuthData({ accessToken, refreshToken, expiresAt }, payload.user);


    const profileRes = await ProfileService.getProfile(accessToken);
    const fullProfile = profileRes.data.profile as User;

    await AsyncStorage.setItem("user_data", JSON.stringify(fullProfile));

    return { 
      user: fullProfile, 
      accessToken, 
      refreshToken, 
      expiresAt,
      isNewUser: isNewUser || false 
    };
  } catch (err: any) {
    console.error("Redux Google Login Error:", err);
    return rejectWithValue({ message: "Không thể lấy thông tin người dùng." });
  }
}); 

// 6. Sign Out
export const signOut = createAsyncThunk(
  "auth/signOut",
  async (_, { dispatch }) => {
    try { await AuthService.logout(false); } catch { /* ignore */ }
    await clearAuthData();
    return;
  }
);

export const resendOtp = createAsyncThunk<
  void,
  { identifier: string }, // Chỉ cần identifier (email hoặc phone)
  { rejectValue: AuthError }
>("auth/resendOtp", async ({ identifier }, { rejectWithValue }) => {
  try {
   
    await AuthService.sendOTP(identifier);

    return;
  } catch (err: any) {
    return rejectWithValue({ 
      message: err?.response?.data?.message || "Gửi lại mã thất bại. Vui lòng thử lại." 
    });
  }
});

const handleLoginSuccess = (state: AuthState, action: PayloadAction<AuthSuccessPayload>) => {
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
};

// 2. Helper xử lý khi đăng nhập thất bại (SỬA LẠI)
// ⚠️ Thay đổi: Tham số thứ 2 đổi từ "action" thành "error" (AuthError | undefined)
// Lý do: Để khớp với cách gọi "handleLoginError(state, action.payload)"
const handleLoginError = (state: AuthState, error: AuthError | undefined) => {
   state.error = error?.message || "Lỗi xác thực không xác định";
   // Lưu ý: Không set status = 'unauthenticated' ở đây 
   // để tránh việc App tự động chuyển màn hình khi đang nhập liệu sai
};

// --- SLICE ---
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      const newUser = action.payload;
      state.user = newUser;
    
      if (state.session) {
        state.session.user = newUser;
      }
    },
    setSession(state, action: PayloadAction<Session | null>) {
      state.session = action.payload;
      state.user = action.payload?.user ?? null;
      if (action.payload?.user) state.status = "authenticated";
    },
    setStatus(state, action: PayloadAction<AuthStatus>) {
      state.status = action.payload;
    },
    // ✅ Action quan trọng cho TourGuide
    finishOnboarding: (state) => {
        state.isNewUser = false;
    }
  },
  extraReducers: (builder) => {
    // --- 1. INITIALIZE ---
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

    // --- 2. LOGIN ACTIONS (Sử dụng Helper đã sửa) ---
    builder
      // SignIn (Password)
      .addCase(signIn.fulfilled, handleLoginSuccess)
      .addCase(signIn.rejected, (state, action) => handleLoginError(state, action.payload))
      
      // VerifyLogin (Password + OTP)
      .addCase(verifyLogin.fulfilled, handleLoginSuccess)
      .addCase(verifyLogin.rejected, (state, action) => handleLoginError(state, action.payload))

      // VerifyOtpLogin (Phone/Email)
      .addCase(verifyOtpLogin.fulfilled, handleLoginSuccess)
      .addCase(verifyOtpLogin.rejected, (state, action) => handleLoginError(state, action.payload))

      // Google
      .addCase(signInByGoogle.fulfilled, handleLoginSuccess)
      .addCase(signInByGoogle.rejected, (state, action) => handleLoginError(state, action.payload));

    // --- 3. LOGOUT ---
    builder.addCase(signOut.fulfilled, (state) => {
      state.user = null;
      state.session = null;
      state.status = "unauthenticated";
      state.isNewUser = false;
    });
  },
});

// Export Actions & Reducer
export const {setUser, setSession, setStatus, finishOnboarding } = authSlice.actions;
export default authSlice.reducer;