// features/map/components/controls/selectors/ViewModeSelector.tsx
import React from "react";
import { View } from "react-native";
import { ViewModeButton } from "./ViewModeButton";
import type { ViewMode } from "../../../types/map-display.types";
export type { ViewMode };

interface ViewModeSelectorProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export function ViewModeSelector({ mode, onModeChange }: ViewModeSelectorProps) {
  return (
    <View style={styles.container}>
      <ViewModeButton mode="zones" currentMode={mode} onPress={onModeChange} />
      <ViewModeButton mode="routes" currentMode={mode} onPress={onModeChange} />
    </View>
  );
}

const styles = {
  container: {
    flexDirection: "row" as const,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20 as const,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8 as const,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
};
