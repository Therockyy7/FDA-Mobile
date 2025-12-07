// features/map/components/FloodZoneCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Animated, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "~/components/ui/text";
import { FloodZone } from "../constants/map-data";
import { getStatusColor } from "../lib/map-utils";

interface FloodZoneCardProps {
  zone: FloodZone;
  slideAnim: Animated.Value;
  onClose: () => void;
}

export function FloodZoneCard({ zone, slideAnim, onClose }: FloodZoneCardProps) {
  const colors = getStatusColor(zone.status);

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: 16,
        left: 16,
        right: 16,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 24,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.25,
          shadowRadius: 20,
          elevation: 16,
          overflow: "hidden",
        }}
      >
        {/* Gradient Header */}
        <LinearGradient
          colors={[colors.main, colors.text]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            padding: 20,
            paddingBottom: 24,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: "white",
                  marginBottom: 4,
                }}
              >
                {zone.name}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Ionicons name="location" size={14} color="rgba(255,255,255,0.9)" />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: "rgba(255,255,255,0.9)",
                    marginLeft: 4,
                  }}
                >
                  Diện tích: {zone.affectedArea}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Water Level Display */}
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.25)",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.3)",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: "rgba(255,255,255,0.9)",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              MỰC NƯỚC TRUNG BÌNH
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "baseline",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 48,
                  fontWeight: "900",
                  color: "white",
                  lineHeight: 48,
                }}
              >
                {zone.waterLevel}
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: "white",
                  marginLeft: 6,
                }}
              >
                cm
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Content */}
        <View style={{ padding: 20 }}>
          {/* Status Badge */}
          <View
            style={{
              alignSelf: "flex-start",
              backgroundColor: colors.bg,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 12,
              marginBottom: 16,
              borderWidth: 1.5,
              borderColor: colors.main,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "800",
                color: colors.main,
              }}
            >
              {zone.status === "safe"
                ? "✓ AN TOÀN"
                : zone.status === "warning"
                  ? "⚠ CẢNH BÁO"
                  : "⛔ NGUY HIỂM"}
            </Text>
          </View>

          {/* Info Grid */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: "#E5E7EB",
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Ionicons name="speedometer-outline" size={24} color="#3B82F6" />
              <Text
                style={{
                  fontSize: 11,
                  color: "#9CA3AF",
                  marginTop: 6,
                  marginBottom: 4,
                }}
              >
                Tốc độ dâng
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "800",
                  color: "#1F2937",
                }}
              >
                0.5 cm/h
              </Text>
            </View>

            <View
              style={{
                width: 1,
                backgroundColor: "#E5E7EB",
              }}
            />

            <View style={{ alignItems: "center" }}>
              <Ionicons name="time-outline" size={24} color="#10B981" />
              <Text
                style={{
                  fontSize: 11,
                  color: "#9CA3AF",
                  marginTop: 6,
                  marginBottom: 4,
                }}
              >
                Cập nhật
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "800",
                  color: "#1F2937",
                }}
              >
                2 phút trước
              </Text>
            </View>

            <View
              style={{
                width: 1,
                backgroundColor: "#E5E7EB",
              }}
            />

            <View style={{ alignItems: "center" }}>
              <Ionicons name="people-outline" size={24} color="#F59E0B" />
              <Text
                style={{
                  fontSize: 11,
                  color: "#9CA3AF",
                  marginTop: 6,
                  marginBottom: 4,
                }}
              >
                Dân số
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "800",
                  color: "#1F2937",
                }}
              >
                ~12K
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
