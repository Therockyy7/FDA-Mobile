// features/map/components/MapHeader.tsx
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Platform, StatusBar, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

type MapType = "standard" | "satellite" | "hybrid";

interface MapHeaderProps {
  stats: {
    safe: number; // < 1.0m
    caution: number; // 1.0 - 1.9m
    warning: number; // 2.0 - 2.9m
    critical: number; // >= 3.0m
  };
  mapType: MapType;
  onMapTypeChange: () => void;
  onShowLayers: () => void;
  onCreateArea?: () => void;
  showCreateAreaButton?: boolean;
}

export function MapHeader({
  stats,
  mapType,
  onMapTypeChange,
  onShowLayers,
  onCreateArea,
  showCreateAreaButton = false,
}: MapHeaderProps) {
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();

  // Theme colors
  const colors = {
    background: isDarkColorScheme ? "#0F172A" : "#FFFFFF",
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    buttonBg: isDarkColorScheme ? "#1E293B" : "#F1F5F9",
  };

  // Severity color config
  const severityConfig = [
    {
      key: "safe",
      label: "An toàn",
      count: stats.safe,
      color: "#22C55E",
      bgLight: "#DCFCE7",
      bgDark: "#14532D",
      textLight: "#15803D",
      textDark: "#86EFAC",
    },
    {
      key: "caution",
      label: "Chú ý",
      count: stats.caution,
      color: "#EAB308",
      bgLight: "#FEF9C3",
      bgDark: "#713F12",
      textLight: "#A16207",
      textDark: "#FDE047",
    },
    {
      key: "warning",
      label: "Cảnh báo",
      count: stats.warning,
      color: "#F97316",
      bgLight: "#FFEDD5",
      bgDark: "#7C2D12",
      textLight: "#C2410C",
      textDark: "#FDBA74",
    },
    {
      key: "critical",
      label: "Nguy hiểm",
      count: stats.critical,
      color: "#EF4444",
      bgLight: "#FEE2E2",
      bgDark: "#7F1D1D",
      textLight: "#DC2626",
      textDark: "#FCA5A5",
    },
  ];

  return (
    <View
      style={{
        backgroundColor: colors.background,
        paddingTop:
          Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 8 : 54,
        paddingBottom: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      {/* Top Row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              backgroundColor: colors.buttonBg,
              marginRight: 12,
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 2,
              }}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  backgroundColor: "#3B82F6",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 8,
                }}
              >
                <Ionicons name="water" size={16} color="white" />
              </View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: colors.text,
                }}
              >
                Bản đồ lũ lụt
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="location" size={12} color={colors.subtext} />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: colors.subtext,
                  marginLeft: 4,
                }}
              >
                Đà Nẵng City
              </Text>
              <View
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "#22C55E",
                  marginHorizontal: 6,
                }}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: "#22C55E",
                }}
              >
                Đang cập nhật
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {/* Create Area Button */}
          {showCreateAreaButton && onCreateArea && (
            <TouchableOpacity
              onPress={onCreateArea}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: "#10B981",
                alignItems: "center",
                justifyContent: "center",
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={22} color="white" />
            </TouchableOpacity>
          )}

          {/* Layers Button */}
          <TouchableOpacity
            onPress={onShowLayers}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: "#3B82F6",
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.8}
          >
            <MaterialIcons name="layers" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Bar - 4 Severity Levels */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: colors.cardBg,
          borderRadius: 16,
          padding: 4,
          borderWidth: isDarkColorScheme ? 1 : 0,
          borderColor: colors.border,
        }}
      >
        {severityConfig.map((item, index) => (
          <View
            key={item.key}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 6,
              paddingHorizontal: 4,
              backgroundColor: isDarkColorScheme ? item.bgDark : item.bgLight,
              borderRadius: 10,
              marginRight: index < severityConfig.length - 1 ? 3 : 0,
            }}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 7,
                backgroundColor: item.color,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 4,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: "900", color: "white" }}>
                {item.count}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 9,
                fontWeight: "700",
                color: isDarkColorScheme ? item.textDark : item.textLight,
              }}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
