// features/map/components/stations/RoadGradientPolylines.tsx
import React, { useMemo } from "react";
import { Polyline } from "react-native-maps";
import { useMapLayerSettings } from "../../hooks/useMapLayerSettings";
import {
  isLineStringFeature,
  type RoadSegmentFeature,
} from "../../types/map-layers.types";

/** Parse hex color "#RRGGBB" → [r, g, b] */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

/** Interpolate between two hex colors at progress t ∈ [0, 1] → "#RRGGBB" */
function lerpColor(colorA: string, colorB: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(colorA);
  const [r2, g2, b2] = hexToRgb(colorB);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/** Compute Euclidean distance between two [lng, lat] points */
function dist(a: [number, number], b: [number, number]): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  return Math.sqrt(dx * dx + dy * dy);
}

/** Number of subdivisions per original segment */
const SUBDIVISIONS = 20;

interface SubSegment {
  p1: { latitude: number; longitude: number };
  p2: { latitude: number; longitude: number };
  color: string;
}

/**
 * Split each segment into SUBDIVISIONS mini-segments, each rendered as a
 * separate <Polyline> with a solid interpolated color. This is the only
 * reliable way to achieve gradient on react-native-maps (strokeColors is
 * buggy on Android — it assigns the color of the END point to the whole
 * segment, ignoring intermediate values).
 */
function buildSubSegments(
  coords: [number, number][],
  startColor: string,
  endColor: string
): SubSegment[] {
  if (coords.length < 2) return [];

  const segLengths: number[] = [];
  for (let i = 0; i < coords.length - 1; i++) {
    segLengths.push(dist(coords[i], coords[i + 1]));
  }
  const totalDist = segLengths.reduce((a, b) => a + b, 0);

  const result: SubSegment[] = [];
  let cumBefore = 0;

  for (let i = 0; i < coords.length - 1; i++) {
    const [lngA, latA] = coords[i];
    const [lngB, latB] = coords[i + 1];
    const segLen = segLengths[i];

    for (let s = 0; s < SUBDIVISIONS; s++) {
      const t1 = s / SUBDIVISIONS;
      const t2 = (s + 1) / SUBDIVISIONS;

      const g1 = totalDist === 0 ? 0 : (cumBefore + t1 * segLen) / totalDist;
      const g2 = totalDist === 0 ? 0 : (cumBefore + t2 * segLen) / totalDist;

      // Use midpoint color for the mini-segment
      const midG = (g1 + g2) / 2;

      result.push({
        p1: {
          latitude: latA + (latB - latA) * t1,
          longitude: lngA + (lngB - lngA) * t1,
        },
        p2: {
          latitude: latA + (latB - latA) * t2,
          longitude: lngA + (lngB - lngA) * t2,
        },
        color: lerpColor(startColor, endColor, midG),
      });
    }

    cumBefore += segLen;
  }

  return result;
}

export function RoadGradientPolylines() {
  const { floodSeverity, settings } = useMapLayerSettings();

  const allSubSegments = useMemo(() => {
    if (!settings.overlays.flood || !floodSeverity?.features?.length) return [];

    const lineFeatures = floodSeverity.features.filter(
      (f): f is RoadSegmentFeature => isLineStringFeature(f)
    );

    return lineFeatures.flatMap((feature, featureIdx) => {
      const { properties, geometry } = feature;
      const coords = geometry.coordinates as [number, number][];
      return buildSubSegments(coords, properties.startColor, properties.endColor).map(
        (seg, segIdx) => ({ ...seg, featureIdx, segIdx })
      );
    });
  }, [settings.overlays.flood, floodSeverity?.features]);

  if (allSubSegments.length === 0) return null;

  return (
    <>
      {allSubSegments.map(({ p1, p2, color, featureIdx, segIdx }) => (
        <Polyline
          key={`grad-${featureIdx}-${segIdx}`}
          coordinates={[p1, p2]}
          strokeWidth={6}
          strokeColor={color}
          lineCap="butt"
          lineJoin="round"
        />
      ))}
    </>
  );
}
