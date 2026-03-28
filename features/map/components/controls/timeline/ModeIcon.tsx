// features/map/components/controls/timeline/ModeIcon.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Animated, TouchableOpacity } from "react-native";

interface ModeIconProps {
  active: boolean;
  viewMode: "zones" | "routes";
  onPress: () => void;
}

export function ModeIcon({ active, viewMode, onPress }: ModeIconProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 80,
        useNativeDriver: false,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: false,
      }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={[
          styles.button,
          { backgroundColor: active ? "#007AFF" : "transparent" },
        ]}
      >
        {viewMode === "zones" ? (
          <MaterialCommunityIcons
            name="waves"
            size={18}
            color={active ? "white" : "#4B5563"}
          />
        ) : (
          <MaterialCommunityIcons
            name="routes"
            size={18}
            color={active ? "white" : "#4B5563"}
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = {
  button: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
};
