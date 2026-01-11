// features/areas/components/AreasHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React, { useMemo } from "react";
import { Platform, StatusBar, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { Area } from "../types/areas-types";

interface AreasHeaderProps {
  areas: Area[];
  onAddPress: () => void;
}

export function AreasHeader({ areas, onAddPress }: AreasHeaderProps) {
  const { isDarkColorScheme } = useColorScheme();

  // Theme colors
  const colors = {
    gradientStart: isDarkColorScheme ? "#1E3A5F" : "#3B82F6",
    gradientEnd: isDarkColorScheme ? "#0F172A" : "#1D4ED8",
    cardBg: isDarkColorScheme ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.2)",
    text: "#FFFFFF",
    subtext: "rgba(255,255,255,0.8)",
  };

  const stats = useMemo(() => {
    const safeCount = areas.filter((a) => a.status === "safe").length;
    const warningCount = areas.filter((a) => a.status === "warning").length;
    const dangerCount = areas.filter((a) => a.status === "danger").length;

    return { safe: safeCount, warning: warningCount, danger: dangerCount };
  }, [areas]);

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        paddingTop: Platform.OS === "ios" ? 54 : (StatusBar.currentHeight || 0) + 12,
        paddingBottom: 20,
        paddingHorizontal: 16,
      }}
    >
      {/* Background Lottie */}
      <LottieView
        source={require("../../../assets/animations/profile-waves.json")}
        autoPlay
        loop
        speed={0.4}
        style={{
          position: "absolute",
          width: "150%",
          height: "100%",
          left: "-25%",
          bottom: 0,
          opacity: 0.15,
        }}
      />

      {/* Top Row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 22, fontWeight: "900", color: colors.text, letterSpacing: -0.5 }}>
            Khu vực của tôi
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 }}>
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: "#22C55E",
              }}
            />
            <Text style={{ fontSize: 12, color: colors.subtext, fontWeight: "600" }}>
              {areas.length} vị trí đang theo dõi
            </Text>
          </View>
        </View>

        {/* Add Button */}
        <TouchableOpacity
          onPress={onAddPress}
          style={{
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 14,
            backgroundColor: "rgba(255,255,255,0.2)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.3)",
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={26} color="white" />
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        {/* Safe */}
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(34, 197, 94, 0.2)",
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderRadius: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            borderWidth: 1,
            borderColor: "rgba(34, 197, 94, 0.3)",
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: "rgba(34, 197, 94, 0.3)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="checkmark-circle" size={20} color="#86EFAC" />
          </View>
          <View>
            <Text style={{ fontSize: 22, fontWeight: "900", color: "#86EFAC" }}>
              {stats.safe}
            </Text>
            <Text style={{ fontSize: 10, color: "#86EFAC", fontWeight: "600" }}>
              An toàn
            </Text>
          </View>
        </View>

        {/* Warning */}
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(251, 191, 36, 0.2)",
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderRadius: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            borderWidth: 1,
            borderColor: "rgba(251, 191, 36, 0.3)",
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: "rgba(251, 191, 36, 0.3)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="warning" size={20} color="#FDE68A" />
          </View>
          <View>
            <Text style={{ fontSize: 22, fontWeight: "900", color: "#FDE68A" }}>
              {stats.warning}
            </Text>
            <Text style={{ fontSize: 10, color: "#FDE68A", fontWeight: "600" }}>
              Cảnh báo
            </Text>
          </View>
        </View>

        {/* Danger */}
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(239, 68, 68, 0.2)",
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderRadius: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            borderWidth: 1,
            borderColor: "rgba(239, 68, 68, 0.3)",
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: "rgba(239, 68, 68, 0.3)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="alert-circle" size={20} color="#FCA5A5" />
          </View>
          <View>
            <Text style={{ fontSize: 22, fontWeight: "900", color: "#FCA5A5" }}>
              {stats.danger}
            </Text>
            <Text style={{ fontSize: 10, color: "#FCA5A5", fontWeight: "600" }}>
              Nguy hiểm
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}
