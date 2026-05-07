// features/map/lib/navigation-utils.ts
// Navigation-specific logic: instruction boundaries, step tracking, ETA.
// Geometry primitives are in polyline-geometry.ts; translation in instruction-translator.ts.

import type { GeoJsonInstruction } from "../types/safe-route.types";

export {
  haversineDistance,
  computeBearing,
  lerpAngle,
  buildSegmentCumulativeDist,
  snapToPolyline,
  splitRouteAtProgress,
} from "./polyline-geometry";

export { translateInstruction, getManeuverIcon } from "./instruction-translator";

// boundaries[i] = cumulative meters at which instruction i ends.
export function buildInstructionBoundaries(instructions: GeoJsonInstruction[]): number[] {
  const boundaries: number[] = [];
  let cumulative = 0;
  for (const inst of instructions) {
    cumulative += inst.distance;
    boundaries.push(cumulative);
  }
  return boundaries;
}

export function getCurrentStepIndex(progressMeters: number, boundaries: number[]): number {
  for (let i = 0; i < boundaries.length; i++) {
    if (boundaries[i] > progressMeters) return i;
  }
  return boundaries.length - 1;
}

export function getDistanceToNextTurn(
  progressMeters: number,
  boundaries: number[],
  stepIndex: number,
): number {
  if (stepIndex >= boundaries.length) return 0;
  return Math.max(0, boundaries[stepIndex] - progressMeters);
}

export function formatETA(remainingTimeMs: number): string {
  const arrival = new Date(Date.now() + remainingTimeMs);
  const hours = arrival.getHours().toString().padStart(2, "0");
  const minutes = arrival.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}
