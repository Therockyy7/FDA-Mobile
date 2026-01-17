import React from "react";
import { Modal, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";

interface ModalConfirmLogoutProps {
  visible: boolean;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const ModalConfirmLogout: React.FC<ModalConfirmLogoutProps> = ({
  visible,
  loading,
  onConfirm,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/60 justify-center items-center px-6">
        <View className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl w-full max-w-sm">
          
          {/* Icon cảnh báo */}
          <View className="items-center mb-5">
            <View className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full items-center justify-center mb-4">
              <Ionicons name="log-out" size={32} color="#EF4444" style={{ marginLeft: 4 }} />
            </View>
            
            <Text className="text-xl font-bold text-slate-900 dark:text-white text-center">
              Đăng xuất?
            </Text>
            <Text className="text-base text-slate-500 dark:text-slate-400 text-center mt-2 px-2">
              Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?
            </Text>
          </View>

          {/* Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              disabled={loading}
              className="flex-1 h-12 rounded-xl border border-slate-200 dark:border-slate-700 items-center justify-center bg-white dark:bg-slate-800"
              activeOpacity={0.7}
            >
              <Text className="text-slate-700 dark:text-slate-300 font-semibold text-base">
                Huỷ
              </Text>
            </TouchableOpacity>

            <Button
              onPress={onConfirm}
              disabled={loading}
              className="flex-1 h-12 rounded-xl bg-red-500 shadow-lg shadow-red-500/30 border-0"
            >
              <Text className="text-white font-bold text-base">
                {loading ? "Đang xử lý..." : "Đăng xuất"}
              </Text>
            </Button>
          </View>

        </View>
      </View>
    </Modal>
  );
};

export default ModalConfirmLogout;