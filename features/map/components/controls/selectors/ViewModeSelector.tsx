// features/map/components/controls/selectors/ViewModeSelector.tsx
import React from "react";
import { View } from "react-native";
import { useColorScheme } from "~/lib/useColorScheme";
import { CARD_SHADOW } from "~/features/map/lib/map-ui-utils";
import { ViewModeButton } from "~/features/map/components/controls/selectors/ViewModeButton";
import type { ViewMode } from "~/features/map/types/map-display.types";
export type { ViewMode };

interface ViewModeSelectorProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export function ViewModeSelector({ mode, onModeChange }: ViewModeSelectorProps) {
  const { isDarkColorScheme } = useColorScheme();
  const isDark = isDarkColorScheme;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? "rgba(30,41,59,0.95)" : "rgba(255,255,255,0.95)",
          borderColor: isDark ? "#334155" : "rgba(255,255,255,0.5)",
        },
      ]}
    >
      <ViewModeButton mode="zones" currentMode={mode} onPress={onModeChange} />
      <ViewModeButton mode="routes" currentMode={mode} onPress={onModeChange} />
    </View>
  );
}

const styles = {
  container: {
    flexDirection: "row" as const,
    borderRadius: 20 as const,
    padding: 5,
    ...CARD_SHADOW,
    elevation: 8 as const,
    borderWidth: 1,
  },
};
