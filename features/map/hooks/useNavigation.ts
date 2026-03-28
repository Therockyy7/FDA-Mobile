// features/map/hooks/useNavigation.ts

import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import * as Speech from "expo-speech";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GeoJsonInstruction, LatLng } from "../types/safe-route.types";
import type { UseNavigationParams, VoiceLevel } from "../types/navigation.types";
import {
  buildInstructionBoundaries,
  buildSegmentCumulativeDist,
  computeBearing,
  getCurrentStepIndex,
  getDistanceToNextTurn,
  lerpAngle,
  snapToPolyline,
} from "../lib/navigation-utils";

export function useNavigation({ route, mapRef }: UseNavigationParams) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userPosition, setUserPosition] = useState<LatLng | null>(null);
  const [heading, setHeading] = useState(0);
  const [distanceToNextTurn, setDistanceToNextTurn] = useState(0);
  const [remainingDistance, setRemainingDistance] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isOffRoute, setIsOffRoute] = useState(false);
  const [isFollowingUser, setIsFollowingUser] = useState(true);

  const watcherRef = useRef<Location.LocationSubscription | null>(null);
  const instructionBoundariesRef = useRef<number[]>([]);
  const segmentCumulativeDistRef = useRef<number[]>([]);
  const announcedRef = useRef<Map<number, Set<VoiceLevel>>>(new Map());
  const lastHeadingRef = useRef(0);
  const offRouteAlertedRef = useRef(false);
  const isNavigatingRef = useRef(false);

  const speak = useCallback((text: string) => {
    try {
      Speech.stop();
      Speech.speak(text, { language: "vi", rate: 1.0 });
    } catch {
      // TTS failure should not break navigation
    }
  }, []);

  const announceForStep = useCallback(
    (stepIndex: number, level: VoiceLevel, instruction: GeoJsonInstruction) => {
      if (!announcedRef.current.has(stepIndex)) {
        announcedRef.current.set(stepIndex, new Set());
      }
      const levels = announcedRef.current.get(stepIndex)!;
      if (levels.has(level)) return;
      levels.add(level);

      switch (level) {
        case "early":
          speak(`Sau 500 mét, ${instruction.text}`);
          break;
        case "approach":
          speak(instruction.text);
          break;
        case "now":
          speak(`${instruction.text} ngay bây giờ`);
          break;
      }
    },
    [speak]
  );

  const onLocationUpdate = useCallback(
    (location: Location.LocationObject) => {
      if (!route || !isNavigatingRef.current) return;

      const pos: LatLng = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setUserPosition(pos);

      const polyline = route.coordinates;
      const segCumDist = segmentCumulativeDistRef.current;
      const boundaries = instructionBoundariesRef.current;

      // Snap to polyline
      const snap = snapToPolyline(pos, polyline, segCumDist);

      // Off-route check
      if (snap.distanceFromRoute > 50) {
        setIsOffRoute(true);
        if (!offRouteAlertedRef.current) {
          offRouteAlertedRef.current = true;
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          speak("Bạn đã lạc đường. Hãy quay lại tuyến đường.");
        }
      } else {
        setIsOffRoute(false);
        offRouteAlertedRef.current = false;
      }

      // Current step
      const stepIdx = getCurrentStepIndex(snap.progressMeters, boundaries);
      const dist = getDistanceToNextTurn(snap.progressMeters, boundaries, stepIdx);

      setCurrentStepIndex(stepIdx);
      setDistanceToNextTurn(dist);

      // Remaining
      const remDist = Math.max(0, route.distance - snap.progressMeters);
      setRemainingDistance(remDist);
      setRemainingTime(
        route.distance > 0 ? (remDist / route.distance) * route.time : 0
      );

      // Voice announcements (3-level)
      if (stepIdx < route.instructions.length) {
        const inst = route.instructions[stepIdx];
        if (dist < 30) {
          announceForStep(stepIdx, "now", inst);
        } else if (dist < 150) {
          announceForStep(stepIdx, "approach", inst);
        } else if (dist < 500) {
          announceForStep(stepIdx, "early", inst);
        }
      }

      // Destination reached
      if (
        stepIdx >= route.instructions.length - 1 &&
        dist < 20 &&
        remDist < 30
      ) {
        speak("Bạn đã đến nơi.");
        stopNavigation();
        return;
      }

      // Heading & camera
      const nextPointIdx = Math.min(snap.segmentIndex + 1, polyline.length - 1);
      const rawHeading = computeBearing(pos, polyline[nextPointIdx]);
      const smoothed = lerpAngle(lastHeadingRef.current, rawHeading, 0.15);
      lastHeadingRef.current = smoothed;
      setHeading(smoothed);

      // Camera follow
      if (isFollowingUser && mapRef.current) {
        const pitch = dist < 200 ? 20 : 45;
        mapRef.current.animateCamera(
          {
            center: pos,
            heading: smoothed,
            pitch,
            zoom: 17,
            altitude: 300,
          },
          { duration: 500 }
        );
      }
    },
    [route, mapRef, isFollowingUser, speak, announceForStep]
  );

  const startNavigation = useCallback(async () => {
    if (!route || route.coordinates.length < 2) return;

    // Precompute
    segmentCumulativeDistRef.current = buildSegmentCumulativeDist(
      route.coordinates
    );
    instructionBoundariesRef.current = buildInstructionBoundaries(
      route.instructions
    );
    announcedRef.current = new Map();
    offRouteAlertedRef.current = false;
    lastHeadingRef.current = 0;

    setCurrentStepIndex(0);
    setDistanceToNextTurn(
      route.instructions.length > 0 ? route.instructions[0].distance : 0
    );
    setRemainingDistance(route.distance);
    setRemainingTime(route.time);
    setIsOffRoute(false);
    setIsFollowingUser(true);
    setIsNavigating(true);
    isNavigatingRef.current = true;

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Announce first instruction
    if (route.instructions.length > 0) {
      speak(route.instructions[0].text);
    }

    // Start GPS watch
    try {
      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1500,
          distanceInterval: 5,
        },
        onLocationUpdate
      );
      watcherRef.current = sub;
    } catch {
      // Location watch failed — stop
      setIsNavigating(false);
      isNavigatingRef.current = false;
    }
  }, [route, onLocationUpdate, speak]);

  const stopNavigation = useCallback(() => {
    watcherRef.current?.remove();
    watcherRef.current = null;
    isNavigatingRef.current = false;

    try {
      Speech.stop();
    } catch {
      // ignore
    }

    setIsNavigating(false);
    setCurrentStepIndex(0);
    setUserPosition(null);
    setHeading(0);
    setDistanceToNextTurn(0);
    setRemainingDistance(0);
    setRemainingTime(0);
    setIsOffRoute(false);
    setIsFollowingUser(true);
  }, []);

  const recenterCamera = useCallback(() => {
    setIsFollowingUser(true);
    if (userPosition && mapRef.current) {
      mapRef.current.animateCamera(
        {
          center: userPosition,
          heading: lastHeadingRef.current,
          pitch: 45,
          zoom: 17,
          altitude: 300,
        },
        { duration: 500 }
      );
    }
  }, [userPosition, mapRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      watcherRef.current?.remove();
      watcherRef.current = null;
      isNavigatingRef.current = false;
      try {
        Speech.stop();
      } catch {
        // ignore
      }
    };
  }, []);

  const currentInstruction: GeoJsonInstruction | null =
    route && isNavigating && currentStepIndex < route.instructions.length
      ? route.instructions[currentStepIndex]
      : null;

  const nextInstruction: GeoJsonInstruction | null =
    route && isNavigating && currentStepIndex + 1 < route.instructions.length
      ? route.instructions[currentStepIndex + 1]
      : null;

  return {
    isNavigating,
    startNavigation,
    stopNavigation,
    recenterCamera,
    currentStepIndex,
    currentInstruction,
    nextInstruction,
    distanceToNextTurn,
    remainingDistance,
    remainingTime,
    isOffRoute,
    isFollowingUser,
    setIsFollowingUser,
    userPosition,
    heading,
  };
}
