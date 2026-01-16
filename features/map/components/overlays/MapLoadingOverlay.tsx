// features/map/components/MapLoadingOverlay.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { Text } from "~/components/ui/text";

interface MapLoadingOverlayProps {
  visible: boolean;
}

export function MapLoadingOverlay({ visible }: MapLoadingOverlayProps) {
  if (!visible) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      {/* Animated Background Circles */}
      <View
        style={{
          position: "absolute",
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: "rgba(59, 130, 246, 0.1)",
        }}
      />
      <View
        style={{
          position: "absolute",
          width: 150,
          height: 150,
          borderRadius: 75,
          backgroundColor: "rgba(59, 130, 246, 0.15)",
        }}
      />

      {/* Main Content */}
      <View
        style={{
          width: 100,
          height: 100,
          borderRadius: 24,
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <View
          style={{
            width: 70,
            height: 70,
            borderRadius: 20,
            backgroundColor: "#3B82F6",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="map" size={32} color="white" />
        </View>
      </View>

      <ActivityIndicator size="large" color="#3B82F6" style={{ marginBottom: 16 }} />

      <Text
        style={{
          color: "white",
          fontSize: 18,
          fontWeight: "700",
          marginBottom: 6,
        }}
      >
        Đang tải bản đồ
      </Text>
      <Text
        style={{
          color: "#94A3B8",
          fontSize: 14,
          fontWeight: "500",
        }}
      >
        Flood Monitoring System
      </Text>
    </View>
  );
}
