// features/map/hooks/useNavigation.ts
// Composition hook: wires navigation state, voice, GPS, and location tracking.

import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef } from "react";
import type { GeoJsonInstruction } from "../types/safe-route.types";
import type { UseNavigationParams } from "../types/navigation.types";
import { buildInstructionBoundaries, buildSegmentCumulativeDist } from "../lib/navigation-utils";
import { translateInstruction } from "../lib/instruction-translator";
import { useNavigationState } from "./navigation/useNavigationState";
import { useNavigationVoice } from "./navigation/useNavigationVoice";
import { useGPSWatcher } from "./navigation/useGPSWatcher";
import { useNavigationTracking } from "./navigation/useNavigationTracking";

export function useNavigation({ route, mapRef, onOffRoute }: UseNavigationParams) {
  const state = useNavigationState();
  const voice = useNavigationVoice();
  const gps = useGPSWatcher();

  const instructionBoundariesRef = useRef<number[]>([]);
  const segmentCumulativeDistRef = useRef<number[]>([]);
  const lastHeadingRef = useRef(0);
  const offRouteAlertedRef = useRef(false);
  const isNavigatingRef = useRef(false);
  const progressMetersRef = useRef(0);

  const stopNavigation = useCallback(() => {
    gps.stopWatching();
    isNavigatingRef.current = false;
    voice.speak("");
    state.reset();
  }, [gps, voice, state]);

  const onLocationUpdate = useNavigationTracking({
    route,
    mapRef,
    refs: {
      instructionBoundariesRef,
      segmentCumulativeDistRef,
      lastHeadingRef,
      offRouteAlertedRef,
      isNavigatingRef,
      progressMetersRef,
    },
    state,
    voice,
    onOffRoute,
    stopNavigation,
  });

  const startNavigation = useCallback(async () => {
    if (!route || route.coordinates.length < 2) return;

    segmentCumulativeDistRef.current = buildSegmentCumulativeDist(route.coordinates);
    instructionBoundariesRef.current = buildInstructionBoundaries(route.instructions);
    voice.resetAnnounced();
    offRouteAlertedRef.current = false;
    lastHeadingRef.current = 0;
    progressMetersRef.current = 0;

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
      voice.speak(translateInstruction(route.instructions[0].text));
    }

    const started = await gps.startWatching(onLocationUpdate);
    if (!started) {
      state.setIsNavigating(false);
      isNavigatingRef.current = false;
    }
  }, [route, onLocationUpdate, voice, gps, state]);

  const recenterCamera = useCallback(() => {
    state.setIsFollowingUser(true);
    if (state.userPosition && mapRef.current) {
      mapRef.current.animateCamera(
        { center: state.userPosition, heading: lastHeadingRef.current, pitch: 45, zoom: 17, altitude: 300 },
        { duration: 500 },
      );
    }
  }, [state.userPosition, mapRef]);

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
    progressMeters: progressMetersRef,
    segmentCumulativeDist: segmentCumulativeDistRef,
  };
}
