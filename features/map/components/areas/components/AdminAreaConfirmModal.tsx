// features/map/components/areas/components/AdminAreaConfirmModal.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { CARD_SHADOW } from "~/features/map/lib/map-ui-utils";
import type { AdminArea } from "~/features/areas/types/admin-area.types";

interface AdminAreaConfirmModalProps {
  visible: boolean;
  adminArea: AdminArea | null;
  onClose: () => void;
}

export function AdminAreaConfirmModal({
  visible,
  adminArea,
  onClose,
}: AdminAreaConfirmModalProps) {
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();
  const isDark = isDarkColorScheme;

  if (!visible || !adminArea) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <View
        style={{
          backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
          borderRadius: 24,
          padding: 24,
          marginHorizontal: 20,
          width: "90%",
          maxWidth: 400,
          ...CARD_SHADOW,
          borderWidth: 1,
          borderColor: isDark ? "#334155" : "#E2E8F0",
        }}
      >
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: "#3B82F620",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Ionicons name="analytics" size={32} color="#3B82F6" />
          </View>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: isDark ? "#F1F5F9" : "#1F2937",
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            Xem Dự báo AI
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: isDark ? "#94A3B8" : "#64748B",
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            Bạn có muốn xem phân tích rủi ro ngập lụt của AI cho khu vực{" "}
            <Text style={{ fontWeight: "700", color: "#3B82F6" }}>
              {adminArea.name}
            </Text>
            ?
          </Text>
        </View>

        <View style={{ gap: 12 }}>
          <TouchableOpacity
            onPress={() => {
              onClose();
              router.push({
                pathname: "/prediction/[id]",
                params: {
                  id: adminArea.id,
                  name: adminArea.name,
                },
              });
            }}
            style={{
              backgroundColor: "#3B82F6",
              borderRadius: 16,
              padding: 16,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              Xem Dự báo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: isDark ? "#334155" : "#F1F5F9",
              borderRadius: 16,
              padding: 16,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: isDark ? "#F1F5F9" : "#64748B",
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Hủy
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
