import React, { useMemo } from "react";
import { Polygon } from "react-native-maps";
import { AdminArea } from "~/features/areas/types/admin-area.types";
import { useColorScheme } from "~/lib/useColorScheme";

interface AdminAreaPolygonProps {
  area: AdminArea;
  onPress: (area: AdminArea) => void;
  isSelected?: boolean;
}

export const AdminAreaPolygon = React.memo(
  ({ area, onPress, isSelected }: AdminAreaPolygonProps) => {
    const { isDarkColorScheme } = useColorScheme();

    const coordinates = useMemo(() => {
      try {
        if (!area.geometry) return [];
        // console.log("Parsing geometry for", area.name, area.geometry);
        if (typeof area.geometry === "object") {
          // Already parsed
          return (area.geometry as any).coordinates[0].map(
            (coord: [number, number]) => ({
              longitude: coord[0],
              latitude: coord[1],
            }),
          );
        }

        if (!area.geometry) return [];

        let geoJson;
        try {
          if (typeof area.geometry === "object") {
            geoJson = area.geometry;
          } else {
            geoJson = JSON.parse(area.geometry);
          }
        } catch (e) {
          // Handle case where string might be double-escaped or malformed
          // Error 'Unexpected character: \' suggests content is like {\"type\":...}
          try {
            if (typeof area.geometry === "string") {
              const cleaned = area.geometry
                .replace(/\\"/g, '"')
                .replace(/\\/g, "");
              geoJson = JSON.parse(cleaned);
            }
          } catch {
            console.warn(`Failed to parse geometry for area ${area.name}:`, e);
            return [];
          }
        }

        let coords = [];

        if (
          geoJson &&
          geoJson.type === "Polygon" &&
          Array.isArray(geoJson.coordinates)
        ) {
          // GeoJSON coordinates are [longitude, latitude]
          // MapView expects { latitude, longitude }
          // We take the first ring (exterior boundary)
          coords = geoJson.coordinates[0];
        } else if (
          geoJson &&
          geoJson.type === "MultiPolygon" &&
          Array.isArray(geoJson.coordinates)
        ) {
          // simplified: just take the first polygon's first ring
          coords = geoJson.coordinates[0][0];
        }

        if (coords && Array.isArray(coords)) {
          return coords.map((coord: [number, number]) => ({
            longitude: coord[0],
            latitude: coord[1],
          }));
        }

        return [];
      } catch (e) {
        console.warn(`Failed to parse geometry for area ${area.name}:`, e);
        return [];
      }
    }, [area.geometry, area.name]);

    if (!coordinates.length) return null;

    const strokeColor = isSelected
      ? "#3B82F6"
      : isDarkColorScheme
        ? "#60A5FA" // Blue-400
        : "#2563EB"; // Blue-600

    const fillColor = isSelected
      ? "rgba(59, 130, 246, 0.3)"
      : isDarkColorScheme
        ? "rgba(96, 165, 250, 0.15)"
        : "rgba(37, 99, 235, 0.1)";

    return (
      <Polygon
        coordinates={coordinates}
        strokeColor={strokeColor}
        fillColor={fillColor}
        strokeWidth={isSelected ? 2 : 1.5}
        tappable={true}
        onPress={(e) => {
          // Prevent bubbling to map
          e.stopPropagation();
          onPress(area);
        }}
        zIndex={isSelected ? 10 : 1}
      />
    );
  },
);

AdminAreaPolygon.displayName = "AdminAreaPolygon";
