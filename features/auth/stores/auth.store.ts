// features/auth/stores/auth.store.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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

type AuthStatus = "checking" | "authenticated" | "unauthenticated";

interface AuthState {
  user: User | null;
  session: Session | null;
  status: AuthStatus;
  loading: boolean;

  signUp: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signIn: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signOut: () => Promise<{ error?: AuthError }>;
  verifyOtp: (email: string, token: string) => Promise<{ error?: AuthError }>;
  resendConfirmation: (email: string) => Promise<{ error?: AuthError }>;

  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setStatus: (status: AuthStatus) => void;

  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      status: "checking",
      loading: true,

      initialize: async () => {
        // chỉ chạy 1 lần lúc app khởi động
        set({ loading: true, status: "checking" });

        await new Promise((res) => setTimeout(res, 300));

        const { user } = get();
        if (user) {
          set({
            session: { user },
            status: "authenticated",
            loading: false,
          });
        } else {
          set({
            session: null,
            status: "unauthenticated",
            loading: false,
          });
        }
      },

      signUp: async (_email, _password) => {
        await new Promise((res) => setTimeout(res, 300));
        return { error: undefined };
      },

      signIn: async (email, _password) => {
        await new Promise((res) => setTimeout(res, 300));
        const fakeUser: User = { id: "fake-user-id", email };
        const fakeSession: Session = { user: fakeUser };
        set({
          user: fakeUser,
          session: fakeSession,
          status: "authenticated",
          loading: false,
        });
        return { error: undefined };
      },

      signOut: async () => {
        await new Promise((res) => setTimeout(res, 200));
        set({
          user: null,
          session: null,
          status: "unauthenticated",
          loading: false,
        });
        return { error: undefined };
      },

      verifyOtp: async () => {
        await new Promise((res) => setTimeout(res, 200));
        return { error: undefined };
      },

      resendConfirmation: async () => {
        await new Promise((res) => setTimeout(res, 200));
        return { error: undefined };
      },

      setUser: (user) => set({ user }),
      setSession: (session) =>
        set({ session, user: session?.user ?? null }),
      setLoading: (loading) => set({ loading }),
      setStatus: (status) => set({ status }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
    }
  )
);

// ⚠️ Selectors phải trả về giá trị primitive/stable, không tạo object mới
export const useUser = () => useAuthStore((state) => state.user);
export const useSession = () => useAuthStore((state) => state.session);
export const useAuthStatus = () => useAuthStore((state) => state.status);
export const useAuthLoading = () => useAuthStore((state) => state.loading);

// KHÔNG return object mới trong selector (tránh getSnapshot warning)
export const useSignUp = () => useAuthStore((state) => state.signUp);
export const useSignIn = () => useAuthStore((state) => state.signIn);
export const useSignOut = () => useAuthStore((state) => state.signOut);
export const useVerifyOtp = () => useAuthStore((state) => state.verifyOtp);
export const useResendConfirmation = () =>
  useAuthStore((state) => state.resendConfirmation);

// Nếu cần nhiều action, dùng từng hook riêng, KHÔNG gộp:
export const useInitializeAuth = () =>
  useAuthStore((state) => state.initialize);
export const useSetLoading = () =>
  useAuthStore((state) => state.setLoading);
export const useSetStatus = () =>
  useAuthStore((state) => state.setStatus);
