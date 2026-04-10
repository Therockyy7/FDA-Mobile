// features/map/components/RouteDetailCard.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import waterRiseAnimation from "~/assets/animations/water-rise.json";
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { FloodRoute } from "~/features/map/constants/map-data";
import { getStatusColor } from "~/features/map/lib/map-utils";
import {
  CARD_SHADOW,
  OVERLAY_SHADOW,
  PULSE_ANIM,
  RADIUS,
  STATUS_BADGE,
  useMapColors,
} from "~/features/map/lib/map-ui-utils";

interface RouteDetailCardProps {
  route: FloodRoute;
  onClose: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; icon: string }> = {
  safe: { label: "AN TOÀN", icon: "checkmark-circle" },
  warning: { label: "CẢNH BÁO", icon: "warning" },
  danger: { label: "NGUY HIỂM", icon: "alert-circle" },
};

function getDirectionIcon(direction: string) {
  switch (direction) {
    case "north": return "arrow-up";
    case "south": return "arrow-down";
    case "east": return "arrow-forward";
    case "west": return "arrow-back";
    default: return "arrow-up";
  }
}

function InfoChip({
  icon,
  label,
  value,
  accentColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accentColor: string;
}) {
  const colors = useMapColors();
  return (
    <View style={[styles.chip, { backgroundColor: colors.background }]}>
      <View style={[styles.chipIcon, { backgroundColor: `${accentColor}18` }]}>
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.chipLabel, { color: colors.muted }]}>{label}</Text>
        <Text style={[styles.chipValue, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );
}

export function RouteDetailCard({ route, onClose }: RouteDetailCardProps) {
  const colors = useMapColors();
  const status = getStatusColor(route.status);
  const statusCfg = STATUS_CONFIG[route.status] ?? STATUS_CONFIG.safe;

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

  const fillPercent = Math.min((route.waterLevel / route.maxLevel) * 100, 100);

  return (
    <Animated.View style={[styles.root, { transform: [{ scale: pulseAnim }] }]}>
      {/* Glass header */}
      <View style={[styles.header, { backgroundColor: status.main }]}>
        {/* Ambient Lottie */}
        <LottieView
          source={waterRiseAnimation}
          style={styles.lottie}
          autoPlay
          loop
          speed={0.6}
        />
        {/* Shimmer overlay */}
        <Animated.View style={styles.shimmer} />

        {/* Header content */}
        <View style={styles.headerContent}>
          <View style={{ flex: 1 }}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIconBox}>
                <MaterialCommunityIcons name="road-variant" size={20} color="white" />
              </View>
              <Text style={styles.headerTitle}>{route.name}</Text>
            </View>
            <Text style={styles.headerSubtitle}>{route.description}</Text>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* Water level hero */}
        <View style={styles.waterLevelBox}>
          <Text style={styles.waterLevelLabel}>ĐỘ SÂU TRUNG BÌNH</Text>
          <View style={styles.waterLevelRow}>
            <Text style={styles.waterLevelValue}>{route.waterLevel}</Text>
            <Text style={styles.waterLevelUnit}>cm</Text>
          </View>
          {/* Progress */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${fillPercent}%`, backgroundColor: "white" }]} />
          </View>
          <View style={styles.waterLevelMeta}>
            <Text style={styles.waterLevelMetaText}>Mức tối đa: {route.maxLevel}cm</Text>
            <Text style={styles.waterLevelMetaText}>{route.flowSpeed} m/s</Text>
          </View>
        </View>
      </View>

      {/* Body */}
      <View style={[styles.body, { backgroundColor: colors.card }]}>
        {/* Status badge */}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: status.bg },
          ]}
        >
          <View style={[styles.statusDot, { backgroundColor: status.main }]} />
          <Ionicons name={statusCfg.icon as any} size={STATUS_BADGE.fontSize + 2} color={status.main} />
          <Text style={[styles.statusBadgeText, { color: status.main }]}>
            {statusCfg.label}
          </Text>
        </View>

        {/* Info chips */}
        <View style={styles.chipsGrid}>
          <InfoChip
            icon={<Ionicons name="resize-outline" size={14} color={status.main} />}
            label="Chiều dài"
            value={`${route.length} km`}
            accentColor={status.main}
          />
          <InfoChip
            icon={<MaterialCommunityIcons name="waves" size={14} color={status.main} />}
            label="Tốc độ dòng"
            value={`${route.flowSpeed} m/s`}
            accentColor={status.main}
          />
          <InfoChip
            icon={<Ionicons name={getDirectionIcon(route.direction) as any} size={14} color={status.main} />}
            label="Hướng chảy"
            value={
              route.direction === "north" ? "Bắc"
              : route.direction === "south" ? "Nam"
              : route.direction === "east" ? "Đông"
              : "Tây"
            }
            accentColor={status.main}
          />
          <InfoChip
            icon={<Ionicons name="time-outline" size={14} color={status.main} />}
            label="Cập nhật"
            value="2 phút trước"
            accentColor={status.main}
          />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: "hidden" },
  header: {
    padding: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
  },
  lottie: {
    position: "absolute",
    bottom: -24,
    right: -24,
    width: 180,
    height: 180,
    opacity: 0.15,
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "white",
    opacity: 0,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  headerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  waterLevelBox: {
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  waterLevelLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 1.5,
    marginBottom: 4,
    textAlign: "center",
  },
  waterLevelRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
  },
  waterLevelValue: {
    fontSize: 52,
    fontWeight: "900",
    color: "white",
    lineHeight: 56,
  },
  waterLevelUnit: {
    fontSize: 20,
    fontWeight: "700",
    color: "rgba(255,255,255,0.9)",
    marginLeft: 6,
  },
  progressTrack: {
    height: 5,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 3,
    marginTop: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  waterLevelMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  waterLevelMetaText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
  },
  body: {
    padding: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    gap: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: STATUS_BADGE.paddingHorizontal,
    paddingVertical: STATUS_BADGE.paddingVertical,
    borderRadius: STATUS_BADGE.borderRadius,
    gap: 5,
  },
  statusDot: {
    width: STATUS_BADGE.dotSize,
    height: STATUS_BADGE.dotSize,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: STATUS_BADGE.fontSize,
    fontWeight: STATUS_BADGE.fontWeight,
    letterSpacing: STATUS_BADGE.letterSpacing,
  },
  chipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flex: 1,
    minWidth: "47%",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: RADIUS.chip,
    gap: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  chipIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  chipLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginBottom: 1,
  },
  chipValue: {
    fontSize: 13,
    fontWeight: "800",
  },
});