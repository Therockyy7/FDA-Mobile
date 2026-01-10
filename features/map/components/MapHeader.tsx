// features/map/components/MapHeader.tsx
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Platform, StatusBar, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

type MapType = "standard" | "satellite" | "hybrid";

interface MapHeaderProps {
  stats: {
    safe: number;
    warning: number;
    danger: number;
  };
  mapType: MapType;
  onMapTypeChange: () => void;
  onShowLayers: () => void;
}

export function MapHeader({ stats, mapType, onMapTypeChange, onShowLayers }: MapHeaderProps) {
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

  return (
    <View
      style={{
        backgroundColor: colors.background,
        paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 8 : 54,
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
                  backgroundColor: "#10B981",
                  marginHorizontal: 6,
                }}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: "#10B981",
                }}
              >
                Đang cập nhật
              </Text>
            </View>
          </View>
        </View>

        {/* Map Type Toggle */}
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

      {/* Stats Bar */}
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
        {/* Safe */}
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 8,
            paddingHorizontal: 8,
            backgroundColor: isDarkColorScheme ? "#064E3B" : "#ECFDF5",
            borderRadius: 12,
            marginRight: 4,
          }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 8,
              backgroundColor: "#10B981",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 6,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "900", color: "white" }}>
              {stats.safe}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: isDarkColorScheme ? "#6EE7B7" : "#047857",
            }}
          >
            An toàn
          </Text>
        </View>

        {/* Warning */}
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 8,
            paddingHorizontal: 8,
            backgroundColor: isDarkColorScheme ? "#78350F" : "#FFFBEB",
            borderRadius: 12,
            marginRight: 4,
          }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 8,
              backgroundColor: "#F59E0B",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 6,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "900", color: "white" }}>
              {stats.warning}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: isDarkColorScheme ? "#FCD34D" : "#B45309",
            }}
          >
            Cảnh báo
          </Text>
        </View>

        {/* Danger */}
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 8,
            paddingHorizontal: 8,
            backgroundColor: isDarkColorScheme ? "#7F1D1D" : "#FEF2F2",
            borderRadius: 12,
          }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 8,
              backgroundColor: "#EF4444",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 6,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "900", color: "white" }}>
              {stats.danger}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: isDarkColorScheme ? "#FCA5A5" : "#DC2626",
            }}
          >
            Nguy hiểm
          </Text>
        </View>
      </View>
    </View>
  );
}
