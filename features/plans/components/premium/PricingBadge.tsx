import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Text } from "~/components/ui/text";

type Props = {
  label: string;
  variant?: "popular" | "current" | "discount" | "priority";
  style?: ViewStyle;
};

const VARIANT_CONFIG = {
  popular: {
    bg: "rgba(249, 115, 22, 0.1)",
    text: "#F97316",
    border: "rgba(249, 115, 22, 0.25)",
  },
  current: {
    bg: "rgba(16, 185, 129, 0.1)",
    text: "#10B981",
    border: "rgba(16, 185, 129, 0.25)",
  },
  discount: {
    bg: "rgba(16, 185, 129, 0.1)",
    text: "#10B981",
    border: "rgba(16, 185, 129, 0.25)",
  },
  priority: {
    bg: "rgba(249, 115, 22, 0.1)",
    text: "#F97316",
    border: "rgba(249, 115, 22, 0.25)",
  },
};

const PricingBadge: React.FC<Props> = ({ label, variant = "popular", style }) => {
  const config = VARIANT_CONFIG[variant];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: config.text },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  text: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});

export default PricingBadge;
