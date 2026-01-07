// features/map/components/Legend.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";

const Legend = () => {
  return (
    <View
      style={{
        position: "absolute",
        top: 80,
        left: 16,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
        minWidth: 160,
        borderWidth: 1,
        borderColor: "#E2E8F0",
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            backgroundColor: "#EFF6FF",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 8,
          }}
        >
          <MaterialCommunityIcons name="water" size={16} color="#3B82F6" />
        </View>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "800",
            color: "#1E293B",
          }}
        >
          Mức độ ngập
        </Text>
      </View>

      <View style={{ gap: 10 }}>
        {/* Safe Level */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              backgroundColor: "#ECFDF5",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
              borderWidth: 1.5,
              borderColor: "#10B981",
            }}
          >
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          </View>
          <View>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: "#10B981",
              }}
            >
              An toàn
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: "#64748B",
              }}
            >
              {"< 35cm"}
            </Text>
          </View>
        </View>

        {/* Warning Level */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              backgroundColor: "#FFFBEB",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
              borderWidth: 1.5,
              borderColor: "#F59E0B",
            }}
          >
            <Ionicons name="alert-circle" size={16} color="#F59E0B" />
          </View>
          <View>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: "#D97706",
              }}
            >
              Cảnh báo
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: "#64748B",
              }}
            >
              35 - 50cm
            </Text>
          </View>
        </View>

        {/* Danger Level */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              backgroundColor: "#FEF2F2",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
              borderWidth: 1.5,
              borderColor: "#EF4444",
            }}
          >
            <Ionicons name="warning" size={16} color="#EF4444" />
          </View>
          <View>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: "#DC2626",
              }}
            >
              Nguy hiểm
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: "#64748B",
              }}
            >
              {"> 50cm"}
            </Text>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View
        style={{
          height: 1,
          backgroundColor: "#E2E8F0",
          marginVertical: 12,
        }}
      />

      {/* Tips */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name="finger-print-outline" size={12} color="#94A3B8" />
        <Text
          style={{
            fontSize: 10,
            color: "#94A3B8",
            marginLeft: 6,
          }}
        >
          Nhấn vào vùng để xem chi tiết
        </Text>
      </View>
    </View>
  );
};

export default Legend;
