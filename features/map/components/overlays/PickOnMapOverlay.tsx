// features/map/components/overlays/PickOnMapOverlay.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
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

  const accentColor = pickingTarget === "origin" ? "#16A34A" : "#4F46E5";

  return (
    <>
      {/* Center pin marker */}
      <View style={styles.pinContainer} pointerEvents="none">
        <View style={{ alignItems: "center", marginBottom: 36 }}>
          <Ionicons name="location-sharp" size={40} color={accentColor} />
          <View style={styles.pinDot} />
        </View>
      </View>

      {/* Bottom confirm card */}
      <View style={styles.card}>
        <Text style={styles.title}>
          {pickingTarget === "origin" ? "Chọn điểm đi" : "Chọn điểm đến"}
        </Text>
        <Text style={styles.hint}>
          Di chuyển bản đồ để đặt vị trí tại điểm ghim
        </Text>
        <View style={styles.buttons}>
          <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onConfirm}
            style={[styles.confirmBtn, { backgroundColor: accentColor }]}
          >
            <Text style={styles.confirmText}>Xác nhận</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  pinContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  pinDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#374151",
    marginTop: -4,
  },
  card: {
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
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 12,
  },
  buttons: {
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  confirmText: {
    fontSize: 14,
    fontWeight: "700",
    color: "white",
  },
});
