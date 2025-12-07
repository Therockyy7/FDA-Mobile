
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Platform, StatusBar, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { Area } from "../types/areas-types";
import { AreaStatsRow } from "./AreaStatsRow";

interface AreasHeaderProps {
  areas: Area[];
  onAddPress: () => void;
}

export function AreasHeader({ areas, onAddPress }: AreasHeaderProps) {
  const stats = useMemo(() => {
    const safeCount = areas.filter((a) => a.status === "safe").length;
    const warningCount = areas.filter((a) => a.status === "warning").length;
    const dangerCount = areas.filter((a) => a.status === "danger").length;

    return [
      { label: "An toàn", count: safeCount, color: "#10B981" },
      { label: "Cảnh báo", count: warningCount, color: "#F59E0B" },
      { label: "Nguy hiểm", count: dangerCount, color: "#EF4444" },
    ];
  }, [areas]);

  return (
    <View
      style={{
        backgroundColor: "white",
        paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight! + 10,
        paddingBottom: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <View style={{ width: 44 }} />

        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: "#111827",
              letterSpacing: -0.5,
            }}
          >
            Khu vực của tôi
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              marginTop: 4,
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: "#10B981",
              }}
            />
            <Text
              style={{
                fontSize: 12,
                color: "#6B7280",
                fontWeight: "600",
              }}
            >
              {areas.length} vị trí đang theo dõi
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={onAddPress}
          style={{
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 22,
            backgroundColor: "#3B82F6",
            shadowColor: "#3B82F6",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={26} color="white" />
        </TouchableOpacity>
      </View>

      <AreaStatsRow stats={stats} />
    </View>
  );
}
