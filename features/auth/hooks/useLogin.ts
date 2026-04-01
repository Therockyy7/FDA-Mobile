// features/auth/hooks/useLogin.ts
// Login form state and handlers

import { useState, useCallback } from "react";
import { useAppDispatch } from "~/app/hooks";
import { signIn } from "../stores/auth.slice";
import { validateEmail } from "../utils/email-validation";
import { mapAuthError } from "../utils/auth-errors";

interface LoginFormState {
  email: string;
  password: string;
  loading: boolean;
  error: string | null;
  emailError: string | null;
}

export const useLoginForm = () => {
  const dispatch = useAppDispatch();

  const [form, setForm] = useState<LoginFormState>({
    email: "",
    password: "",
    loading: false,
    error: null,
    emailError: null,
  });

  const setEmail = useCallback((email: string) => {
    const validation = validateEmail(email);
    setForm((prev) => ({
      ...prev,
      email,
      emailError: validation.isValid ? null : "Email không hợp lệ",
    }));
  }, []);

  const setPassword = useCallback((password: string) => {
    setForm((prev) => ({ ...prev, password }));
  }, []);

  const submit = useCallback(async () => {
    // Validate
    const emailValidation = validateEmail(form.email);
    if (!emailValidation.isValid) {
      setForm((prev) => ({ ...prev, emailError: "Email không hợp lệ" }));
      return { success: false };
    }

    if (!form.password) {
      setForm((prev) => ({ ...prev, error: "Vui lòng nhập mật khẩu" }));
      return { success: false };
    }

    setForm((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await dispatch(signIn({ email: form.email, password: form.password })).unwrap();
      setForm((prev) => ({ ...prev, loading: false }));
      return { success: true };
    } catch (err: any) {
      const mappedError = mapAuthError(err?.message || "Đăng nhập thất bại");
      setForm((prev) => ({
        ...prev,
        loading: false,
        error: mappedError.message,
      }));
      return { success: false, error: mappedError };
    }
  }, [dispatch, form.email, form.password]);

  const reset = useCallback(() => {
    setForm({
      email: "",
      password: "",
      loading: false,
      error: null,
      emailError: null,
    });
  }, []);

  return {
    form,
    setEmail,
    setPassword,
    submit,
    reset,
  };
};
