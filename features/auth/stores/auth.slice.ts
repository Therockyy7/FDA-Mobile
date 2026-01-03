import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthService, CheckSetPassword } from "../services/auth.service";
import { ProfileService } from "~/features/profile/services/profile.service";

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
}

const initialState: AuthState = {
  user: null,
  session: null,
  status: "checking",
  loading: true,
};

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_DATA_KEY = "user_data";
const EXPIRES_AT_KEY = "expires_at";

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

// --- 1. Initialize Auth ---
export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { dispatch }) => {
    const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

    if (!accessToken || !refreshToken) {
      return { status: "unauthenticated" as AuthStatus };
    }

    try {
      // Lấy profile mới nhất khi mở app
      const res = await ProfileService.getProfile();
      const profile = res.data.profile as User;

      dispatch(
        setSession({
          user: profile,
          accessToken,
          refreshToken,
          expiresAt:
            (await AsyncStorage.getItem(EXPIRES_AT_KEY)) || undefined,
        })
      );

      return { status: "authenticated" as AuthStatus };
    } catch {
      await AsyncStorage.multiRemove([
        ACCESS_TOKEN_KEY,
        REFRESH_TOKEN_KEY,
        USER_DATA_KEY,
        EXPIRES_AT_KEY,
      ]);
      return { status: "unauthenticated" as AuthStatus };
    }
  }
);

export const signUp = createAsyncThunk<
  { error?: AuthError },
  { email: string; password: string }
>("auth/signUp", async () => {
  await sleep(300);
  return { error: undefined };
});

// --- 2. Sign In (Email + Password) ---
export const signIn = createAsyncThunk<
  { error?: AuthError },
  { email: string; password: string }
>("auth/signIn", async ({ email, password }, { dispatch, rejectWithValue }) => {
  try {
    const res = await AuthService.loginUnified({
      identifier: email,
      otpCode: null,
      password,
      deviceInfo: "mobile-app",
    });

    const { accessToken, refreshToken, expiresAt } = res.data;

    // 1. Lưu Token trước để API sau có thể dùng (nếu interceptor đọc từ storage)
    await AsyncStorage.multiSet([
      [ACCESS_TOKEN_KEY, accessToken],
      [REFRESH_TOKEN_KEY, refreshToken],
      [EXPIRES_AT_KEY, expiresAt],
    ]);

    // 2. Gọi Profile Service lấy thông tin User mới nhất
    const profileRes = await ProfileService.getProfile();
    const profile = profileRes.data.profile as User;

    // 3. Lưu Profile vào Storage
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(profile));

    // 4. Update Redux
    dispatch(
      setSession({
        user: profile,
        accessToken,
        refreshToken,
        expiresAt,
      })
    );
    dispatch(setStatus("authenticated"));
    dispatch(setLoading(false));

    return { error: undefined };
  } catch (err: any) {
    const message =
      err?.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.";
    return rejectWithValue({ message } as AuthError);
  }
});

// --- 3. Verify Login (Password Variant) ---
export const verifyLogin = createAsyncThunk<
  { error?: AuthError },
  { email: string; otpCode: string; password: string; deviceInfo: string }
>(
  "auth/verifyLogin",
  async (
    { email, otpCode, password, deviceInfo },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const res = await AuthService.loginUnified({
        identifier: email,
        otpCode,
        password: password,
        deviceInfo: deviceInfo,
      });

      const { accessToken, refreshToken, expiresAt } = res.data;

      // 1. Lưu Token
      await AsyncStorage.multiSet([
        [ACCESS_TOKEN_KEY, accessToken],
        [REFRESH_TOKEN_KEY, refreshToken],
        [EXPIRES_AT_KEY, expiresAt],
      ]);

      // 2. Fetch Profile
      const profileRes = await ProfileService.getProfile();
      const profile = profileRes.data.profile as User;

      // 3. Lưu Profile
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(profile));

      // 4. Dispatch Session
      dispatch(
        setSession({
          user: profile,
          accessToken,
          refreshToken,
          expiresAt,
        })
      );
      dispatch(setStatus("authenticated"));
      dispatch(setLoading(false));

      return { error: undefined };
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "Đăng nhập thất bại. Vui lòng thử lại.";
      return rejectWithValue({ message } as AuthError);
    }
  }
);

// --- 4. Verify Email Login (OTP) ---
export const verifyEmailLogin = createAsyncThunk<
  { error?: AuthError },
  { email: string; otpCode: string }
>(
  "auth/verifyEmailLogin",
  async ({ email, otpCode }, { dispatch, rejectWithValue }) => {
    try {
      const res = await AuthService.loginUnified({
        identifier: email,
        otpCode,
        password: null,
        deviceInfo: "mobile-app",
      });

      const { accessToken, refreshToken, expiresAt } = res.data;

      await AsyncStorage.multiSet([
        [ACCESS_TOKEN_KEY, accessToken],
        [REFRESH_TOKEN_KEY, refreshToken],
        [EXPIRES_AT_KEY, expiresAt],
      ]);

      const profileRes = await ProfileService.getProfile();
      const profile = profileRes.data.profile as User;

      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(profile));
      
      dispatch(
        setSession({
          user: profile,
          accessToken,
          refreshToken,
          expiresAt,
        })
      );
      dispatch(setStatus("authenticated"));
      dispatch(setLoading(false));

      return { error: undefined };
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "Xác thực OTP email thất bại. Vui lòng thử lại.";
      return rejectWithValue({ message } as AuthError);
    }
  }
);

// --- 5. Verify Phone Login (OTP) ---
export const verifyPhoneLogin = createAsyncThunk<
  { error?: AuthError },
  { phoneNumber: string; otpCode: string }
>(
  "auth/verifyPhoneLogin",
  async ({ phoneNumber, otpCode }, { dispatch, rejectWithValue }) => {
    try {
      const res = await AuthService.loginUnified({
        identifier: phoneNumber,
        otpCode,
        password: null,
        deviceInfo: "mobile-app",
      });

      // Check success flag logic from your original code
      if (res.data?.success === false) {
        dispatch(setSession(null));
        dispatch(setStatus("unauthenticated"));
        await AsyncStorage.multiRemove([
          ACCESS_TOKEN_KEY,
          REFRESH_TOKEN_KEY,
          USER_DATA_KEY,
          EXPIRES_AT_KEY,
        ]);
        return rejectWithValue({
          message: res.data.message || "OTP không hợp lệ",
        } as AuthError);
      }

      const { accessToken, refreshToken, expiresAt } = res.data;

      if (!accessToken || !refreshToken) {
        dispatch(setSession(null));
        dispatch(setStatus("unauthenticated"));
        await AsyncStorage.multiRemove([
          ACCESS_TOKEN_KEY,
          REFRESH_TOKEN_KEY,
          USER_DATA_KEY,
          EXPIRES_AT_KEY,
        ]);
        return rejectWithValue({
          message: "OTP không hợp lệ",
        } as AuthError);
      }

      // 1. Lưu Token
      await AsyncStorage.multiSet([
        [ACCESS_TOKEN_KEY, accessToken],
        [REFRESH_TOKEN_KEY, refreshToken],
        [EXPIRES_AT_KEY, expiresAt],
      ]);

      // 2. Fetch Profile (QUAN TRỌNG: Gọi sau khi đã có token)
      const profileRes = await ProfileService.getProfile();
      const profile = profileRes.data.profile as User;

      // 3. Lưu Profile
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(profile));

      // 4. Dispatch Session
      dispatch(
        setSession({
          user: profile,
          accessToken,
          refreshToken,
          expiresAt,
        })
      );
      dispatch(setStatus("authenticated"));
      dispatch(setLoading(false));

      return { error: undefined };
    } catch (err: any) {
      dispatch(setSession(null));
      dispatch(setStatus("unauthenticated"));
      await AsyncStorage.multiRemove([
        ACCESS_TOKEN_KEY,
        REFRESH_TOKEN_KEY,
        USER_DATA_KEY,
        EXPIRES_AT_KEY,
      ]);

      const message =
        err?.response?.data?.message ||
        "Xác thực OTP thất bại. Vui lòng thử lại.";
      return rejectWithValue({ message } as AuthError);
    }
  }
);

// --- 6. Sign In By Google ---
export const signInByGoogle = createAsyncThunk<
  { error?: AuthError },
  {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    user: User; // User này từ Google trả về, nhưng ta sẽ fetch lại Profile cho chuẩn
  }
>("auth/signInByGoogle", async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { accessToken, refreshToken, expiresAt } = payload;

    // 1. Lưu Token
    await AsyncStorage.multiSet([
      [ACCESS_TOKEN_KEY, accessToken],
      [REFRESH_TOKEN_KEY, refreshToken],
      [EXPIRES_AT_KEY, expiresAt],
    ]);

    // 2. Fetch Profile từ Server của mình (để lấy roles, id chuẩn của hệ thống)
    const profileRes = await ProfileService.getProfile();
    const profile = profileRes.data.profile as User;

    // 3. Lưu Profile
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(profile));

    // 4. Dispatch Session
    dispatch(
      setSession({
        user: profile,
        accessToken,
        refreshToken,
        expiresAt,
      })
    );
    dispatch(setStatus("authenticated"));
    dispatch(setLoading(false));

    return { error: undefined };
  } catch (err: any) {
    const message =
      err?.message || "Đăng nhập Google thất bại. Vui lòng thử lại.";
    return rejectWithValue({ message } as AuthError);
  }
});

export const setPassWord = createAsyncThunk<
  { error?: AuthError },
  CheckSetPassword
>("auth/setPassWord", async (form, { dispatch, rejectWithValue }) => {
  try {
    await AuthService.setPassWord(form);
    return { error: undefined };
  } catch (err: any) {
    const message =
      err?.response?.data?.message ||
      "Đặt mật khẩu thất bại. Vui lòng thử lại.";
    return rejectWithValue({ message } as AuthError);
  }
});

export const signOut = createAsyncThunk<{ error?: AuthError }>(
  "auth/signOut",
  async (_, { dispatch }) => {
    try {
      await AuthService.logout(false);
    } catch {
      // ignore
    }

    await AsyncStorage.multiRemove([
      ACCESS_TOKEN_KEY,
      REFRESH_TOKEN_KEY,
      USER_DATA_KEY,
      EXPIRES_AT_KEY,
    ]);

    dispatch(setUser(null));
    dispatch(setSession(null));
    dispatch(setStatus("unauthenticated"));
    dispatch(setLoading(false));
    return { error: undefined };
  }
);

export const resendConfirmation = createAsyncThunk<
  { error?: AuthError },
  { email: string }
>("auth/resendConfirmation", async () => {
  await sleep(200);
  return { error: undefined };
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },
    setSession(state, action: PayloadAction<Session | null>) {
      state.session = action.payload;
      state.user = action.payload?.user ?? null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setStatus(state, action: PayloadAction<AuthStatus>) {
      state.status = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.status = "checking";
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.status = action.payload.status;
        state.loading = false;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.status = "unauthenticated";
        state.loading = false;
      })
      // Các case khác comment loading như yêu cầu cũ
      .addCase(signIn.pending, (state) => {
        // state.loading = true;
      })
      .addCase(signIn.fulfilled, (state) => {
        // state.loading = false;
      })
      .addCase(signIn.rejected, (state) => {
        // state.loading = false;
      })
      .addCase(verifyPhoneLogin.pending, (state) => {
        // state.loading = true;
      })
      .addCase(verifyPhoneLogin.fulfilled, (state) => {
        // state.loading = false;
      })
      .addCase(verifyPhoneLogin.rejected, (state) => {
        // state.loading = false;
      })
      .addCase(verifyEmailLogin.pending, (state) => {
        // state.loading = true;
      })
      .addCase(verifyEmailLogin.fulfilled, (state) => {
        // state.loading = false;
      })
      .addCase(verifyEmailLogin.rejected, (state) => {
        // state.loading = false;
      })
      .addCase(signInByGoogle.pending, (state) => {
        // state.loading = true;
      })
      .addCase(signInByGoogle.fulfilled, (state) => {
        // state.loading = false;
      })
      .addCase(signInByGoogle.rejected, (state) => {
        // state.loading = false;
      });
  },
});

export const { setUser, setSession, setLoading, setStatus } = authSlice.actions;

export default authSlice.reducer;