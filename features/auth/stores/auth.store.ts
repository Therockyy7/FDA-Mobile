import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthError, Session, User } from "@supabase/supabase-js";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { supabase } from "~/lib/supabase";

interface AuthState {
  // State
  user: User | null;
  session: Session | null;
  loading: boolean;

  // Actions
  signUp: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signIn: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signOut: () => Promise<{ error?: AuthError }>;
  verifyOtp: (email: string, token: string) => Promise<{ error?: AuthError }>;
  resendConfirmation: (email: string) => Promise<{ error?: AuthError }>;

  // Internal actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      session: null,
      loading: true,

      // Actions
      signUp: async (email: string, password: string) => {
        try {
          set({ loading: true });
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: undefined,
            },
          });
          return { error };
        } catch (error) {
          return { error: error as AuthError };
        } finally {
          set({ loading: false });
        }
      },

      signIn: async (email: string, password: string) => {
        try {
          set({ loading: true });
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          return { error };
        } catch (error) {
          return { error: error as AuthError };
        } finally {
          set({ loading: false });
        }
      },

      signOut: async () => {
        try {
          set({ loading: true });
          const { error } = await supabase.auth.signOut();
          if (!error) {
            set({ user: null, session: null });
          }
          return { error };
        } catch (error) {
          return { error: error as AuthError };
        } finally {
          set({ loading: false });
        }
      },

      verifyOtp: async (email: string, token: string) => {
        try {
          set({ loading: true });
          const { error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: "signup",
          });
          return { error };
        } catch (error) {
          return { error: error as AuthError };
        } finally {
          set({ loading: false });
        }
      },

      resendConfirmation: async (email: string) => {
        try {
          const { error } = await supabase.auth.resend({
            type: "signup",
            email,
          });
          return { error };
        } catch (error) {
          return { error: error as AuthError };
        }
      },

      // Internal actions
      setUser: (user: User | null) => set({ user }),
      setSession: (session: Session | null) =>
        set({ session, user: session?.user ?? null }),
      setLoading: (loading: boolean) => set({ loading }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist user and session, not loading state
      partialize: (state: AuthState) => ({
        user: state.user,
        session: state.session,
      }),
    }
  )
);

// Selectors for performance
export const useUser = () => useAuthStore((state: AuthState) => state.user);
export const useSession = () =>
  useAuthStore((state: AuthState) => state.session);
export const useAuthLoading = () =>
  useAuthStore((state: AuthState) => state.loading);
export const useSignUp = () => useAuthStore((state: AuthState) => state.signUp);
export const useSignIn = () => useAuthStore((state: AuthState) => state.signIn);
export const useSignOut = () =>
  useAuthStore((state: AuthState) => state.signOut);
export const useVerifyOtp = () =>
  useAuthStore((state: AuthState) => state.verifyOtp);
export const useResendConfirmation = () =>
  useAuthStore((state: AuthState) => state.resendConfirmation);

// Initialize auth state automatically
const initializeAuth = () => {
  // Get initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    useAuthStore.setState({
      session,
      user: session?.user ?? null,
      loading: false,
    });
  });

  // Listen for auth changes
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.setState({
      session,
      user: session?.user ?? null,
      loading: false,
    });
  });

  return () => subscription.unsubscribe();
};

// Auto-initialize when store is imported
initializeAuth();
