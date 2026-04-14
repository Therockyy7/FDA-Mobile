// features/map/components/FloodZoneCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import waterRiseAnimation from "~/assets/animations/water-rise.json";
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { FloodZone } from "~/features/map/constants/map-data";
import { getStatusColor } from "~/features/map/lib/map-utils";
import {
  PULSE_ANIM,
  STATUS_BADGE,
  useMapColors,
} from "~/features/map/lib/map-ui-utils";
import { RADIUS, SHADOW } from "~/lib/design-tokens";

interface FloodZoneCardProps {
  zone: FloodZone;
  slideAnim: Animated.Value;
  onClose: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; icon: string }> = {
  safe: { label: "AN TOÀN", icon: "checkmark-circle" },
  warning: { label: "CẢNH BÁO", icon: "warning" },
  danger: { label: "NGUY HIỂM", icon: "alert-circle" },
};

export function FloodZoneCard({ zone, slideAnim, onClose }: FloodZoneCardProps) {
  const colors = useMapColors();
  const status = getStatusColor(zone.status);
  const statusCfg = STATUS_CONFIG[zone.status] ?? STATUS_CONFIG.safe;

  // Pulse animation for warning/danger
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (zone.status === "warning" || zone.status === "danger") {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: PULSE_ANIM.scaleTo,
            duration: PULSE_ANIM.duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: PULSE_ANIM.duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [zone.status, pulseAnim]);

  // Animated shimmer for ambient effect
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmerAnim]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.15, 0],
  });

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
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <View
          style={[
            SHADOW.sm,
            {
              backgroundColor: colors.card,
              borderRadius: RADIUS.card,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Gradient Header */}
          <LinearGradient
            colors={[status.main, status.text]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1.2, y: 1.2 }}
            style={{ padding: 20, paddingBottom: 20 }}
          >
            {/* Shimmer overlay */}
            <Animated.View
              style={{
                position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: "white",
                opacity: shimmerOpacity,
              }}
            />

            {/* Lottie ambient */}
            <LottieView
              source={waterRiseAnimation}
              style={{
                position: "absolute",
                bottom: -20,
                right: -20,
                width: 160,
                height: 160,
                opacity: 0.15,
              }}
              autoPlay
              loop
              speed={0.6}
            />

            {/* Header Row */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <View style={{ flex: 1 }}>
                {/* Station icon + name */}
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6, gap: 8 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: "rgba(255,255,255,0.2)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="water" size={20} color="white" />
                  </View>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "800",
                      color: "white",
                    }}
                  >
                    {zone.name}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Ionicons name="location" size={12} color="rgba(255,255,255,0.8)" />
                  <Text style={{ fontSize: 12, fontWeight: "500", color: "rgba(255,255,255,0.8)" }}>
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
                <Ionicons name="close" size={18} color="white" />
              </TouchableOpacity>
            </View>

            {/* Water Level Display — compact hero */}
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 16,
                padding: 14,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.25)",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "700",
                    color: "rgba(255,255,255,0.8)",
                    letterSpacing: 1,
                    marginBottom: 2,
                  }}
                >
                  MỰC NƯỚC HIỆN TẠI
                </Text>
                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
                  <Text
                    style={{
                      fontSize: 42,
                      fontWeight: "900",
                      color: "white",
                      lineHeight: 46,
                    }}
                  >
                    {zone.waterLevel}
                  </Text>
                  <Text style={{ fontSize: 18, fontWeight: "600", color: "rgba(255,255,255,0.9)" }}>
                    cm
                  </Text>
                </View>
              </View>

              {/* Mini trend indicator */}
              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 4,
                  }}
                >
                  <Ionicons name="trending-up" size={20} color="white" />
                </View>
                <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", fontWeight: "600" }}>
                  +2.1 cm/h
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Content Body */}
          <View style={{ padding: 16 }}>
            {/* Status + meta row */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              {/* Status Badge */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: status.bg,
                  paddingHorizontal: STATUS_BADGE.paddingHorizontal,
                  paddingVertical: STATUS_BADGE.paddingVertical,
                  borderRadius: STATUS_BADGE.borderRadius,
                  gap: 5,
                }}
              >
                <View
                  style={{
                    width: STATUS_BADGE.dotSize,
                    height: STATUS_BADGE.dotSize,
                    borderRadius: 3,
                    backgroundColor: status.main,
                  }}
                />
                <Ionicons name={statusCfg.icon as any} size={STATUS_BADGE.fontSize + 2} color={status.main} />
                <Text
                  style={{
                    fontSize: STATUS_BADGE.fontSize,
                    fontWeight: STATUS_BADGE.fontWeight,
                    color: status.main,
                    letterSpacing: STATUS_BADGE.letterSpacing,
                  }}
                >
                  {statusCfg.label}
                </Text>
              </View>

              {/* Update time */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Ionicons name="time-outline" size={12} color={colors.muted} />
                <Text style={{ fontSize: 11, color: colors.muted, fontWeight: "500" }}>
                  Cập nhật 2 phút trước
                </Text>
              </View>
            </View>

            {/* Stats Row */}
            <View
              style={{
                flexDirection: "row",
                gap: 10,
              }}
            >
              {[
                { icon: "speedometer-outline", label: "Tốc độ dâng", value: "0.5 cm/h", color: "#F59E0B" },
                { icon: "people-outline", label: "Dân số ảnh hưởng", value: "~12K", color: "#8B5CF6" },
                { icon: "warning-outline", label: "Cảnh báo", value: "3 vùng", color: "#EF4444" },
              ].map((item) => (
                <View
                  key={item.label}
                  style={{
                    flex: 1,
                    backgroundColor: colors.background,
                    borderRadius: 12,
                    padding: 12,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: `${item.color}15`,
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 6,
                    }}
                  >
                    <Ionicons name={item.icon as any} size={16} color={item.color} />
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: "800", color: colors.text }}>
                    {item.value}
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2, textAlign: "center" }}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}
