// features/auth/hooks/useOTP.ts
// OTP input state and verification

import { useState, useCallback, useEffect, useRef } from "react";
import { useAppDispatch } from "~/app/hooks";
import { verifyOtpLogin, resendOtp } from "../stores/auth.slice";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

interface OTPFormState {
  otp: string;
  loading: boolean;
  error: string | null;
  countdown: number;
  canResend: boolean;
}

export const useOTPForm = (identifier: string) => {
  const dispatch = useAppDispatch();
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [form, setForm] = useState<OTPFormState>({
    otp: "",
    loading: false,
    error: null,
    countdown: 0,
    canResend: true,
  });

  // Cleanup countdown on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  const setOtp = useCallback((otp: string) => {
    // Only allow numeric OTP codes
    const numericOtp = otp.replace(/\D/g, "").slice(0, OTP_LENGTH);
    setForm((prev) => ({ ...prev, otp: numericOtp, error: null }));
  }, []);

  const verify = useCallback(async () => {
    if (form.otp.length !== OTP_LENGTH) {
      setForm((prev) => ({ ...prev, error: `Mã OTP gồm ${OTP_LENGTH} chữ số` }));
      return { success: false };
    }

    setForm((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await dispatch(
        verifyOtpLogin({ identifier, otpCode: form.otp, type: "email" }),
      ).unwrap();
      setForm((prev) => ({ ...prev, loading: false }));
      return { success: true };
    } catch (err: any) {
      setForm((prev) => ({
        ...prev,
        loading: false,
        error: err?.message || "Mã OTP không hợp lệ",
      }));
      return { success: false };
    }
  }, [dispatch, identifier, form.otp]);

  const resend = useCallback(async () => {
    if (!form.canResend) return { success: false };

    setForm((prev) => ({ ...prev, loading: true }));

    try {
      await dispatch(resendOtp({ identifier })).unwrap();

      // Start cooldown countdown
      setForm((prev) => ({ ...prev, canResend: false, countdown: RESEND_COOLDOWN_SECONDS }));

      countdownRef.current = setInterval(() => {
        setForm((prev) => {
          const newCountdown = prev.countdown - 1;
          if (newCountdown <= 0) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            return { ...prev, countdown: 0, canResend: true };
          }
          return { ...prev, countdown: newCountdown };
        });
      }, 1000);

      setForm((prev) => ({ ...prev, loading: false }));
      return { success: true };
    } catch (err: any) {
      setForm((prev) => ({
        ...prev,
        loading: false,
        error: err?.message || "Không thể gửi lại mã",
      }));
      return { success: false };
    }
  }, [dispatch, identifier, form.canResend]);

  const reset = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setForm({
      otp: "",
      loading: false,
      error: null,
      countdown: 0,
      canResend: true,
    });
  }, []);

  return {
    form,
    setOtp,
    verify,
    resend,
    reset,
    otpLength: OTP_LENGTH,
  };
};
