// features/map/hooks/useNavigation.ts
// Composition hook: navigation state + voice + GPS watcher.

import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef } from "react";
import type { GeoJsonInstruction, LatLng } from "../types/safe-route.types";
import type { UseNavigationParams } from "../types/navigation.types";
import {
  buildInstructionBoundaries,
  buildSegmentCumulativeDist,
  computeBearing,
  getCurrentStepIndex,
  getDistanceToNextTurn,
  lerpAngle,
  snapToPolyline,
} from "../lib/navigation-utils";
import { useNavigationState } from "./navigation/useNavigationState";
import { useNavigationVoice } from "./navigation/useNavigationVoice";
import { useGPSWatcher } from "./navigation/useGPSWatcher";

export function useNavigation({ route, mapRef }: UseNavigationParams) {
  const state = useNavigationState();
  const voice = useNavigationVoice();
  const gps = useGPSWatcher();

  const instructionBoundariesRef = useRef<number[]>([]);
  const segmentCumulativeDistRef = useRef<number[]>([]);
  const lastHeadingRef = useRef(0);
  const offRouteAlertedRef = useRef(false);
  const isNavigatingRef = useRef(false);

  const onLocationUpdate = useCallback(
    (location: import("expo-location").LocationObject) => {
      if (!route || !isNavigatingRef.current) return;

      const pos: LatLng = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      state.setUserPosition(pos);

      const polyline = route.coordinates;
      const segCumDist = segmentCumulativeDistRef.current;
      const boundaries = instructionBoundariesRef.current;

      const snap = snapToPolyline(pos, polyline, segCumDist);

      // Off-route check
      if (snap.distanceFromRoute > 50) {
        state.setIsOffRoute(true);
        if (!offRouteAlertedRef.current) {
          offRouteAlertedRef.current = true;
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          voice.speak("Bạn đã lạc đường. Hãy quay lại tuyến đường.");
        }
      } else {
        state.setIsOffRoute(false);
        offRouteAlertedRef.current = false;
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

      // Voice announcements (3-level)
      if (stepIdx < route.instructions.length) {
        const inst = route.instructions[stepIdx];
        if (dist < 30) {
          voice.announceForStep(stepIdx, "now", inst);
        } else if (dist < 150) {
          voice.announceForStep(stepIdx, "approach", inst);
        } else if (dist < 500) {
          voice.announceForStep(stepIdx, "early", inst);
        }
      }

      // Destination reached
      if (stepIdx >= route.instructions.length - 1 && dist < 20 && remDist < 30) {
        voice.speak("Bạn đã đến nơi.");
        stopNavigation();
        return;
      }

      // Heading & camera
      const nextPointIdx = Math.min(snap.segmentIndex + 1, polyline.length - 1);
      const rawHeading = computeBearing(pos, polyline[nextPointIdx]);
      const smoothed = lerpAngle(lastHeadingRef.current, rawHeading, 0.15);
      lastHeadingRef.current = smoothed;
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
    [route, mapRef, state.isFollowingUser, voice],
  );

  const startNavigation = useCallback(async () => {
    if (!route || route.coordinates.length < 2) return;

    segmentCumulativeDistRef.current = buildSegmentCumulativeDist(route.coordinates);
    instructionBoundariesRef.current = buildInstructionBoundaries(route.instructions);
    voice.resetAnnounced();
    offRouteAlertedRef.current = false;
    lastHeadingRef.current = 0;

    state.setCurrentStepIndex(0);
    state.setDistanceToNextTurn(
      route.instructions.length > 0 ? route.instructions[0].distance : 0,
    );
    state.setRemainingDistance(route.distance);
    state.setRemainingTime(route.time);
    state.setIsOffRoute(false);
    state.setIsFollowingUser(true);
    state.setIsNavigating(true);
    isNavigatingRef.current = true;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (route.instructions.length > 0) {
      voice.speak(route.instructions[0].text);
    }

    const started = await gps.startWatching(onLocationUpdate);
    if (!started) {
      state.setIsNavigating(false);
      isNavigatingRef.current = false;
    }
  }, [route, onLocationUpdate, voice, gps, state]);

  const stopNavigation = useCallback(() => {
    gps.stopWatching();
    isNavigatingRef.current = false;
    voice.speak("");  // clears queue via SpeechHapticsService.stop()
    state.reset();
  }, [gps, voice, state]);

  const recenterCamera = useCallback(() => {
    state.setIsFollowingUser(true);
    if (state.userPosition && mapRef.current) {
      mapRef.current.animateCamera(
        {
          center: state.userPosition,
          heading: lastHeadingRef.current,
          pitch: 45,
          zoom: 17,
          altitude: 300,
        },
        { duration: 500 },
      );
    }
  }, [state.userPosition, mapRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      gps.stopWatching();
      isNavigatingRef.current = false;
    };
  }, []);

  const currentInstruction: GeoJsonInstruction | null =
    route && state.isNavigating && state.currentStepIndex < route.instructions.length
      ? route.instructions[state.currentStepIndex]
      : null;

  const nextInstruction: GeoJsonInstruction | null =
    route && state.isNavigating && state.currentStepIndex + 1 < route.instructions.length
      ? route.instructions[state.currentStepIndex + 1]
      : null;

  return {
    isNavigating: state.isNavigating,
    startNavigation,
    stopNavigation,
    recenterCamera,
    currentStepIndex: state.currentStepIndex,
    currentInstruction,
    nextInstruction,
    distanceToNextTurn: state.distanceToNextTurn,
    remainingDistance: state.remainingDistance,
    remainingTime: state.remainingTime,
    isOffRoute: state.isOffRoute,
    isFollowingUser: state.isFollowingUser,
    setIsFollowingUser: state.setIsFollowingUser,
    userPosition: state.userPosition,
    heading: state.heading,
  };
}
