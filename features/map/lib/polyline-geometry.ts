// features/map/lib/polyline-geometry.ts
// Pure geometry utilities for polyline operations: distances, bearings, projections, splits.

import type { LatLng } from "../types/safe-route.types";

const EARTH_RADIUS = 6371000; // meters

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function haversineDistance(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * sinLng * sinLng;
  return EARTH_RADIUS * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function computeBearing(from: LatLng, to: LatLng): number {
  const dLng = toRad(to.longitude - from.longitude);
  const fromLat = toRad(from.latitude);
  const toLat = toRad(to.latitude);
  const x = Math.sin(dLng) * Math.cos(toLat);
  const y =
    Math.cos(fromLat) * Math.sin(toLat) -
    Math.sin(fromLat) * Math.cos(toLat) * Math.cos(dLng);
  return (toDeg(Math.atan2(x, y)) + 360) % 360;
}

// t = 0 returns `from`, t = 1 returns `to`. Use t ~0.15 for smooth camera.
export function lerpAngle(from: number, to: number, t: number): number {
  const diff = ((to - from + 540) % 360) - 180;
  return ((from + diff * t) + 360) % 360;
}

// result[0] = 0 (start), result[i] = total distance from start to vertex i.
export function buildSegmentCumulativeDist(polyline: LatLng[]): number[] {
  const cumDist: number[] = [0];
  for (let i = 1; i < polyline.length; i++) {
    cumDist.push(cumDist[i - 1] + haversineDistance(polyline[i - 1], polyline[i]));
  }
  return cumDist;
}

export function snapToPolyline(
  userPos: LatLng,
  polyline: LatLng[],
  segmentCumulativeDist: number[],
): { segmentIndex: number; distanceFromRoute: number; progressMeters: number } {
  let bestDist = Infinity;
  let bestSegIndex = 0;
  let bestT = 0;

  for (let i = 0; i < polyline.length - 1; i++) {
    const p1 = polyline[i];
    const p2 = polyline[i + 1];
    const dx = p2.longitude - p1.longitude;
    const dy = p2.latitude - p1.latitude;
    const lenSq = dx * dx + dy * dy;

    let t = 0;
    if (lenSq > 0) {
      t = Math.max(
        0,
        Math.min(
          1,
          ((userPos.longitude - p1.longitude) * dx +
            (userPos.latitude - p1.latitude) * dy) /
            lenSq,
        ),
      );
    }

    const closest: LatLng = {
      latitude: p1.latitude + t * dy,
      longitude: p1.longitude + t * dx,
    };

    const dist = haversineDistance(userPos, closest);
    if (dist < bestDist) {
      bestDist = dist;
      bestSegIndex = i;
      bestT = t;
    }
  }

  const segmentLength =
    segmentCumulativeDist[bestSegIndex + 1] - segmentCumulativeDist[bestSegIndex];
  const progressMeters = segmentCumulativeDist[bestSegIndex] + bestT * segmentLength;

  return { segmentIndex: bestSegIndex, distanceFromRoute: bestDist, progressMeters };
}

// The interpolated split point is included in both arrays for rendering continuity.
export function splitRouteAtProgress(
  polyline: LatLng[],
  segmentCumulativeDist: number[],
  progressMeters: number,
): { traveled: LatLng[]; remaining: LatLng[] } {
  if (polyline.length < 2 || progressMeters <= 0) {
    return { traveled: [], remaining: [...polyline] };
  }
  const total = segmentCumulativeDist[segmentCumulativeDist.length - 1];
  if (progressMeters >= total) {
    return { traveled: [...polyline], remaining: [] };
  }

  let splitIdx = 0;
  for (let i = 1; i < segmentCumulativeDist.length; i++) {
    if (segmentCumulativeDist[i] > progressMeters) {
      splitIdx = i - 1;
      break;
    }
  }

  const segStart = segmentCumulativeDist[splitIdx];
  const segEnd = segmentCumulativeDist[splitIdx + 1];
  const t = segEnd > segStart ? (progressMeters - segStart) / (segEnd - segStart) : 0;

  const p1 = polyline[splitIdx];
  const p2 = polyline[splitIdx + 1];
  const splitPoint: LatLng = {
    latitude: p1.latitude + t * (p2.latitude - p1.latitude),
    longitude: p1.longitude + t * (p2.longitude - p1.longitude),
  };

  return {
    traveled: [...polyline.slice(0, splitIdx + 1), splitPoint],
    remaining: [splitPoint, ...polyline.slice(splitIdx + 1)],
  };
}
