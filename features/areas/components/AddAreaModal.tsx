
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "~/components/ui/text";

interface AddAreaModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string, address: string) => void;
}

export function AddAreaModal({ visible, onClose, onAdd }: AddAreaModalProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const handleAdd = () => {
    if (name.trim() && address.trim()) {
      onAdd(name.trim(), address.trim());
      setName("");
      setAddress("");
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View
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
            padding: 24,
            paddingBottom: Platform.OS === "ios" ? 44 : 24,
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

          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 28,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "800",
                  color: "#111827",
                  letterSpacing: -0.5,
                  marginBottom: 4,
                }}
              >
                Thêm khu vực mới
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#6B7280",
                  fontWeight: "500",
                }}
              >
                Thêm địa điểm để theo dõi
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 40,
                height: 40,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 20,
                backgroundColor: "#F3F4F6",
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={{ gap: 20, marginBottom: 28 }}>
            <View>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#374151",
                  marginBottom: 10,
                  letterSpacing: 0.3,
                }}
              >
                TÊN KHU VỰC
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="VD: Nhà riêng, Công ty..."
                placeholderTextColor="#9CA3AF"
                style={{
                  height: 54,
                  borderWidth: 2,
                  borderColor: "#E5E7EB",
                  borderRadius: 14,
                  paddingHorizontal: 18,
                  fontSize: 16,
                  color: "#111827",
                  fontWeight: "600",
                  backgroundColor: "#F9FAFB",
                }}
              />
            </View>

            <View>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#374151",
                  marginBottom: 10,
                  letterSpacing: 0.3,
                }}
              >
                ĐỊA CHỈ
              </Text>
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="Nhập địa chỉ chi tiết..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                style={{
                  minHeight: 80,
                  borderWidth: 2,
                  borderColor: "#E5E7EB",
                  borderRadius: 14,
                  paddingHorizontal: 18,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: "#111827",
                  fontWeight: "600",
                  backgroundColor: "#F9FAFB",
                  textAlignVertical: "top",
                }}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                height: 54,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 14,
                backgroundColor: "#F3F4F6",
                borderWidth: 1,
                borderColor: "#E5E7EB",
              }}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#6B7280",
                }}
              >
                Hủy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAdd}
              style={{
                flex: 1,
                height: 54,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 14,
                backgroundColor: "#3B82F6",
                shadowColor: "#3B82F6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "white",
                }}
              >
                Thêm khu vực
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
