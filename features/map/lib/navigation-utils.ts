// features/map/lib/navigation-utils.ts

import type { GeoJsonInstruction, LatLng } from "../types/safe-route.types";

const EARTH_RADIUS = 6371000; // meters

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Haversine distance between two LatLng points in meters.
 */
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

/**
 * Compass bearing (0-360) from point `from` to point `to`.
 */
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

/**
 * Spherical linear interpolation between two angles (degrees).
 * t = 0 returns `from`, t = 1 returns `to`. Use t ~0.15 for smooth camera.
 */
export function lerpAngle(from: number, to: number, t: number): number {
  const diff = ((to - from + 540) % 360) - 180;
  return ((from + diff * t) + 360) % 360;
}

/**
 * Precompute cumulative distance (meters) at each polyline vertex.
 * result[0] = 0 (start), result[i] = total distance from start to vertex i.
 */
export function buildSegmentCumulativeDist(polyline: LatLng[]): number[] {
  const cumDist: number[] = [0];
  for (let i = 1; i < polyline.length; i++) {
    cumDist.push(cumDist[i - 1] + haversineDistance(polyline[i - 1], polyline[i]));
  }
  return cumDist;
}

/**
 * Cumulative distance boundaries for each instruction step.
 * boundaries[i] = cumulative meters at which instruction i ends.
 */
export function buildInstructionBoundaries(
  instructions: GeoJsonInstruction[]
): number[] {
  const boundaries: number[] = [];
  let cumulative = 0;
  for (const inst of instructions) {
    cumulative += inst.distance;
    boundaries.push(cumulative);
  }
  return boundaries;
}

/**
 * Project user position onto the nearest segment of the polyline.
 * Returns the segment index, perpendicular distance from route, and progress along route.
 */
export function snapToPolyline(
  userPos: LatLng,
  polyline: LatLng[],
  segmentCumulativeDist: number[]
): {
  segmentIndex: number;
  distanceFromRoute: number;
  progressMeters: number;
} {
  let bestDist = Infinity;
  let bestSegIndex = 0;
  let bestT = 0;

  for (let i = 0; i < polyline.length - 1; i++) {
    const p1 = polyline[i];
    const p2 = polyline[i + 1];

    // Project onto segment using lat/lng as planar approximation (fine for short segments)
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
            lenSq
        )
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

  return {
    segmentIndex: bestSegIndex,
    distanceFromRoute: bestDist,
    progressMeters,
  };
}

/**
 * Find the current instruction step index based on progress along the route.
 */
export function getCurrentStepIndex(
  progressMeters: number,
  boundaries: number[]
): number {
  for (let i = 0; i < boundaries.length; i++) {
    if (boundaries[i] > progressMeters) {
      return i;
    }
  }
  return boundaries.length - 1;
}

/**
 * Distance remaining until the end of the current instruction step.
 */
export function getDistanceToNextTurn(
  progressMeters: number,
  boundaries: number[],
  stepIndex: number
): number {
  if (stepIndex >= boundaries.length) return 0;
  return Math.max(0, boundaries[stepIndex] - progressMeters);
}

/**
 * Parse Vietnamese instruction text to determine maneuver icon (Ionicons name).
 */
export function getManeuverIcon(instructionText: string): string {
  const text = instructionText.toLowerCase();
  if (text.includes("rẽ trái") || text.includes("re trái")) return "arrow-back";
  if (text.includes("rẽ phải") || text.includes("re phải")) return "arrow-forward";
  if (text.includes("quay đầu") || text.includes("u-turn")) return "return-down-back";
  if (text.includes("vòng xuyến") || text.includes("vòng xoay"))
    return "refresh-circle";
  if (text.includes("đến nơi") || text.includes("điểm đến")) return "flag";
  if (text.includes("thẳng") || text.includes("tiếp tục")) return "arrow-up";
  return "navigate";
}

/**
 * Calculate estimated arrival time string "HH:mm" from remaining time in ms.
 */
export function formatETA(remainingTimeMs: number): string {
  const arrival = new Date(Date.now() + remainingTimeMs);
  const hours = arrival.getHours().toString().padStart(2, "0");
  const minutes = arrival.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}
