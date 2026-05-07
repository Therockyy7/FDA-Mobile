// features/map/hooks/navigation/useNavigationTracking.ts
// GPS location handler: snap to route, update step/distance, voice, camera.

import * as Haptics from "expo-haptics";
import type MapView from "react-native-maps";
import { useCallback } from "react";
import type { LocationObject } from "expo-location";
import type { DecodedRoute, LatLng } from "../../types/safe-route.types";
import {
  computeBearing,
  getCurrentStepIndex,
  getDistanceToNextTurn,
  lerpAngle,
  snapToPolyline,
} from "../../lib/navigation-utils";
import type { useNavigationState } from "./useNavigationState";
import type { useNavigationVoice } from "./useNavigationVoice";

interface TrackingRefs {
  instructionBoundariesRef: React.RefObject<number[]>;
  segmentCumulativeDistRef: React.RefObject<number[]>;
  lastHeadingRef: React.RefObject<number>;
  offRouteAlertedRef: React.RefObject<boolean>;
  isNavigatingRef: React.RefObject<boolean>;
  progressMetersRef: React.RefObject<number>;
}

interface TrackingParams {
  route: DecodedRoute | null;
  mapRef: React.RefObject<MapView | null>;
  refs: TrackingRefs;
  state: ReturnType<typeof useNavigationState>;
  voice: ReturnType<typeof useNavigationVoice>;
  onOffRoute?: () => Promise<void>;
  onArrived?: () => void;
  stopNavigation: () => void;
}

export function useNavigationTracking({
  route,
  mapRef,
  refs,
  state,
  voice,
  onOffRoute,
  onArrived,
  stopNavigation,
}: TrackingParams) {
  return useCallback(
    (location: LocationObject) => {
      if (!route || !refs.isNavigatingRef.current) return;

      const pos: LatLng = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      state.setUserPosition(pos);

      const polyline = route.coordinates;
      const segCumDist = refs.segmentCumulativeDistRef.current;
      const boundaries = refs.instructionBoundariesRef.current;

      const snap = snapToPolyline(pos, polyline, segCumDist);
      refs.progressMetersRef.current = snap.progressMeters;

      if (snap.distanceFromRoute > 50) {
        state.setIsOffRoute(true);
        if (!refs.offRouteAlertedRef.current) {
          refs.offRouteAlertedRef.current = true;
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          voice.speak("Đang tính lại tuyến đường...");
          onOffRoute?.();
        }
      } else {
        state.setIsOffRoute(false);
        refs.offRouteAlertedRef.current = false;
      }

      const stepIdx = getCurrentStepIndex(snap.progressMeters, boundaries);
      const dist = getDistanceToNextTurn(snap.progressMeters, boundaries, stepIdx);

      state.setCurrentStepIndex(stepIdx);
      state.setDistanceToNextTurn(dist);

      const remDist = Math.max(0, route.distance - snap.progressMeters);
      state.setRemainingDistance(remDist);
      state.setRemainingTime(
        route.distance > 0 ? (remDist / route.distance) * route.time : 0,
      );

      if (stepIdx < route.instructions.length) {
        const inst = route.instructions[stepIdx];
        if (dist < 30) voice.announceForStep(stepIdx, "now", inst);
        else if (dist < 150) voice.announceForStep(stepIdx, "approach", inst);
        else if (dist < 500) voice.announceForStep(stepIdx, "early", inst);
      }

      if (stepIdx >= route.instructions.length - 1 && dist < 20 && remDist < 30) {
        voice.speak("Bạn đã đến nơi.");
        stopNavigation();
        onArrived?.();
        return;
      }

      const nextPointIdx = Math.min(snap.segmentIndex + 1, polyline.length - 1);
      const rawHeading = computeBearing(pos, polyline[nextPointIdx]);
      const smoothed = lerpAngle(refs.lastHeadingRef.current, rawHeading, 0.15);
      refs.lastHeadingRef.current = smoothed;
      state.setHeading(smoothed);

      if (state.isFollowingUser && mapRef.current) {
        const pitch = dist < 200 ? 20 : 45;
        mapRef.current.animateCamera(
          { center: pos, heading: smoothed, pitch, zoom: 17, altitude: 300 },
          { duration: 500 },
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [route, mapRef, state.isFollowingUser, voice, onOffRoute],
  );
}
