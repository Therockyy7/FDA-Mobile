// features/map/components/FloodZoneOverlay.tsx
import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { Polygon } from "react-native-maps";
import { FloodZone } from "../constants/map-data";
import { getStatusColor } from "../lib/map-utils";

interface FloodZoneOverlayProps {
  zone: FloodZone;
  isSelected: boolean;
  onPress: () => void;
}

export function FloodZoneOverlay({
  zone,
  isSelected,
  onPress,
}: FloodZoneOverlayProps) {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const colors = getStatusColor(zone.status);

  useEffect(() => {
    // Animated pulsing effect for water
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.3],
  });

  return (
    <>
      {/* Base layer - static */}
      <Polygon
        coordinates={zone.coordinates}
        fillColor={`${colors.main}26`} // 15% opacity
        strokeColor={colors.main}
        strokeWidth={isSelected ? 3 : 2}
        tappable
        onPress={onPress}
      />

      {/* Animated water effect layer */}
      <Polygon
        coordinates={zone.coordinates}
        fillColor={`${colors.main}40`} // Animated opacity
        strokeColor="transparent"
        strokeWidth={0}
      />

      {/* Highlight border when selected */}
      {isSelected && (
        <Polygon
          coordinates={zone.coordinates}
          fillColor="transparent"
          strokeColor="#FFFFFF"
          strokeWidth={4}
          lineDashPattern={[10, 5]}
        />
      )}
    </>
  );
}
