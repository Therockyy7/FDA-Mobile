// features/plans/components/BillingToggle.tsx
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

type BillingCycle = "monthly" | "yearly";

type Props = {
  value: BillingCycle;
  onChange: (v: BillingCycle) => void;
};

const BillingToggle: React.FC<Props> = ({ value, onChange }) => {
  const { isDarkColorScheme } = useColorScheme();

  const colors = {
    toggleBg: isDarkColorScheme ? "#1E293B" : "#E5E7EB",
    activeBg: "#007AFF",
    activeText: "#FFFFFF",
    inactiveText: isDarkColorScheme ? "#94A3B8" : "#6B7280",
    badgeBg: isDarkColorScheme ? "#1E3A5F" : "#D5E3FF",
    badgeText: isDarkColorScheme ? "#90CDFD" : "#325f9c",
  };

  return (
    <View style={{ alignItems: "center", gap: 12 }}>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: colors.toggleBg,
          borderRadius: 999,
          padding: 4,
        }}
      >
        <TouchableOpacity
          style={{
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 999,
            backgroundColor: value === "monthly" ? colors.activeBg : "transparent",
          }}
          onPress={() => onChange("monthly")}
          activeOpacity={0.8}
        >
          <Text
            style={{
              fontWeight: "700",
              fontSize: 14,
              color: value === "monthly" ? colors.activeText : colors.inactiveText,
            }}
          >
            Theo tháng
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 999,
            backgroundColor: value === "yearly" ? colors.activeBg : "transparent",
          }}
          onPress={() => onChange("yearly")}
          activeOpacity={0.8}
        >
          <Text
            style={{
              fontWeight: "700",
              fontSize: 14,
              color: value === "yearly" ? colors.activeText : colors.inactiveText,
            }}
          >
            Theo năm
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          backgroundColor: colors.badgeBg,
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: 20,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: "700",
            color: colors.badgeText,
          }}
        >
          Tiết kiệm 20% khi thanh toán năm
        </Text>
      </View>
    </View>
  );
};

export default BillingToggle;
