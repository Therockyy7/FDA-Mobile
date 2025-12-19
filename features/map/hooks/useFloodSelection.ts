import { useCallback, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import { FloodRoute, FloodZone } from "../constants/map-data";

export function useFloodSelection() {
  const [selectedZone, setSelectedZone] = useState<FloodZone | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<FloodRoute | null>(null);
  const [showDetailPanels, setShowDetailPanels] = useState(true);

  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (selectedZone || selectedRoute) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedZone, selectedRoute, slideAnim]);

  const clearSelection = useCallback(() => {
    setSelectedZone(null);
    setSelectedRoute(null);
  }, []);

  return {
    selectedZone,
    setSelectedZone,
    selectedRoute,
    setSelectedRoute,
    showDetailPanels,
    setShowDetailPanels,
    slideAnim,
    clearSelection,
  };
}
