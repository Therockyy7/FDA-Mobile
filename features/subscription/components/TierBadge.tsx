import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import type { TierCode } from "../types/subscription.types";

type TierBadgeSize = "sm" | "md";

const tierConfig: Record<
  TierCode,
  { label: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  FREE: {
    label: "Free",
    icon: "leaf-outline",
  },
  PREMIUM: {
    label: "Premium",
    icon: "diamond-outline",
  },
  MONITOR: {
    label: "Monitor",
    icon: "shield-checkmark-outline",
  },
};

const TierBadge: React.FC<{ tier: TierCode; size?: TierBadgeSize }> = ({
  tier,
  size = "md",
}) => {
  const { isDarkColorScheme } = useColorScheme();
  const config = tierConfig[tier];
  const sizeConfig =
    size === "sm"
      ? { paddingX: 8, paddingY: 3, fontSize: 11, iconSize: 12 }
      : { paddingX: 10, paddingY: 5, fontSize: 12, iconSize: 14 };
  const colors = {
    bg: isDarkColorScheme ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.12)",
    text: isDarkColorScheme ? "#E2E8F0" : "#1F2937",
    border: isDarkColorScheme ? "rgba(148, 163, 184, 0.4)" : "rgba(148, 163, 184, 0.6)",
    icon: isDarkColorScheme ? "#93C5FD" : "#3B82F6",
  };

  return (
    <View
      style={{
        paddingHorizontal: sizeConfig.paddingX,
        paddingVertical: sizeConfig.paddingY,
        borderRadius: 999,
        backgroundColor: colors.bg,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        alignSelf: "flex-start",
      }}
    >
      <Ionicons name={config.icon} size={sizeConfig.iconSize} color={colors.icon} />
      <Text
        style={{
          fontSize: sizeConfig.fontSize,
          fontWeight: "700",
          color: colors.text,
        }}
      >
        {config.label}
      </Text>
    </View>
  );
};

export default TierBadge;
