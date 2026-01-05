import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, View, StatusBar } from "react-native";
import { Text } from "~/components/ui/text";
import ModalVerifyOTP from "~/features/auth/components/ModalVerifyOTP";
import { AuthService } from "~/features/auth/services/auth.service";
import { verifyEmailLogin } from "~/features/auth/stores/auth.slice";
import { useAppDispatch } from "../hooks";
import { LinearGradient } from "expo-linear-gradient";

export default function EmailOtpScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { identifier } = useLocalSearchParams<{ identifier: string; isNewUser: string }>();

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    const sendOTP = async () => {
      try {
        await AuthService.sendOTP(identifier as string);
        setOtpSent(true);
      } catch (err: any) {
        Alert.alert("Lỗi", "Không thể gửi OTP.");
        router.back();
      }
    };
    sendOTP();
  }, [identifier]);

  const handleVerifyOtp = async () => {
    if (!identifier || otp.length < 4) {
      setOtpError("Vui lòng nhập đủ mã OTP");
      return;
    }
    setOtpLoading(true);
    setOtpError(null);
    try {
      await dispatch(verifyEmailLogin({ email: identifier as string, otpCode: otp })).unwrap();
      router.replace("/(tabs)");
    } catch (err: any) {
      setOtpError(err?.message || "Xác thực thất bại.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await AuthService.sendOTP(identifier as string);
      setOtpError(null);
      setOtp("");
      Alert.alert("Thông báo", "Mã OTP mới đã được gửi!");
    } catch (err: any) {
      Alert.alert("Lỗi", "Không thể gửi lại OTP.");
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={["#EFF6FF", "#FFFFFF"]} style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text className="text-lg font-bold text-slate-400">Đang xác thực Email...</Text>
      </LinearGradient>

      <ModalVerifyOTP
        visible={otpSent}
        phone={identifier as string}
        otp={otp}
        onChangeOtp={setOtp}
        loading={otpLoading}
        onConfirm={handleVerifyOtp}
        onClose={() => router.back()}
        onResend={handleResendOTP} // ✅ Truyền hàm resend
        error={otpError}
      />
    </View>
  );
}