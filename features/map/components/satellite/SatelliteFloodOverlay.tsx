// features/map/components/satellite/SatelliteFloodOverlay.tsx
// Renders AI Prithvi satellite flood polygons on the MapView.
// Reads from the global useSatelliteFloodStore — zero prop drilling required.

import React, { useMemo } from "react";
import { Polygon, Marker } from "react-native-maps";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { useSatelliteFloodStore } from "~/features/map/stores/useSatelliteFloodStore";
import type { GeoJsonFeature } from "~/features/prediction/types/satellite.types";

// GeoJSON [lng, lat] → react-native-maps { latitude, longitude }
function lngLatToLatLng(coord: number[]): { latitude: number; longitude: number } {
  return { longitude: coord[0], latitude: coord[1] };
}

// Extract all outer rings from a single GeoJSON feature
function extractRings(
  feature: GeoJsonFeature,
): { latitude: number; longitude: number }[][] {
  const geom = feature.geometry;
  if (!geom) return [];

  if (geom.type === "Polygon") {
    // coordinates[0] is outer ring, [1..] are holes
    return geom.coordinates.map((ring) => ring.map(lngLatToLatLng));
  }

  if (geom.type === "MultiPolygon") {
    // coordinates is number[][][][] for MultiPolygon
    const multiCoords = geom.coordinates as unknown as number[][][][];
    return multiCoords.flatMap((poly) =>
      poly.map((ring) => ring.map(lngLatToLatLng)),
    );
  }

  return [];
}

// Pick a centroid for label placement
function centroid(
  coords: { latitude: number; longitude: number }[],
): { latitude: number; longitude: number } {
  const lat = coords.reduce((s, c) => s + c.latitude, 0) / coords.length;
  const lng = coords.reduce((s, c) => s + c.longitude, 0) / coords.length;
  return { latitude: lat, longitude: lng };
}

export function SatelliteFloodOverlay() {
  const { layers, visible } = useSatelliteFloodStore();

  const polygons = useMemo(() => {
    if (!visible || !layers.length) return [];

    const result: {
      key: string;
      coords: { latitude: number; longitude: number }[];
      fillColor: string;
      strokeColor: string;
      isHole: boolean;
    }[] = [];

    layers.forEach((layer) => {
      const features = layer.geojson?.features ?? [];
      features.forEach((feature, fi) => {
        const rings = extractRings(feature);
        rings.forEach((ring, ri) => {
          if (ring.length < 3) return;
          result.push({
            key: `${layer.id}-${fi}-${ri}`,
            coords: ring,
            fillColor:
              ri === 0
                ? layer.color + "55" // outer ring — semi-transparent fill
                : "rgba(0,0,0,0.0)", // holes — transparent
            strokeColor: layer.color + "CC",
            isHole: ri > 0,
          });
        });
      });
    });

    return result;
  }, [layers, visible]);

  // Build one label marker per layer (at bbox center)
  const labels = useMemo(() => {
    if (!visible || !layers.length) return [];
    return layers
      .map((layer) => {
        const firstFeature = layer.geojson?.features?.[0];
        if (!firstFeature) return null;
        const rings = extractRings(firstFeature);
        if (!rings[0]?.length) return null;
        const center = centroid(rings[0]);
        return { key: layer.id, center, layer };
      })
      .filter(Boolean) as { key: string; center: { latitude: number; longitude: number }; layer: (typeof layers)[0] }[];
  }, [layers, visible]);

  if (!visible || !polygons.length) return null;

  return (
    <>
      {polygons.map((p) => (
        <Polygon
          key={p.key}
          coordinates={p.coords}
          fillColor={p.fillColor}
          strokeColor={p.strokeColor}
          strokeWidth={p.isHole ? 0 : 2}
          tappable={false}
          zIndex={50}
        />
      ))}

      {labels.map(({ key, center, layer }) => (
        <Marker
          key={`label-${key}`}
          coordinate={center}
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={false}
          zIndex={51}
        >
          <View
            style={{
              backgroundColor: layer.color,
              borderRadius: 8,
              paddingHorizontal: 7,
              paddingVertical: 3,
              borderWidth: 1.5,
              borderColor: "#FFFFFF",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.4,
              shadowRadius: 4,
              elevation: 6,
            }}
          >
            <Text
              style={{
                fontSize: 9,
                fontWeight: "800",
                color: "#FFFFFF",
                letterSpacing: 0.3,
              }}
            >
              🌊 {layer.waterAreaKm2.toFixed(2)} km²
            </Text>
          </View>
        </Marker>
      ))}
    </>
  );
}
