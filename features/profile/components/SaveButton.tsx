import React from "react";
import { TouchableOpacity, View, ActivityIndicator } from "react-native";
import { Text } from "~/components/ui/text";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "~/features/i18n";
import { useColorScheme } from "~/lib/useColorScheme";

type Props = {
  onPress: () => void;
  loading?: boolean;
};

const SaveButton: React.FC<Props> = ({ onPress, loading = false }) => {
  const { isDarkColorScheme } = useColorScheme();
  const { t } = useTranslation();

  const colors = {
    gradientStart: loading ? "#93C5FD" : "#2563EB",
    gradientEnd: loading ? "#60A5FA" : "#1D4ED8",
    shadow: isDarkColorScheme ? "#2563EB" : "#1D4ED8"
  };

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 24, paddingBottom: 40 }}>
      <TouchableOpacity
        onPress={onPress}
        disabled={loading}
        activeOpacity={0.8}
        style={{
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
        }}
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 20,
            paddingVertical: 18,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 10
          }}
        >
          {loading && <ActivityIndicator color="white" />}
          <Text
            style={{
              fontSize: 16,
              fontWeight: "800",
              color: "white",
              letterSpacing: 0.5,
            }}
          >
            {loading ? t("common.saving") : t("profile.save")}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default SaveButton;