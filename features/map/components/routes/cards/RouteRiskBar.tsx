// features/map/components/routes/cards/RouteRiskBar.tsx
import React from "react";
import { View } from "react-native";
import { FLOOD_COLORS } from "~/lib/design-tokens";

interface RouteRiskBarProps {
  floodRiskScore: number;
}

function getRiskColor(score: number): string {
  if (score > 60) return FLOOD_COLORS.danger;
  if (score > 30) return FLOOD_COLORS.warning;
  return FLOOD_COLORS.safe;
}

export const RouteRiskBar = React.memo(function RouteRiskBar({ floodRiskScore }: RouteRiskBarProps) {
  return (
    <View className="mb-3" testID="map-route-riskbar">
      <View className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <View
          style={{
            height: "100%",
            width: `${Math.min(floodRiskScore, 100)}%`,
            backgroundColor: getRiskColor(floodRiskScore),
            borderRadius: 999,
          }}
        />
      </View>
    </View>
  );
});
