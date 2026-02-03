import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StatusBar, View } from "react-native";
import { Text } from "~/components/ui/text";
import ModalVerifyOTP from "~/features/auth/components/ModalVerifyOTP";
import { AuthService } from "~/features/auth/services/auth.service";
import { verifyOtpLogin } from "~/features/auth/stores/auth.slice";
import { useAppDispatch } from "../hooks";

export default function ResetPasswordOtpScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);

  const handleVerifyOtp = async () => {
    if (!email || otp.length < 6) {
      setOtpError("Vui lòng nhập đủ mã OTP 6 số");
      return;
    }

    setOtpLoading(true);
    setOtpError(null);

    try {
      // Đăng nhập bằng OTP
      await dispatch(
        verifyOtpLogin({ identifier: email, otpCode: otp, type: "email" }),
      ).unwrap();
      // Sau khi đăng nhập thành công, chuyển sang màn hình đặt mật khẩu mới
      router.replace({
        pathname: "/(auth)/set-new-password" as any,
        params: { email },
      });
    } catch (err: any) {
      setOtpError(err?.message || "Xác thực thất bại.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await AuthService.sendOTP(email as string);
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
      <LinearGradient
        colors={["#EFF6FF", "#FFFFFF"]}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text className="text-lg font-bold text-slate-400">
          Xác thực OTP để khôi phục tài khoản
        </Text>
      </LinearGradient>

      <ModalVerifyOTP
        visible={true}
        phone={email as string}
        otp={otp}
        onChangeOtp={setOtp}
        loading={otpLoading}
        onConfirm={handleVerifyOtp}
        onClose={() => router.back()}
        onResend={handleResendOTP}
        error={otpError}
      />
    </View>
  );
}
