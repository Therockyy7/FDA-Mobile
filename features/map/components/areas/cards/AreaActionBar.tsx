// features/map/components/areas/cards/AreaActionBar.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";

interface AreaActionBarProps {
  statusColor: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewDetails?: () => void;
}

export function AreaActionBar({
  statusColor,
  onEdit,
  onDelete,
  onViewDetails,
}: AreaActionBarProps) {
  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      {onEdit && (
        <TouchableOpacity
          onPress={onEdit}
          style={{
            flex: 1,
            backgroundColor: "transparent",
            paddingVertical: 12,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            borderWidth: 1,
            borderColor: "#007AFF",
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="pencil" size={16} color="#007AFF" />
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#007AFF" }}>
            Sửa
          </Text>
        </TouchableOpacity>
      )}

      {onDelete && (
        <TouchableOpacity
          onPress={onDelete}
          style={{
            flex: 1,
            backgroundColor: "transparent",
            paddingVertical: 12,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            borderWidth: 1,
            borderColor: "#EF4444",
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="trash" size={16} color="#EF4444" />
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#EF4444" }}>
            Xóa
          </Text>
        </TouchableOpacity>
      )}

      {onViewDetails && (
        <TouchableOpacity
          onPress={onViewDetails}
          style={{
            flex: 2,
            backgroundColor: statusColor,
            paddingVertical: 12,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 13, fontWeight: "700", color: "white" }}>
            Chi tiết
          </Text>
          <Ionicons name="chevron-forward" size={16} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}
