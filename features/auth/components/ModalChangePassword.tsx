import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    TouchableOpacity,
    View,
} from "react-native";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { useTranslation } from "~/features/i18n";

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
  const { t } = useTranslation();

  const handleConfirm = () => {
    setLocalError(null);

    if (requireCurrentPassword && !currentPassword.trim()) {
      setLocalError(t("password.error.currentRequired"));
      return;
    }

    if (!newPassword.trim()) {
      setLocalError(t("password.error.newRequired"));
      return;
    }

    if (newPassword.length < 6) {
      setLocalError(t("password.error.min"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError(t("password.error.mismatch"));
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background-light dark:bg-background-dark rounded-t-3xl p-6 pb-10">
            {/* Handle bar */}
            <View className="items-center mb-4">
              <View className="h-1 w-12 bg-gray-300 rounded-full mb-4" />
              <Text className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
                {requireCurrentPassword ? t("password.change.title") : t("password.set.title")}
              </Text>
              <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-2 text-center">
                {requireCurrentPassword
                  ? t("password.change.desc")
                  : t("password.set.desc")}
              </Text>
            </View>

            <View className="gap-4">
              {/* Current password */}
              {requireCurrentPassword && (
                <View className="gap-2">
                  <Text className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                    {t("password.current")}
                  </Text>
                  <View className="flex-row items-center">
                    <Input
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      placeholder={t("password.placeholder.current")}
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
                  {t("password.new")}
                </Text>
                <View className="flex-row items-center">
                  <Input
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder={t("password.placeholder.new")}
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
                  {t("password.confirm")}
                </Text>
                <View className="flex-row items-center">
                  <Input
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder={t("password.placeholder.confirm")}
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
                      ? t("common.updating")
                      : requireCurrentPassword
                        ? t("password.change.submit")
                        : t("password.set.submit")}
                  </Text>
                </Button>

                <TouchableOpacity
                  onPress={handleClose}
                  className="h-12 rounded-lg border border-border-light dark:border-border-dark items-center justify-center"
                  activeOpacity={0.7}
                  disabled={loading}
                >
                  <Text className="text-text-secondary-light dark:text-text-secondary-dark font-medium">
                    {t("common.cancel")}
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
