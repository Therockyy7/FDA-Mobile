// features/map/components/areas/components/AdminAreaConfirmModal.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { MAP_COLORS, SHADOW } from "~/lib/design-tokens";
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
  const palette = isDarkColorScheme ? MAP_COLORS.dark : MAP_COLORS.light;

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
        testID="map-area-modal"
        style={[
          SHADOW.lg,
          {
            backgroundColor: palette.card,
            borderRadius: 24,
            padding: 24,
            marginHorizontal: 20,
            width: "90%",
            maxWidth: 400,
            borderWidth: 1,
            borderColor: palette.border,
          },
        ]}
      >
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: `${palette.accent}20`,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Ionicons name="analytics" size={32} color={palette.accent} />
          </View>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: palette.text,
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            Xem Dự báo AI
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: palette.subtext,
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            Bạn có muốn xem phân tích rủi ro ngập lụt của AI cho khu vực{" "}
            <Text style={{ fontWeight: "700", color: palette.accent }}>
              {adminArea?.name ?? "Khu vực"}
            </Text>
            ?
          </Text>
        </View>

        <View style={{ gap: 12 }}>
          <TouchableOpacity
            testID="map-area-modal-confirm-btn"
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
              backgroundColor: palette.accent,
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
            testID="map-area-modal-cancel-btn"
            onPress={onClose}
            style={{
              backgroundColor: isDarkColorScheme ? palette.muted : palette.background,
              borderRadius: 16,
              padding: 16,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: palette.subtext,
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
