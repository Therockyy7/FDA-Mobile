import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import ModalVerifyOTP from "~/features/auth/components/ModalVerifyOTP";
import { AuthService } from "~/features/auth/services/auth.service";

import { verifyPhoneLogin } from "~/features/auth/stores/auth.slice";
import { useAppDispatch } from "../hooks";

export default function PhoneOtpScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { identifier, isNewUser } = useLocalSearchParams<{
    identifier: string;
    isNewUser: string;
  }>();
 
  
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    const sendOTP = async () => {
      try {
        await AuthService.sendOTP(identifier as string);
        setOtpSent(true);
        // Alert.alert("Thành công", "Mã OTP đã được gửi!");
      } catch (err: any) {
        Alert.alert("Lỗi", "Không thể gửi OTP. Vui lòng thử lại.");
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
    // Thêm .unwrap() vào cuối dispatch
    await dispatch(
      verifyPhoneLogin({
        phoneNumber: identifier as string,
        otpCode: otp,
      })
    ).unwrap(); 
    
    // ⚠️ NẾU LỖI, code sẽ tự động nhảy xuống CATCH ngay lập tức.
    // Nếu chạy được đến dòng này nghĩa là chắc chắn thành công 100%.
    router.replace("/(tabs)");

  } catch (err: any) {
    // Mọi lỗi (API trả về lỗi, mạng lỗi, v.v.) đều lọt vào đây
    console.log("CATCH Error:", err);
    // err ở đây chính là cái payload bạn reject từ server
    setOtpError(err?.message || "Xác thực OTP thất bại.");
  } finally {
    setOtpLoading(false);
  }
};

  const handleResendOTP = async () => {
    try {
      await AuthService.sendOTP(identifier as string);
      setOtpError(null);
      setOtp("");
      // Alert.alert("Thành công", "Mã OTP mới đã được gửi!");
    } catch (err: any) {
      Alert.alert("Lỗi", "Không thể gửi lại OTP. Vui lòng thử lại.");
    }
  };

  if (!otpSent) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark justify-center items-center p-6">
        <Text className="text-lg text-center">
          Đang gửi mã OTP đến {identifier}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-1 justify-center px-6 gap-4">
        <Text className="text-text-primary-light dark:text-text-primary-dark text-2xl font-bold text-center">
          Xác thực số điện thoại
        </Text>
        <Text className="text-text-secondary-light dark:text-text-secondary-dark text-base text-center">
          {isNewUser === "true"
            ? "Mã OTP đã được gửi để tạo tài khoản mới."
            : "Mã OTP đã được gửi đến số điện thoại của bạn."}
        </Text>

        <ModalVerifyOTP
          visible
          phone={identifier as string}
          otp={otp}
          onChangeOtp={setOtp}
          loading={otpLoading}
          onConfirm={handleVerifyOtp}
          onClose={() => router.back()}
          error={otpError}
        />

        <Button
          onPress={handleResendOTP}
          variant="outline"
          className="mt-2"
        >
          <Text className="text-primary font-medium">Gửi lại OTP</Text>
        </Button>

        <Button
          onPress={() => router.back()}
          variant="outline"
          className="mt-2"
        >
          <Text className="text-primary font-medium">Quay lại</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
