// features/map/hooks/navigation/useNavigationState.ts
// Pure state container for navigation — no side effects.

import { useState } from "react";
import type { LatLng } from "../../types/safe-route.types";

export function useNavigationState() {
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userPosition, setUserPosition] = useState<LatLng | null>(null);
  const [heading, setHeading] = useState(0);
  const [distanceToNextTurn, setDistanceToNextTurn] = useState(0);
  const [remainingDistance, setRemainingDistance] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isOffRoute, setIsOffRoute] = useState(false);
  const [isFollowingUser, setIsFollowingUser] = useState(true);

  const reset = () => {
    setIsNavigating(false);
    setCurrentStepIndex(0);
    setUserPosition(null);
    setHeading(0);
    setDistanceToNextTurn(0);
    setRemainingDistance(0);
    setRemainingTime(0);
    setIsOffRoute(false);
    setIsFollowingUser(true);
  };

  return {
    isNavigating, setIsNavigating,
    currentStepIndex, setCurrentStepIndex,
    userPosition, setUserPosition,
    heading, setHeading,
    distanceToNextTurn, setDistanceToNextTurn,
    remainingDistance, setRemainingDistance,
    remainingTime, setRemainingTime,
    isOffRoute, setIsOffRoute,
    isFollowingUser, setIsFollowingUser,
    reset,
  };
}
