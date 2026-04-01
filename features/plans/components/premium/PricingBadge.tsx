import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "~/components/ui/text";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: "popular" | "current" | "discount" | "priority";
  style?: ViewStyle;
};

const VARIANT_CONFIG = {
  popular: {
    colors: ["#3B82F6", "#1D4ED8"] as [string, string],
    borderColor: "#60A5FA",
    icon: "star" as const,
  },
  current: {
    colors: ["#10B981", "#059669"] as [string, string],
    borderColor: "#34D399",
    icon: "checkmark-circle" as const,
  },
  discount: {
    colors: ["#F59E0B", "#D97706"] as [string, string],
    borderColor: "#FBBF24",
    icon: "flash" as const,
  },
  priority: {
    colors: ["#8B5CF6", "#6D28D9"] as [string, string],
    borderColor: "#A78BFA",
    icon: "shield" as const,
  },
};

const PricingBadge: React.FC<Props> = ({ label, icon, variant = "popular", style }) => {
  const config = VARIANT_CONFIG[variant];
  const displayIcon = icon || config.icon;

  return (
    <View style={[styles.wrapper, style]}>
      <LinearGradient
        colors={config.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.badge, { borderColor: config.borderColor }]}
      >
        <View style={styles.content}>
          <Ionicons name={displayIcon} size={11} color="#FFFFFF" style={styles.icon} />
          <Text style={styles.text}>{label}</Text>
        </View>
        {/* Inner rim highlight / gloss effect */}
        <View style={styles.highlight} />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    // 3D Shadow effect
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  highlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});

export default PricingBadge;
