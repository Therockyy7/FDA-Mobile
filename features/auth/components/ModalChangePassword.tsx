import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  TouchableOpacity,
  View
} from "react-native";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";

export interface ModalChangePasswordProps {
  visible: boolean;
  loading: boolean;
  onSubmit: (params: { currentPassword: string; newPassword: string }) => void;
  onClose: () => void;
  error?: string | null;
  requireCurrentPassword?: boolean; // nếu account tạo từ OTP không có password thì có thể tắt
}

const ModalChangePassword: React.FC<ModalChangePasswordProps> = ({
  visible,
  loading,
  onSubmit,
  onClose,
  error,
  requireCurrentPassword = true,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = () => {
    setLocalError(null);

    if (requireCurrentPassword && !currentPassword.trim()) {
      setLocalError("Vui lòng nhập mật khẩu hiện tại");
      return;
    }

    if (!newPassword.trim()) {
      setLocalError("Vui lòng nhập mật khẩu mới");
      return;
    }

    if (newPassword.length < 6) {
      setLocalError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError("Mật khẩu xác nhận không khớp");
      return;
    }

    onSubmit({ currentPassword, newPassword });
  };

  const mergedError = error || localError;

  const resetState = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setLocalError(null);
  };

  const handleClose = () => {
    if (!loading) {
      resetState();
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background-light dark:bg-background-dark rounded-t-3xl p-6 pb-10">
            {/* Handle bar */}
            <View className="items-center mb-4">
              <View className="h-1 w-12 bg-gray-300 rounded-full mb-4" />
              <Text className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
                {requireCurrentPassword ? "Đổi mật khẩu" : "Tạo mật khẩu"}
              </Text>
              <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-2 text-center">
                {requireCurrentPassword
                  ? "Nhập mật khẩu hiện tại và mật khẩu mới để cập nhật."
                  : "Tài khoản của bạn chưa có mật khẩu. Hãy tạo mật khẩu mới."}
              </Text>
            </View>

            <View className="gap-4">
              {/* Current password */}
              {requireCurrentPassword && (
                <View className="gap-2">
                  <Text className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                    Mật khẩu hiện tại
                  </Text>
                  <View className="flex-row items-center">
                    <Input
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      placeholder="Nhập mật khẩu hiện tại"
                      secureTextEntry={!showCurrent}
                      className="flex-1 h-12 rounded-l-lg rounded-r-none bg-input-light dark:bg-input-dark border border-border-light dark:border-border-dark pr-2"
                    />
                    <TouchableOpacity
                      onPress={() => setShowCurrent(!showCurrent)}
                      className="h-12 px-3 bg-input-light dark:bg-input-dark items-center justify-center rounded-r-lg border border-l-0 border-border-light dark:border-border-dark"
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={showCurrent ? "eye-off" : "eye"}
                        size={20}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* New password */}
              <View className="gap-2">
                <Text className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                  Mật khẩu mới
                </Text>
                <View className="flex-row items-center">
                  <Input
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Nhập mật khẩu mới"
                    secureTextEntry={!showNew}
                    className="flex-1 h-12 rounded-l-lg rounded-r-none bg-input-light dark:bg-input-dark border border-border-light dark:border-border-dark pr-2"
                  />
                  <TouchableOpacity
                    onPress={() => setShowNew(!showNew)}
                    className="h-12 px-3 bg-input-light dark:bg-input-dark items-center justify-center rounded-r-lg border border-l-0 border-border-light dark:border-border-dark"
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showNew ? "eye-off" : "eye"}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm password */}
              <View className="gap-2">
                <Text className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                  Xác nhận mật khẩu mới
                </Text>
                <View className="flex-row items-center">
                  <Input
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Nhập lại mật khẩu mới"
                    secureTextEntry={!showConfirm}
                    className="flex-1 h-12 rounded-l-lg rounded-r-none bg-input-light dark:bg-input-dark border border-border-light dark:border-border-dark pr-2"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirm(!showConfirm)}
                    className="h-12 px-3 bg-input-light dark:bg-input-dark items-center justify-center rounded-r-lg border border-l-0 border-border-light dark:border-border-dark"
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showConfirm ? "eye-off" : "eye"}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Error */}
              {mergedError ? (
                <Text className="text-red-500 text-sm mt-1 text-center">
                  {mergedError}
                </Text>
              ) : null}

              {/* Actions */}
              <View className="mt-4 gap-3">
                <Button
                  onPress={handleConfirm}
                  disabled={loading}
                  className="h-12 rounded-lg bg-primary"
                >
                  <Text className="text-white font-semibold">
                    {loading
                      ? "Đang cập nhật..."
                      : requireCurrentPassword
                        ? "Cập nhật mật khẩu"
                        : "Tạo mật khẩu"}
                  </Text>
                </Button>

                <TouchableOpacity
                  onPress={handleClose}
                  className="h-12 rounded-lg border border-border-light dark:border-border-dark items-center justify-center"
                  activeOpacity={0.7}
                  disabled={loading}
                >
                  <Text className="text-text-secondary-light dark:text-text-secondary-dark font-medium">
                    Hủy
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ModalChangePassword;
