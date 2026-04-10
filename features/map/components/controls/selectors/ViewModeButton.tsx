// features/map/components/controls/selectors/ViewModeButton.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import type { ViewMode } from "~/features/map/types/map-display.types";

interface ViewModeButtonProps {
  mode: ViewMode;
  currentMode: ViewMode;
  onPress: (mode: ViewMode) => void;
}

export function ViewModeButton({ mode, currentMode, onPress }: ViewModeButtonProps) {
  const { isDarkColorScheme } = useColorScheme();
  const isDark = isDarkColorScheme;
  const isActive = mode === currentMode;

  if (mode === "zones") {
    return (
      <TouchableOpacity onPress={() => onPress("zones")} activeOpacity={0.7} style={{ flex: 1 }}>
        {isActive ? (
          <LinearGradient
            colors={["#007AFF", "#2563EB"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Ionicons name="water" size={20} color="white" style={styles.icon} />
            <Text style={styles.activeText}>Khu vực</Text>
          </LinearGradient>
        ) : (
          <View style={styles.button}>
            <Ionicons name="water-outline" size={20} color={isDark ? "#94A3B8" : "#9CA3AF"} style={styles.icon} />
            <Text style={[styles.inactiveText, { color: isDark ? "#94A3B8" : "#6B7280" }]}>Khu vực</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={() => onPress("routes")} activeOpacity={0.7} style={{ flex: 1 }}>
      {isActive ? (
        <LinearGradient
          colors={["#007AFF", "#2563EB"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <MaterialCommunityIcons name="waves" size={20} color="white" style={styles.icon} />
          <Text style={styles.activeText}>Tuyến đường</Text>
        </LinearGradient>
      ) : (
        <View style={styles.button}>
          <MaterialCommunityIcons name="waves" size={20} color={isDark ? "#94A3B8" : "#9CA3AF"} style={styles.icon} />
          <Text style={[styles.inactiveText, { color: isDark ? "#94A3B8" : "#6B7280" }]}>Tuyến đường</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = {
  button: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  icon: {
    marginRight: 8,
  },
  activeText: {
    fontSize: 15,
    fontWeight: "800" as const,
    color: "white",
  },
  inactiveText: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
};
