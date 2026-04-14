// features/areas/components/AreasHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React, { useMemo } from "react";
import { Platform, StatusBar, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { Area } from "../types/areas-types";

interface AreasHeaderProps {
  areas: Area[];
  onAddPress: () => void;
}

export function AreasHeader({ areas, onAddPress }: AreasHeaderProps) {
  const stats = useMemo(() => {
    const safeCount = areas.filter((a) => a.status === "safe").length;
    const warningCount = areas.filter((a) => a.status === "warning").length;
    const dangerCount = areas.filter((a) => a.status === "danger").length;

    return { safe: safeCount, warning: warningCount, danger: dangerCount };
  }, [areas]);

  return (
    <LinearGradient
      colors={["#1E3A5F", "#0B1A33"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        paddingTop: Platform.OS === "ios" ? 54 : (StatusBar.currentHeight || 0) + 12,
        paddingBottom: 20,
        paddingHorizontal: 16,
      }}
      testID="areas-header"
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
          <Text className="text-white text-2xl font-black tracking-tight" testID="areas-header-title">
            Khu vực của tôi
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 }}>
            <View className="w-1.5 h-1.5 rounded-full bg-flood-safe" />
            <Text className="text-white/80 text-xs font-semibold" testID="areas-header-count">
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
          testID="areas-header-add-button"
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
            backgroundColor: "rgba(16, 185, 129, 0.2)",
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderRadius: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            borderWidth: 1,
            borderColor: "rgba(16, 185, 129, 0.3)",
          }}
          testID="areas-header-stats-safe"
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: "rgba(16, 185, 129, 0.3)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="checkmark-circle" size={20} color="#6EE7B7" />
          </View>
          <View>
            <Text className="text-2xl font-black text-emerald-300">
              {stats.safe}
            </Text>
            <Text className="text-xs font-semibold text-emerald-300">
              An toàn
            </Text>
          </View>
        </View>

        {/* Warning */}
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(245, 158, 11, 0.2)",
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderRadius: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            borderWidth: 1,
            borderColor: "rgba(245, 158, 11, 0.3)",
          }}
          testID="areas-header-stats-warning"
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: "rgba(245, 158, 11, 0.3)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="warning" size={20} color="#FDE68A" />
          </View>
          <View>
            <Text className="text-2xl font-black text-yellow-200">
              {stats.warning}
            </Text>
            <Text className="text-xs font-semibold text-yellow-200">
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
          testID="areas-header-stats-danger"
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
            <Text className="text-2xl font-black text-red-300">
              {stats.danger}
            </Text>
            <Text className="text-xs font-semibold text-red-300">
              Nguy hiểm
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}
