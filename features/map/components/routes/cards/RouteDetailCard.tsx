// features/map/components/RouteDetailCard.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import waterRiseAnimation from "~/assets/animations/water-rise.json";
import { Animated, Easing, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { FloodRoute } from "~/features/map/constants/map-data";
import { getStatusColor } from "~/features/map/lib/map-utils";
import {
  PULSE_ANIM,
  STATUS_BADGE,
  useMapColors,
} from "~/features/map/lib/map-ui-utils";
import { RADIUS, SHADOW } from "~/lib/design-tokens";

interface RouteDetailCardProps {
  route: FloodRoute;
  onClose: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; icon: string }> = {
  safe: { label: "AN TOÀN", icon: "checkmark-circle" },
  warning: { label: "CẢNH BÁO", icon: "warning" },
  danger: { label: "NGUY HIỂM", icon: "alert-circle" },
};

const DARK_BG_GRID = "#1A2540";
const LIGHT_BG_GRID = "#F9FAFB";

function getDirectionIcon(direction: string) {
  switch (direction) {
    case "north":
      return "arrow-up";
    case "south":
      return "arrow-down";
    case "east":
      return "arrow-forward";
    case "west":
      return "arrow-back";
    default:
      return "arrow-up";
  }
}

function GridItem({
  icon,
  label,
  value,
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bgColor: string;
  iconColor?: string;
}) {
  const colors = useMapColors();
  return (
    <View
      style={{
        flex: 1,
        minWidth: "45%",
        backgroundColor: bgColor,
        padding: 12,
        borderRadius: RADIUS.chip,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 6,
          gap: 6,
        }}
      >
        {icon}
        <Text style={{ fontSize: 11, color: colors.muted }}>{label}</Text>
      </View>
      <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>
        {value}
      </Text>
    </View>
  );
}

export const RouteDetailCard = React.memo(function RouteDetailCard({
  route,
  onClose,
}: RouteDetailCardProps) {
  const colors = useMapColors();
  const status = getStatusColor(route.status);
  const statusCfg = STATUS_CONFIG[route.status] ?? STATUS_CONFIG.safe;
  const gridBg = colors.background === "#0F172A" ? DARK_BG_GRID : LIGHT_BG_GRID;

  // Pulse animation for warning/danger
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (route.status === "warning" || route.status === "danger") {
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
  }, [route.status, pulseAnim]);

  return (
    <Animated.View
      style={{ flex: 1, transform: [{ scale: pulseAnim }] }}
      testID="map-route-card"
    >
      {/* Gradient Header */}
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 6,
                gap: 8,
              }}
            >
              <MaterialCommunityIcons
                name="road-variant"
                size={24}
                color="white"
              />
              <Text style={{ fontSize: 20, fontWeight: "800", color: "white" }}>
                {route.name}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "rgba(255,255,255,0.9)",
              }}
            >
              {route.description}
            </Text>
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
            ĐỘ SÂU NƯỚC TRUNG BÌNH
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
              {route.waterLevel}
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

          {/* Progress Bar */}
          <View
            style={{
              height: 6,
              backgroundColor: "rgba(0,0,0,0.2)",
              borderRadius: 3,
              marginTop: 12,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: `${Math.min((route.waterLevel / route.maxLevel) * 100, 100)}%`,
                height: "100%",
                backgroundColor: "white",
                borderRadius: 3,
              }}
            />
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <View
        style={[
          { padding: 20 },
          SHADOW.md,
          { backgroundColor: colors.card, borderRadius: RADIUS.card },
        ]}
      >
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
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          <GridItem
            icon={
              <Ionicons
                name="resize-outline"
                size={18}
                color={colors.subtext}
              />
            }
            label="Chiều dài"
            value={`${route.length} km`}
            bgColor={gridBg}
          />
          <GridItem
            icon={
              <MaterialCommunityIcons
                name="waves"
                size={18}
                color={colors.subtext}
              />
            }
            label="Tốc độ dòng"
            value={`${route.flowSpeed} m/s`}
            bgColor={gridBg}
          />
          <GridItem
            icon={
              <Ionicons
                name={getDirectionIcon(route.direction) as any}
                size={18}
                color={colors.subtext}
              />
            }
            label="Hướng chảy"
            value={
              route.direction === "north"
                ? "Bắc"
                : route.direction === "south"
                  ? "Nam"
                  : route.direction === "east"
                    ? "Đông"
                    : "Tây"
            }
            bgColor={gridBg}
          />
          <GridItem
            icon={
              <Ionicons name="time-outline" size={18} color={colors.subtext} />
            }
            label="Cập nhật"
            value="2 phút trước"
            bgColor={gridBg}
          />
        </View>
      </View>
    </Animated.View>
  );
});
