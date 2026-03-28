import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";

interface PickOnMapOverlayProps {
  visible: boolean;
  pickingTarget: "origin" | "destination" | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PickOnMapOverlay({
  visible,
  pickingTarget,
  onConfirm,
  onCancel,
}: PickOnMapOverlayProps) {
  if (!visible) return null;

  return (
    <>
      {/* Center pin marker */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View style={{ alignItems: "center", marginBottom: 36 }}>
          <Ionicons
            name="location-sharp"
            size={40}
            color={pickingTarget === "origin" ? "#16A34A" : "#4F46E5"}
          />
          <View
            style={{
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: "#374151",
              marginTop: -4,
            }}
          />
        </View>
      </View>

      {/* Bottom confirm card */}
      <View
        style={{
          position: "absolute",
          bottom: 24,
          left: 16,
          right: 16,
          zIndex: 50,
          backgroundColor: "white",
          borderRadius: 16,
          padding: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: "#374151",
            marginBottom: 4,
          }}
        >
          {pickingTarget === "origin" ? "Chọn điểm đi" : "Chọn điểm đến"}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: "#9CA3AF",
            marginBottom: 12,
          }}
        >
          Di chuyển bản đồ để đặt vị trí tại điểm ghim
        </Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            onPress={onCancel}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 999,
              backgroundColor: "#F3F4F6",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Hủy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onConfirm}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 999,
              backgroundColor:
                pickingTarget === "origin" ? "#16A34A" : "#4F46E5",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: "white",
              }}
            >
              Xác nhận
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
