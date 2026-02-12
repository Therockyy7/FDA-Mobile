// features/map/components/routes/FloodedRoutePolyline.tsx
import React, { useEffect, useState } from "react";
import { Polyline } from "react-native-maps";
import { RouteService, type LatLng } from "../../services/route.service";

interface FloodedRoutePolylineProps {
  start: LatLng;
  end: LatLng;
  status: "safe" | "warning" | "danger";
  strokeWidth?: number;
  isSelected?: boolean;
  onPress?: () => void;
  zIndex?: number;
}

export function FloodedRoutePolyline({
  start,
  end,
  status,
  strokeWidth = 6,
  isSelected = false,
  onPress,
  zIndex = 10,
}: FloodedRoutePolylineProps) {
  const [coords, setCoords] = useState<LatLng[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchRoute = async () => {
      // Use fallback straight line initially
      if (coords.length === 0) {
        setCoords([start, end]);
      }

      setIsLoading(true);
      const points = await RouteService.getRouteShape(start, end);
      
      if (mounted && points.length > 0) {
        setCoords(points);
      }
      if (mounted) setIsLoading(false);
    };

    fetchRoute();

    return () => {
      mounted = false;
    };
  }, [start.latitude, start.longitude, end.latitude, end.longitude]);

  const getMainColor = () => {
    if (status === "danger") return "#EF4444";
    if (status === "warning") return "#F59E0B";
    return "#3B82F6";
  };

  const getHighlightColor = () => {
    if (status === "danger") return "#FECACA";
    if (status === "warning") return "#FDE68A";
    return "#BFDBFE";
  };

  return (
    <>
      {/* 1. White border (Outline) */}
      <Polyline
        coordinates={coords}
        strokeColor="white"
        strokeWidth={strokeWidth + 4}
        lineJoin="round"
        lineCap="round"
        zIndex={zIndex}
      />

      {/* 2. Main color body */}
      <Polyline
        coordinates={coords}
        strokeColor={getMainColor()}
        strokeWidth={strokeWidth}
        lineJoin="round"
        lineCap="round"
        zIndex={zIndex + 1}
        tappable={true}
        onPress={onPress}
      />

      {/* 3. Inner lighter highlight (3D effect) */}
      <Polyline
        coordinates={coords}
        strokeColor={getHighlightColor()}
        strokeWidth={strokeWidth * 0.4}
        lineJoin="round"
        lineCap="round"
        zIndex={zIndex + 2}
      />

      {/* 4. Selection dashed line */}
      {isSelected && (
        <Polyline
          coordinates={coords}
          strokeColor="white" // or contrasting color
          strokeWidth={1}
          lineDashPattern={[10, 10]}
          zIndex={zIndex + 3}
        />
      )}
    </>
  );
}
