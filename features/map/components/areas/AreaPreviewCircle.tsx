// features/map/components/areas/AreaPreviewCircle.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Circle, Marker, MarkerDragStartEndEvent } from "react-native-maps";

interface AreaPreviewCircleProps {
  center: {
    latitude: number;
    longitude: number;
  };
  radiusMeters: number;
  visible: boolean;
  onCenterChange?: (newCenter: { latitude: number; longitude: number }) => void;
}

const PREVIEW_COLOR = "#3B82F6";

export function AreaPreviewCircle({
  center,
  radiusMeters,
  visible,
  onCenterChange,
}: AreaPreviewCircleProps) {
  if (!visible) return null;

  const handleDragEnd = (event: MarkerDragStartEndEvent) => {
    onCenterChange?.(event.nativeEvent.coordinate);
  };

  return (
    <>
      {/* Main preview circle with dashed stroke */}
      <Circle
        center={center}
        radius={radiusMeters}
        fillColor={`${PREVIEW_COLOR}20`}
        strokeColor={PREVIEW_COLOR}
        strokeWidth={2}
        lineDashPattern={[10, 6]}
      />

      {/* Inner solid circle for better visibility */}
      <Circle
        center={center}
        radius={radiusMeters * 0.05}
        fillColor={`${PREVIEW_COLOR}60`}
        strokeColor={PREVIEW_COLOR}
        strokeWidth={1}
      />

      {/* Draggable center marker */}
      <Marker
        coordinate={center}
        anchor={{ x: 0.5, y: 0.5 }}
        draggable={!!onCenterChange}
        onDragEnd={handleDragEnd}
        tracksViewChanges={false}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: PREVIEW_COLOR,
            borderWidth: 4,
            borderColor: "white",
            shadowColor: PREVIEW_COLOR,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius: 8,
            elevation: 8,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="move" size={22} color="white" />
        </View>
      </Marker>
    </>
  );
}

export default AreaPreviewCircle;
