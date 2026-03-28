// features/map/components/routes/cards/RouteRiskBar.tsx
import React from "react";
import { View } from "react-native";

interface RouteRiskBarProps {
  floodRiskScore: number;
}

function getRiskColor(score: number) {
  if (score > 60) return "#EF4444";
  if (score > 30) return "#F59E0B";
  return "#10B981";
}

export function RouteRiskBar({ floodRiskScore }: RouteRiskBarProps) {
  return (
    <View style={{ marginBottom: 12 }}>
      <View
        style={{
          height: 6,
          backgroundColor: "#F1F5F9",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
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
}
