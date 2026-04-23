// features/profile/components/OtherSettingsSection.tsx
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "~/components/ui/text";
import { useTranslation } from "~/features/i18n";
import { useColorScheme } from "~/lib/useColorScheme";

const OtherSettingsSection: React.FC = () => {
  const { isDarkColorScheme } = useColorScheme();
  const { t } = useTranslation();

  const colors = {
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    textMain: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    textSub: isDarkColorScheme ? "#94A3B8" : "#6B7280",
    divider: isDarkColorScheme ? "#334155" : "#F1F5F9",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
  };

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "800",
          color: colors.textMain,
          marginBottom: 12,
          marginLeft: 4,
        }}
      >
        {t("settings.other.title")}
      </Text>

      <View
        style={{
          backgroundColor: colors.cardBg,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: "hidden",
          shadowColor: isDarkColorScheme ? "#000" : "#64748B",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDarkColorScheme ? 0.3 : 0.04,
          shadowRadius: 10,
          elevation: 2,
        }}
      >
        {/* Help Center */}
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
          }}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: isDarkColorScheme ? "rgba(59, 130, 246, 0.15)" : "#EFF6FF",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="help-circle" size={20} color={isDarkColorScheme ? "#60A5FA" : "#007AFF"} />
            </View>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: colors.textMain,
                marginLeft: 12,
              }}
            >
              {t("settings.other.help")}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSub} />
        </TouchableOpacity>

        <View style={{ height: 1, backgroundColor: colors.divider, marginLeft: 58 }} />

        {/* Privacy Policy */}
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
          }}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: isDarkColorScheme ? "rgba(16, 185, 129, 0.15)" : "#F0FDF4",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="shield-checkmark" size={20} color={isDarkColorScheme ? "#34D399" : "#10B981"} />
            </View>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: colors.textMain,
                marginLeft: 12,
              }}
            >
              {t("settings.other.privacy")}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSub} />
        </TouchableOpacity>

        <View style={{ height: 1, backgroundColor: colors.divider, marginLeft: 58 }} />

        {/* About */}
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
          }}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: isDarkColorScheme ? "rgba(245, 158, 11, 0.15)" : "#FEF3C7",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="information-circle" size={20} color={isDarkColorScheme ? "#FBBF24" : "#F59E0B"} />
            </View>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: colors.textMain,
                marginLeft: 12,
              }}
            >
              {t("settings.other.about")}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: colors.textSub,
                marginRight: 6,
              }}
            >
              v2.5.0
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textSub} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OtherSettingsSection;
