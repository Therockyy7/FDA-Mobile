// features/map/components/areas/cards/AreaActionBar.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { RADIUS } from "~/features/map/lib/map-ui-utils";

interface AreaActionBarProps {
  statusColor: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewDetails?: () => void;
}

export function AreaActionBar({ statusColor, onEdit, onDelete, onViewDetails }: AreaActionBarProps) {
  return (
    <View style={styles.row}>
      {onEdit && (
        <TouchableOpacity onPress={onEdit} style={[styles.btn, styles.outlineBtn]} activeOpacity={0.75}>
          <Ionicons name="pencil" size={14} color="#3B82F6" />
          <Text style={styles.outlineText}>Sửa</Text>
        </TouchableOpacity>
      )}
      {onDelete && (
        <TouchableOpacity onPress={onDelete} style={[styles.btn, styles.outlineBtn]} activeOpacity={0.75}>
          <Ionicons name="trash" size={14} color="#EF4444" />
          <Text style={styles.outlineText}>Xóa</Text>
        </TouchableOpacity>
      )}
      {onViewDetails && (
        <TouchableOpacity onPress={onViewDetails} style={[styles.btn, { backgroundColor: statusColor }]} activeOpacity={0.75}>
          <Text style={styles.fillText}>Chi tiết</Text>
          <Ionicons name="chevron-forward" size={14} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
  },
  btn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: RADIUS.button,
    gap: 5,
  },
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "transparent",
  },
  outlineText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },
  fillText: {
    fontSize: 13,
    fontWeight: "700",
    color: "white",
  },
});