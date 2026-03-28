// features/map/components/areas/cards/AreaHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";

interface AreaHeaderProps {
  name: string;
  addressText?: string;
  statusColor: string;
  statusLabel: string;
  statusIcon: string;
  onClose: () => void;
}

export function AreaHeader({
  name,
  addressText,
  statusColor,
  statusLabel,
  statusIcon,
  onClose,
}: AreaHeaderProps) {
  return (
    <LinearGradient
      colors={[statusColor, `${statusColor}CC`]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ padding: 16 }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <View style={{ flex: 1 }}>
          {/* Status Badge */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.25)",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 20,
              alignSelf: "flex-start",
              marginBottom: 8,
              gap: 4,
            }}
          >
            <Ionicons name={statusIcon as any} size={14} color="white" />
            <Text style={{ fontSize: 12, fontWeight: "700", color: "white" }}>
              {statusLabel}
            </Text>
          </View>

          {/* Area Name */}
          <Text
            style={{
              fontSize: 18,
              fontWeight: "800",
              color: "white",
              marginBottom: 4,
            }}
            numberOfLines={1}
          >
            {name}
          </Text>

          {/* Address */}
          {addressText && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Ionicons name="location" size={12} color="rgba(255,255,255,0.9)" />
              <Text
                style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", flex: 1 }}
                numberOfLines={1}
              >
                {addressText}
              </Text>
            </View>
          )}
        </View>

        {/* Close Button */}
        <TouchableOpacity
          onPress={onClose}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "rgba(255,255,255,0.2)",
            alignItems: "center",
            justifyContent: "center",
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
