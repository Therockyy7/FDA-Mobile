import React, { useMemo } from "react";
import { Polygon } from "react-native-maps";
import { AdminArea } from "~/features/areas/types/admin-area.types";
import { isEwkbHex, ewkbToLatLngArray } from "~/features/map/lib/ewkb-parser";
import { useColorScheme } from "~/lib/useColorScheme";

interface AdminAreaPolygonProps {
  area: AdminArea;
  onPress: (area: AdminArea) => void;
  isSelected?: boolean;
  fillColorOverride?: string;
  strokeColorOverride?: string;
}



/**
 * Parse geometry data from various formats:
 * 1. Already-parsed GeoJSON object
 * 2. JSON string of GeoJSON (standard)
 * 3. Double-escaped JSON string
 * 4. EWKB hex string (PostGIS binary format) — NOW SUPPORTED
 * 5. Numeric or non-JSON strings - returns []
 */
function parseGeometry(
  geometry: any,
  areaName: string,
): { latitude: number; longitude: number }[] {
  if (!geometry) return [];

  // Case 1: Already a parsed GeoJSON object
  if (typeof geometry === "object" && geometry !== null) {
    return extractCoordsFromGeoJson(geometry, areaName);
  }

  // Must be a string from here on
  if (typeof geometry !== "string") return [];

  const trimmed = geometry.trim();
  if (!trimmed) return [];

  // Case 4: EWKB hex string (PostGIS binary geometry)
  if (isEwkbHex(trimmed)) {
    const coords = ewkbToLatLngArray(trimmed);
    if (coords.length > 0) {
      return coords;
    }
    // If EWKB parsing returned empty, log for debugging
    console.warn(`[AdminAreaPolygon] EWKB parsing returned empty for "${areaName}"`);
    return [];
  }

  // Case 2: Standard JSON string
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const geoJson = JSON.parse(trimmed);
      return extractCoordsFromGeoJson(geoJson, areaName);
    } catch {
      // Try cleaning double-escaped strings
      try {
        const cleaned = trimmed
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, "\\");
        const geoJson = JSON.parse(cleaned);
        return extractCoordsFromGeoJson(geoJson, areaName);
      } catch {
        // Fall through to final catch
      }
    }
  }

  // Case 5: Unrecognized format — don't spam console
  return [];
}

/**
 * Extract lat/lng coordinates from a parsed GeoJSON geometry object.
 */
function extractCoordsFromGeoJson(
  geoJson: any,
  _areaName: string,
): { latitude: number; longitude: number }[] {
  if (!geoJson) return [];

  let coords: [number, number][] = [];

  if (geoJson.type === "Polygon" && Array.isArray(geoJson.coordinates)) {
    coords = geoJson.coordinates[0];
  } else if (
    geoJson.type === "MultiPolygon" &&
    Array.isArray(geoJson.coordinates)
  ) {
    // Take the first polygon's outer ring
    coords = geoJson.coordinates[0]?.[0] || [];
  } else if (
    geoJson.type === "Feature" &&
    geoJson.geometry
  ) {
    // GeoJSON Feature wrapper
    return extractCoordsFromGeoJson(geoJson.geometry, _areaName);
  } else if (
    geoJson.type === "FeatureCollection" &&
    Array.isArray(geoJson.features) &&
    geoJson.features.length > 0
  ) {
    return extractCoordsFromGeoJson(geoJson.features[0].geometry, _areaName);
  }

  if (coords && Array.isArray(coords) && coords.length > 0) {
    return coords.map((coord) => ({
      longitude: coord[0],
      latitude: coord[1],
    }));
  }

  return [];
}

export const AdminAreaPolygon = React.memo(
  ({
    area,
    onPress,
    isSelected,
    fillColorOverride,
    strokeColorOverride,
  }: AdminAreaPolygonProps) => {
    const { isDarkColorScheme } = useColorScheme();

    const coordinates = useMemo(
      () => parseGeometry(area.geometry, area.name),
      [area.geometry, area.name],
    );

    if (!coordinates.length) return null;

    const strokeColor = strokeColorOverride || (isSelected
      ? "#007AFF"
      : isDarkColorScheme
        ? "#38BDF8"
        : "#2563EB");

    const fillColor = fillColorOverride || (isSelected
      ? "rgba(59, 130, 246, 0.3)"
      : isDarkColorScheme
        ? "rgba(96, 165, 250, 0.15)"
        : "rgba(37, 99, 235, 0.1)");

    return (
      <Polygon
        key={`${area.id}-${fillColor}-${strokeColor}`}
        coordinates={coordinates}
        strokeColor={strokeColor}
        fillColor={fillColor}
        strokeWidth={isSelected ? 2 : 1.5}
        tappable={true}
        onPress={(e) => {
          e.stopPropagation();
          onPress(area);
        }}
        zIndex={isSelected ? 10 : 1}
      />
    );
  }
);

AdminAreaPolygon.displayName = "AdminAreaPolygon";

