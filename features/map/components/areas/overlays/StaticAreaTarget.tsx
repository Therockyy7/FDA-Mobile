// features/map/components/areas/overlays/StaticAreaTarget.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Dimensions } from "react-native";
import { Region } from "react-native-maps";
import { SHADOW } from "~/lib/design-tokens";

interface Props {
  radiusMeters: number;
  region: Region | null;
}

const PREVIEW_COLOR = "#007AFF";

export function StaticAreaTarget({ radiusMeters, region }: Props) {
  if (!region) return null;

  // Approximate pixel scale based on current region's latitudeDelta
  // 1 degree of latitude is roughly 111,320 meters
  const { height } = Dimensions.get("window");
  
  // degrees per pixel
  const degreesPerPixel = region.latitudeDelta / height;
  
  // If we can't calculate safely, default to something reasonable
  let radiusPixels = degreesPerPixel > 0 
    ? (radiusMeters / 111320) / degreesPerPixel 
    : 100;

  // Cap incredibly massive radius values to prevent screen breaking
  radiusPixels = Math.min(Math.max(radiusPixels, 20), height / 2);

  return (
    <View
      pointerEvents="none" // let touches pass through to the map
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
      }}
    >
      {/* Outer radius dashed circle */}
      <View
        style={{
          position: "absolute",
          width: radiusPixels * 2,
          height: radiusPixels * 2,
          borderRadius: radiusPixels,
          borderWidth: 2,
          borderColor: PREVIEW_COLOR,
          borderStyle: "dashed",
          backgroundColor: `${PREVIEW_COLOR}15`,
        }}
      />

      {/* Inner solid circle pointer */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: PREVIEW_COLOR,
          borderWidth: 4,
          borderColor: "white",
          ...SHADOW.md,
          shadowColor: PREVIEW_COLOR,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="location" size={22} color="white" />
      </View>
    </View>
  );
}
