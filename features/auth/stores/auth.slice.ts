
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

export interface User {
  id: string;
  email: string;
}

export interface Session {
  user: User | null;
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

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));


export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { getState, dispatch }) => {
    await sleep(300);

    const state = getState() as { auth: AuthState };
    const { user } = state.auth;

    if (user) {
      dispatch(
        setSession({
          user,
        })
      );
      return { status: "authenticated" as AuthStatus };
    } else {
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
>("auth/signIn", async ({ email }, { dispatch }) => {
  await sleep(300);
  const fakeUser: User = { id: "fake-user-id", email };
  const fakeSession: Session = { user: fakeUser };
  dispatch(setSession(fakeSession));
  dispatch(setStatus("authenticated"));
  dispatch(setLoading(false));
  return { error: undefined };
});


export const signOut = createAsyncThunk<{ error?: AuthError }>(
  "auth/signOut",
  async (_, { dispatch }) => {
    await sleep(200);
    dispatch(setUser(null));
    dispatch(setSession({ user: null }));
    dispatch(setStatus("unauthenticated"));
    dispatch(setLoading(false));
    return { error: undefined };
  }
);

// verifyOtp + resendConfirmation mock
export const verifyOtp = createAsyncThunk<
  { error?: AuthError },
  { email: string; token: string }
>("auth/verifyOtp", async () => {
  await sleep(200);
  return { error: undefined };
});

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
      });
  },
});

export const { setUser, setSession, setLoading, setStatus } =
  authSlice.actions;

export default authSlice.reducer;
