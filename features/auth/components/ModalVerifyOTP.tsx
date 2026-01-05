import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { OtpInput } from "react-native-otp-entry";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";

interface ModalVerifyOTPProps {
  visible: boolean;
  phone: string | null;
  otp: string;
  onChangeOtp: (value: string) => void;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
  onResend?: () => void; // ✅ Thêm prop Resend
  error?: string | null;
}

const ModalVerifyOTP: React.FC<ModalVerifyOTPProps> = ({
  visible,
  phone,
  otp,
  onChangeOtp,
  loading,
  onConfirm,
  onClose,
  onResend,
  error,
}) => {
  // State đếm ngược đơn giản cho nút Resend
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    let timer: any;
    if (visible && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [visible, countdown]);

  const handleResendClick = () => {
    if (onResend) {
      onResend();
      setCountdown(30); // Reset đếm ngược
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-black/70 justify-center items-center px-6">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="w-full"
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
          >
            {/* Main Card Container */}
            <View className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl items-center w-full">
              
              {/* Close Button (X) */}
              <TouchableOpacity 
                onPress={onClose}
                className="absolute top-4 right-4 z-10 p-2 bg-slate-100 dark:bg-slate-800 rounded-full"
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>

              {/* Icon Decoration */}
              <View className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center mb-5 mt-2">
                <Ionicons name="shield-checkmark" size={32} color="#3B82F6" />
              </View>

              <Text className="text-2xl font-bold text-slate-900 dark:text-white text-center">
                Xác thực bảo mật
              </Text>
              
              <Text className="text-base text-slate-500 dark:text-slate-400 mt-2 text-center px-2">
                Nhập mã 6 số chúng tôi vừa gửi tới{"\n"}
                <Text className="font-bold text-slate-900 dark:text-slate-200 text-lg">
                  {phone}
                </Text>
              </Text>

              {/* OTP Input */}
              <View className="w-full my-6">
                <OtpInput
                  numberOfDigits={6}
                  focusColor="#3B82F6"
                  onTextChange={onChangeOtp}
                  type="numeric"
                  theme={{
                    containerStyle: { width: "100%", justifyContent: "space-between" },
                    pinCodeContainerStyle: {
                      width: 44,
                      height: 50,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "#CBD5E1",
                      backgroundColor: "#F8FAFC",
                    },
                    pinCodeTextStyle: {
                      fontSize: 20,
                      fontWeight: "700",
                      color: "#0F172A",
                    },
                    focusedPinCodeContainerStyle: {
                      borderColor: "#3B82F6",
                      backgroundColor: "#EFF6FF",
                      borderWidth: 2,
                    },
                    filledPinCodeContainerStyle: {
                      borderColor: "#3B82F6",
                      backgroundColor: "#FFFFFF",
                    }
                  }}
                />
              </View>

              {/* Error Message */}
              {error ? (
                <View className="flex-row items-center mb-4 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg w-full">
                  <Ionicons name="alert-circle" size={18} color="#EF4444" />
                  <Text className="text-red-500 text-sm ml-2 font-medium flex-1">
                    {error}
                  </Text>
                </View>
              ) : null}

              {/* Resend Link inside Modal */}
              <View className="flex-row items-center justify-center mb-6">
                <Text className="text-slate-500 text-sm font-medium mr-1">
                  Chưa nhận được mã?
                </Text>
                <TouchableOpacity 
                  onPress={handleResendClick} 
                  disabled={countdown > 0}
                >
                  <Text className={`text-sm font-bold ${countdown > 0 ? 'text-slate-400' : 'text-blue-600'}`}>
                    {countdown > 0 ? `Gửi lại sau ${countdown}s` : "Gửi lại ngay"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Action Button */}
              <Button
                onPress={onConfirm}
                disabled={loading || otp.length < 6}
                className="w-full h-14 rounded-2xl bg-primary shadow-lg shadow-blue-500/30"
              >
                <Text className="text-white text-lg font-bold">
                  {loading ? "Đang xử lý..." : "Xác nhận"}
                </Text>
              </Button>

            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ModalVerifyOTP;