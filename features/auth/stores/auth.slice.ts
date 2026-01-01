
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthService } from "../services/auth.service";

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

const ACCESS_TOKEN_KEY = "";
const REFRESH_TOKEN_KEY = "";
const USER_DATA_KEY = "";
const EXPIRES_AT_KEY = "";

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));


export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { dispatch }) => {
    const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

    if (!accessToken || !refreshToken) {
      return { status: "unauthenticated" as AuthStatus };
    }

    try {
      const res = await AuthService.getProfile(); // /api/v1/auth/me
      const user: User = res.data;

      dispatch(
        setSession({
          user,
          accessToken,
          refreshToken,
          expiresAt: await AsyncStorage.getItem(EXPIRES_AT_KEY) || undefined,
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


export const signIn = createAsyncThunk<
  { error?: AuthError },
  { email: string; password: string }
>("auth/signIn", async ({ email, password }, { dispatch, rejectWithValue }) => {
  try {
    const res = await AuthService.login({
      email,
      password,
      phoneNumber: "",
      otpCode: "",
      deviceInfo: "mobile-app",
    });

    const {
      accessToken,
      refreshToken,
      expiresAt,
      user,
    }: {
      accessToken: string;
      refreshToken: string;
      expiresAt: string;
      user: User;
    } = res.data;

    await AsyncStorage.multiSet([
      [ACCESS_TOKEN_KEY, accessToken],
      [REFRESH_TOKEN_KEY, refreshToken],
      [USER_DATA_KEY, JSON.stringify(user)],
      [EXPIRES_AT_KEY, expiresAt],
    ]);

    dispatch(
      setSession({
        user,
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


export const verifyPhoneLogin = createAsyncThunk<
  { error?: AuthError },
  { phoneNumber: string; otpCode: string }
>(
  "auth/verifyPhoneLogin",
  async ({ phoneNumber, otpCode }, { dispatch, rejectWithValue }) => {
    try {
      const res = await AuthService.login({
        phoneNumber,
        otpCode,
        email: "",
        password: "",
        deviceInfo: "mobile-app",
      });

      const {
        accessToken,
        refreshToken,
        expiresAt,
        user,
      }: {
        accessToken: string;
        refreshToken: string;
        expiresAt: string;
        user: User;
      } = res.data;

      await AsyncStorage.multiSet([
        [ACCESS_TOKEN_KEY, accessToken],
        [REFRESH_TOKEN_KEY, refreshToken],
        [USER_DATA_KEY, JSON.stringify(user)],
        [EXPIRES_AT_KEY, expiresAt],
      ]);

      dispatch(
        setSession({
          user,
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
        "Xác thực OTP thất bại. Vui lòng thử lại.";
      return rejectWithValue({ message } as AuthError);
    }
  }
);

export const signInByGoogle = createAsyncThunk<
  { error?: AuthError },
  {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    user: User;
  }
>(
  "auth/signInByGoogle",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const { accessToken, refreshToken, expiresAt, user } = payload;

      await AsyncStorage.multiSet([
        [ACCESS_TOKEN_KEY, accessToken],
        [REFRESH_TOKEN_KEY, refreshToken],
        [USER_DATA_KEY, JSON.stringify(user)],
        [EXPIRES_AT_KEY, expiresAt],
      ]);

      dispatch(
        setSession({
          user,
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
  }
);




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


// verifyOtp + resendConfirmation mock

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
      .addCase(signIn.pending, (state) => {
        state.loading = true;
      })
      .addCase(signIn.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
      })
      .addCase(verifyPhoneLogin.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyPhoneLogin.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(verifyPhoneLogin.rejected, (state) => {
        state.loading = false;
      })
      .addCase(signInByGoogle.pending, (state) => {
        state.loading = true;
      })
      .addCase(signInByGoogle.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(signInByGoogle.rejected, (state) => {
        state.loading = false;
      });
      
      ;
  },
});

export const { setUser, setSession, setLoading, setStatus } =
  authSlice.actions;

export default authSlice.reducer;
