
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Platform, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";

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
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            padding: 20,
            paddingBottom: Platform.OS === "ios" ? 36 : 20,
          }}
        >
          {/* Handle Bar */}
          <View
            style={{
              width: 48,
              height: 5,
              backgroundColor: "#E5E7EB",
              borderRadius: 3,
              alignSelf: "center",
              marginBottom: 24,
            }}
          />

          <TouchableOpacity
            onPress={() => {
              onEdit();
              onClose();
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              padding: 18,
              borderRadius: 16,
              backgroundColor: "#F0F9FF",
              marginBottom: 12,
              borderWidth: 1,
              borderColor: "#DBEAFE",
            }}
            activeOpacity={0.7}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "#3B82F6",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="pencil" size={22} color="white" />
            </View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#1E40AF",
                flex: 1,
              }}
            >
              Chỉnh sửa khu vực
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#60A5FA" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              onDelete();
              onClose();
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              padding: 18,
              borderRadius: 16,
              backgroundColor: "#FEF2F2",
              borderWidth: 1,
              borderColor: "#FEE2E2",
            }}
            activeOpacity={0.7}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "#EF4444",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="trash" size={22} color="white" />
            </View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#DC2626",
                flex: 1,
              }}
            >
              Xóa khu vực
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#FCA5A5" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
