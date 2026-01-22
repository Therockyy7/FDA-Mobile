// features/alerts/components/alert-settings/MinimumSeveritySection.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import type {
  AlertSeverity,
  AlertSettingsColors,
} from "../../types/alert-settings.types";

interface SeverityOption {
  value: AlertSeverity;
  label: string;
  color: string;
}

interface MinimumSeveritySectionProps {
  minimumSeverity: AlertSeverity;
  onChange: (severity: AlertSeverity) => void;
  options: SeverityOption[];
  colors: AlertSettingsColors;
}

export function MinimumSeveritySection({
  minimumSeverity,
  onChange,
  options,
  colors,
}: MinimumSeveritySectionProps) {
  return (
    <View style={{ marginTop: 24, opacity: 1 }}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: "700",
          color: colors.subtext,
          textTransform: "uppercase",
          letterSpacing: 1,
          paddingHorizontal: 20,
          paddingBottom: 12,
          opacity: 1,
        }}
      >
        Minimum Severity Level
      </Text>
      <View style={{ paddingHorizontal: 20, opacity: 1 }}>
        <View
          style={{
            flexDirection: "row",
            backgroundColor: colors.mutedBg,
            borderRadius: 12,
            padding: 2,
            borderWidth: 1,
            borderColor: colors.border,
            opacity: 1,
          }}
        >
          {options.map((option) => {
            const isSelected = minimumSeverity === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => onChange(option.value)}
                activeOpacity={1}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  alignItems: "center",
                  backgroundColor: isSelected ? colors.cardBg : "transparent",
                  borderRadius: 10,
                  borderWidth: isSelected ? 2 : 0,
                  borderColor: isSelected ? option.color : "transparent",
                  shadowColor: isSelected ? option.color : "transparent",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: isSelected ? 0.25 : 0,
                  shadowRadius: 8,
                  elevation: isSelected ? 4 : 0,
                  transform: [{ scale: isSelected ? 1.02 : 1 }],
                  opacity: 1,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: option.color,
                      borderWidth: isSelected ? 2 : 0,
                      borderColor: isSelected ? colors.cardBg : "transparent",
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: isSelected ? "800" : "600",
                      color: isSelected ? option.color : colors.subtext,
                      textShadowColor: isSelected ? option.color : "transparent",
                      textShadowOffset: { width: 0, height: 0 },
                      textShadowRadius: isSelected ? 4 : 0,
                    }}
                  >
                    {option.label}
                  </Text>
                  {isSelected && (
                    <View
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                        backgroundColor: option.color,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name="checkmark" size={10} color="white" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text
          style={{
            fontSize: 11,
            color: colors.subtext,
            marginTop: 8,
            lineHeight: 16,
          }}
        >
          You will only receive alerts at this level or higher.
        </Text>
      </View>
    </View>
  );
}

export default MinimumSeveritySection;
