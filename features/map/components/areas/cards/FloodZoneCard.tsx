// features/map/components/FloodZoneCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import waterRiseAnimation from "~/assets/animations/water-rise.json";
import { Animated, Easing, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { FloodZone } from "~/features/map/constants/map-data";
import { getStatusColor } from "~/features/map/lib/map-utils";
import {
  CARD_SHADOW,
  PULSE_ANIM,
  RADIUS,
  STATUS_BADGE,
  useMapColors,
} from "~/features/map/lib/map-ui-utils";

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
            CARD_SHADOW,
            {
              backgroundColor: colors.card,
              borderRadius: RADIUS.card,
              overflow: "hidden",
            },
          ]}
        >
          {/* Gradient Header with Lottie ambient */}
          <LinearGradient
            colors={[status.main, status.text]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 20, paddingBottom: 24 }}
          >
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
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Ionicons name="location" size={14} color="rgba(255,255,255,0.9)" />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: "rgba(255,255,255,0.9)",
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
                  letterSpacing: 1,
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
                    lineHeight: 52,
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
            {/* Status Badge — standard pattern */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                alignSelf: "flex-start",
                backgroundColor: status.bg,
                paddingHorizontal: STATUS_BADGE.paddingHorizontal,
                paddingVertical: STATUS_BADGE.paddingVertical,
                borderRadius: STATUS_BADGE.borderRadius,
                marginBottom: 16,
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
              <Ionicons
                name={statusCfg.icon as any}
                size={STATUS_BADGE.fontSize + 2}
                color={status.main}
              />
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

            {/* Info Grid */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: colors.border,
              }}
            >
              <View style={{ alignItems: "center" }}>
                <Ionicons name="speedometer-outline" size={24} color={colors.accent} />
                <Text style={{ fontSize: 11, color: colors.muted, marginTop: 6, marginBottom: 4 }}>
                  Tốc độ dâng
                </Text>
                <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>
                  0.5 cm/h
                </Text>
              </View>

              <View style={{ width: 1, backgroundColor: colors.border }} />

              <View style={{ alignItems: "center" }}>
                <Ionicons name="time-outline" size={24} color="#10B981" />
                <Text style={{ fontSize: 11, color: colors.muted, marginTop: 6, marginBottom: 4 }}>
                  Cập nhật
                </Text>
                <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>
                  2 phút trước
                </Text>
              </View>

              <View style={{ width: 1, backgroundColor: colors.border }} />

              <View style={{ alignItems: "center" }}>
                <Ionicons name="people-outline" size={24} color="#F59E0B" />
                <Text style={{ fontSize: 11, color: colors.muted, marginTop: 6, marginBottom: 4 }}>
                  Dân số
                </Text>
                <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>
                  ~12K
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}
