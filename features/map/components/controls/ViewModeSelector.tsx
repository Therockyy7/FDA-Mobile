// features/map/components/ViewModeSelector.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "~/components/ui/text";

export type ViewMode = "zones" | "routes";

interface ViewModeSelectorProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export function ViewModeSelector({
  mode,
  onModeChange,
}: ViewModeSelectorProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: 20,
        padding: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.5)",
      }}
    >
      {/* Zones Button */}
      <TouchableOpacity
        onPress={() => onModeChange("zones")}
        activeOpacity={0.7}
        style={{ flex: 1 }}
      >
        {mode === "zones" ? (
          <LinearGradient
            colors={["#3B82F6", "#2563EB"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 16,
            }}
          >
            <Ionicons
              name="water"
              size={20}
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                fontSize: 15,
                fontWeight: "800",
                color: "white",
              }}
            >
              Khu vực
            </Text>
          </LinearGradient>
        ) : (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 16,
            }}
          >
            <Ionicons
              name="water-outline"
              size={20}
              color="#9CA3AF"
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: "#6B7280",
              }}
            >
              Khu vực
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Routes Button */}
      <TouchableOpacity
        onPress={() => onModeChange("routes")}
        activeOpacity={0.7}
        style={{ flex: 1 }}
      >
        {mode === "routes" ? (
          <LinearGradient
            colors={["#3B82F6", "#2563EB"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 16,
            }}
          >
            <MaterialCommunityIcons
              name="waves"
              size={20}
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                fontSize: 15,
                fontWeight: "800",
                color: "white",
              }}
            >
              Tuyến đường
            </Text>
          </LinearGradient>
        ) : (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 16,
            }}
          >
            <MaterialCommunityIcons
              name="waves"
              size={20}
              color="#9CA3AF"
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: "#6B7280",
              }}
            >
              Tuyến đường
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
