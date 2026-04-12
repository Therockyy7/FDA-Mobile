// features/payment/components/PaymentStateIllustration.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

type Variant = "processing" | "error" | "cancel" | "returned";

type Props = {
  variant: Variant;
  title: string;
  subtitle?: string;
};

const VARIANT_CONFIG: Record<
  Variant,
  { icon: keyof typeof Ionicons.glyphMap; color: string; bgOpacity: string }
> = {
  processing: {
    icon: "card-outline",
    color: "#0077BE",
    bgOpacity: "rgba(0, 119, 190, 0.1)",
  },
  error: {
    icon: "alert-circle-outline",
    color: "#EF4444",
    bgOpacity: "rgba(239, 68, 68, 0.1)",
  },
  cancel: {
    icon: "close-circle-outline",
    color: "#F59E0B",
    bgOpacity: "rgba(245, 158, 11, 0.1)",
  },
  returned: {
    icon: "checkmark-done-outline",
    color: "#10B981",
    bgOpacity: "rgba(16, 185, 129, 0.12)",
  },
};

const PaymentStateIllustration: React.FC<Props> = ({
  variant,
  title,
  subtitle,
}) => {
  const { isDarkColorScheme } = useColorScheme();
  const config = VARIANT_CONFIG[variant];

  return (
    <View style={styles.container}>
      {/* Decorative rings */}
      <View
        style={[
          styles.outerRing,
          { borderColor: config.bgOpacity },
        ]}
      >
        <View
          style={[
            styles.middleRing,
            { backgroundColor: config.bgOpacity },
          ]}
        >
          <View
            style={[
              styles.innerCircle,
              { backgroundColor: config.bgOpacity },
            ]}
          >
            {variant === "processing" ? (
              <ActivityIndicator size="large" color={config.color} />
            ) : (
              <Ionicons name={config.icon} size={48} color={config.color} />
            )}
          </View>
        </View>
      </View>

      <Text
        style={[
          styles.title,
          { color: isDarkColorScheme ? "#F1F5F9" : "#1F2937" },
        ]}
      >
        {title}
      </Text>

      {subtitle && (
        <Text
          style={[
            styles.subtitle,
            { color: isDarkColorScheme ? "#94A3B8" : "#64748B" },
          ]}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 24,
  },
  outerRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  middleRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: "center",
    justifyContent: "center",
  },
  innerCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 32,
  },
});

export default PaymentStateIllustration;
