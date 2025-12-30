import React from "react";
import { Modal, View, TouchableOpacity } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { OtpInput } from "react-native-otp-entry";

interface ModalVerifyOTPProps {
  visible: boolean;
  phone: string | null;
  otp: string;
  onChangeOtp: (value: string) => void;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
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
  error,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-background-light dark:bg-background-dark rounded-t-3xl p-6 pb-10">
          <View className="items-center mb-4">
            <View className="h-1 w-12 bg-gray-300 rounded-full mb-4" />
            <Text className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Nhập mã OTP
            </Text>
            <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-2 text-center">
              Mã đã được gửi tới số{" "}
              <Text className="font-semibold">
                {phone || "SĐT"}
              </Text>
            </Text>
          </View>

          {/* OTP Input */}
          <View className="items-center my-4">
            <OtpInput
              numberOfDigits={6}
              onTextChange={onChangeOtp}
              focusColor="#3B82F6"
              autoFocus
              type="numeric"
              blurOnFilled={false}
              theme={{
                containerStyle: { width: "100%", justifyContent: "center" },
                pinCodeContainerStyle: {
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  backgroundColor: "#F9FAFB",
                },
                pinCodeTextStyle: { fontSize: 20, fontWeight: "700" },
                focusedPinCodeContainerStyle: {
                  borderColor: "#3B82F6",
                },
              }}
            />
            {error ? (
      <Text className="text-red-500 text-sm mt-2 text-center">
        {error}
      </Text>
    ) : null}
          </View>

          {/* Actions */}
          <View className="mt-4 gap-3">
            <Button
              onPress={onConfirm}
              disabled={loading || otp.length < 4}
              className="h-12 rounded-lg bg-primary"
            >
              <Text className="text-white font-semibold">
                {loading ? "Đang xác thực..." : "Xác nhận"}
              </Text>
            </Button>

            <TouchableOpacity
              onPress={onClose}
              className="h-12 rounded-lg border border-border-light dark:border-border-dark items-center justify-center"
              activeOpacity={0.7}
            >
              <Text className="text-text-secondary-light dark:text-text-secondary-dark font-medium">
                Huỷ
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ModalVerifyOTP;
