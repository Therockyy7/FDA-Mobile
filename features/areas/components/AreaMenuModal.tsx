
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Platform, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { SHADOW, RADIUS } from "~/lib/design-tokens";

interface AreaMenuModalProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function AreaMenuModal({
  visible,
  onClose,
  onEdit,
  onDelete,
}: AreaMenuModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 justify-end"
        style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        testID="areas-modal-menu-overlay"
      >
        <View
          className="bg-white dark:bg-slate-900 p-5"
          style={{
            borderTopLeftRadius: RADIUS.sheet,
            borderTopRightRadius: RADIUS.sheet,
            paddingBottom: Platform.OS === "ios" ? 36 : 20,
            ...SHADOW.lg,
          }}
          testID="areas-modal-menu-sheet"
        >
          {/* Handle Bar */}
          <View className="w-12 h-1 bg-slate-200 dark:bg-slate-600 rounded-full self-center mb-6" />

          <TouchableOpacity
            onPress={() => {
              onEdit();
              onClose();
            }}
            className="flex-row items-center gap-4 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 mb-3 border border-blue-100 dark:border-blue-900"
            activeOpacity={0.7}
            testID="areas-modal-menu-edit-button"
          >
            <View className="w-11 h-11 rounded-full bg-primary items-center justify-center">
              <Ionicons name="pencil" size={22} color="white" />
            </View>
            <Text className="text-base font-bold text-blue-800 dark:text-blue-300 flex-1">
              Chỉnh sửa khu vực
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#38BDF8" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              onDelete();
              onClose();
            }}
            className="flex-row items-center gap-4 p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900"
            activeOpacity={0.7}
            testID="areas-modal-menu-delete-button"
          >
            <View className="w-11 h-11 rounded-full bg-red-500 items-center justify-center">
              <Ionicons name="trash" size={22} color="white" />
            </View>
            <Text className="text-base font-bold text-red-600 dark:text-red-400 flex-1">
              Xóa khu vực
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#FCA5A5" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
