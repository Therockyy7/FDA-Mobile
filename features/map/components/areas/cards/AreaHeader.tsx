// features/map/components/areas/cards/AreaHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { RADIUS, STATUS_BADGE } from "~/features/map/lib/map-ui-utils";

interface AreaHeaderProps {
  name: string;
  addressText?: string;
  statusColor: string;
  statusLabel: string;
  statusIcon: string;
  onClose: () => void;
}

export function AreaHeader({ name, addressText, statusColor, statusLabel, statusIcon, onClose }: AreaHeaderProps) {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmer, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);
  const shimmerOpacity = shimmer.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.1, 0] });

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={[statusColor, `${statusColor}CC`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1.2, y: 1 }}
        style={styles.gradient}
      >
        <Animated.View style={[styles.shimmer, { opacity: shimmerOpacity }]} />

        <View style={styles.row}>
          <View style={styles.content}>
            {/* Status badge */}
            <View style={styles.badge}>
              <View style={styles.badgeDot} />
              <Ionicons name={statusIcon as any} size={11} color="white" />
              <Text style={styles.badgeText}>{statusLabel}</Text>
            </View>

            {/* Name + address */}
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            {addressText && (
              <View style={styles.addressRow}>
                <Ionicons name="location" size={10} color="rgba(255,255,255,0.75)" />
                <Text style={styles.address} numberOfLines={1}>{addressText}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
    borderTopLeftRadius: RADIUS.sheet,
    borderTopRightRadius: RADIUS.sheet,
  },
  gradient: {
    padding: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "white",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: STATUS_BADGE.borderRadius,
    paddingHorizontal: STATUS_BADGE.paddingHorizontal,
    paddingVertical: STATUS_BADGE.paddingVertical,
    gap: 4,
  },
  badgeDot: {
    width: STATUS_BADGE.dotSize,
    height: STATUS_BADGE.dotSize,
    borderRadius: 3,
    backgroundColor: "white",
  },
  badgeText: {
    fontSize: STATUS_BADGE.fontSize,
    fontWeight: STATUS_BADGE.fontWeight,
    color: "white",
    letterSpacing: STATUS_BADGE.letterSpacing,
  },
  name: {
    fontSize: 17,
    fontWeight: "800",
    color: "white",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  address: {
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
    flex: 1,
    fontWeight: "500",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});