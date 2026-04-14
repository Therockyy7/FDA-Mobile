// features/map/components/areas/cards/AreaActionBar.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useMapColors } from "~/features/map/lib/map-ui-utils";
import { FLOOD_COLORS, RADIUS } from "~/lib/design-tokens";

interface AreaActionBarProps {
  statusColor: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewDetails?: () => void;
}

export function AreaActionBar({ statusColor, onEdit, onDelete, onViewDetails }: AreaActionBarProps) {
  const colors = useMapColors();
  return (
    <View testID="map-area-action-bar" style={styles.row}>
      {onEdit && (
        <TouchableOpacity
          onPress={onEdit}
          style={[styles.btn, styles.outlineBtn, { borderColor: colors.border }]}
          activeOpacity={0.75}
          testID="map-area-action-edit-btn"
        >
          <Ionicons name="pencil" size={14} color={colors.accent} />
          <Text style={[styles.outlineText, { color: colors.subtext }]}>Sửa</Text>
        </TouchableOpacity>
      )}
      {onDelete && (
        <TouchableOpacity
          onPress={onDelete}
          style={[styles.btn, styles.outlineBtn, { borderColor: colors.border }]}
          activeOpacity={0.75}
          testID="map-area-action-delete-btn"
        >
          <Ionicons name="trash" size={14} color={FLOOD_COLORS.danger} />
          <Text style={[styles.outlineText, { color: colors.subtext }]}>Xóa</Text>
        </TouchableOpacity>
      )}
      {onViewDetails && (
        <TouchableOpacity
          onPress={onViewDetails}
          style={[styles.btn, { backgroundColor: statusColor }]}
          activeOpacity={0.75}
          testID="map-area-action-details-btn"
        >
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
    backgroundColor: "transparent",
  },
  outlineText: {
    fontSize: 13,
    fontWeight: "700",
  },
  fillText: {
    fontSize: 13,
    fontWeight: "700",
    color: "white",
  },
});