// features/map/components/MapHeader.tsx
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Platform, StatusBar, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";

type MapType = "standard" | "satellite" | "hybrid";

interface MapHeaderProps {
  stats: {
    safe: number;
    warning: number;
    danger: number;
  };
  mapType: MapType;
  onMapTypeChange: () => void;
}

export function MapHeader({ stats, mapType, onMapTypeChange }: MapHeaderProps) {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#FFFFFF", "#F9FAFB"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 50,
        paddingBottom: 16,
        paddingHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 8,
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
              borderRadius: 20,
              backgroundColor: "#F3F4F6",
              marginRight: 12,
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#1F2937" />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 2,
              }}
            >
              <Ionicons name="water" size={20} color="#3B82F6" />
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: "#1F2937",
                  marginLeft: 6,
                }}
              >
                Flood Monitor
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="location" size={14} color="#6B7280" />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#6B7280",
                  marginLeft: 4,
                }}
              >
                Đà Nẵng City
              </Text>
            </View>
          </View>
        </View>

        {/* Map Type Toggle */}
        <TouchableOpacity
          onPress={onMapTypeChange}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#3B82F6",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#3B82F6",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
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
          backgroundColor: "white",
          borderRadius: 16,
          padding: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        {/* Safe */}
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 10,
            paddingHorizontal: 12,
            backgroundColor: "#ECFDF5",
            borderRadius: 12,
            marginRight: 4,
          }}
        >
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: "#10B981",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 8,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "900", color: "white" }}>
              {stats.safe}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: "#047857",
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
            paddingVertical: 10,
            paddingHorizontal: 12,
            backgroundColor: "#FFFBEB",
            borderRadius: 12,
            marginRight: 4,
          }}
        >
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: "#F59E0B",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 8,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "900", color: "white" }}>
              {stats.warning}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: "#B45309",
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
            paddingVertical: 10,
            paddingHorizontal: 12,
            backgroundColor: "#FEF2F2",
            borderRadius: 12,
          }}
        >
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: "#EF4444",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 8,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "900", color: "white" }}>
              {stats.danger}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: "#DC2626",
            }}
          >
            Nguy hiểm
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}
