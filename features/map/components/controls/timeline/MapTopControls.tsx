// features/map/components/controls/timeline/MapTopControls.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, TouchableOpacity, View } from "react-native";
import { MapSearch } from "../MapSearch";
import { ModeIcon } from "./ModeIcon";
import type { ViewMode } from "../selectors/ViewModeSelector";

interface MapTopControlsProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function MapTopControls({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: MapTopControlsProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const widthAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const toValue = searchOpen ? 1 : 0;
    Animated.parallel([
      Animated.timing(widthAnim, {
        toValue,
        duration: 220,
        easing: searchOpen ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue,
        duration: searchOpen ? 160 : 120,
        useNativeDriver: false,
      }),
    ]).start();
  }, [searchOpen, widthAnim, opacityAnim]);

  const containerWidth = widthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 260],
  });

  const handleToggleSearch = () => {
    if (searchOpen && searchQuery.length > 0) {
      onSearchChange("");
    }
    setSearchOpen((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <Animated.View style={[styles.searchBar, { width: containerWidth }]}>
        <TouchableOpacity
          onPress={handleToggleSearch}
          activeOpacity={0.7}
          style={styles.searchIcon}
        >
          <Animated.View
            style={{
              position: "absolute",
              opacity: widthAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [1, 0, 0],
              }),
            }}
          >
            <Ionicons name="search" size={18} color="#4B5563" />
          </Animated.View>
          <Animated.View
            style={{
              position: "absolute",
              opacity: widthAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 0, 1],
              }),
            }}
          >
            <Ionicons name="close" size={18} color="#4B5563" />
          </Animated.View>
        </TouchableOpacity>

        <Animated.View
          style={{ flex: 1, marginLeft: 4, opacity: opacityAnim }}
          pointerEvents={searchOpen ? "auto" : "none"}
        >
          <MapSearch
            value={searchQuery}
            onChangeText={onSearchChange}
            onClear={() => onSearchChange("")}
          />
        </Animated.View>
      </Animated.View>

      {/* Mode icons */}
      <View style={styles.modeBar}>
        <ModeIcon
          active={viewMode === "zones"}
          viewMode="zones"
          onPress={() => onViewModeChange("zones")}
        />
        <ModeIcon
          active={viewMode === "routes"}
          viewMode="routes"
          onPress={() => onViewModeChange("routes")}
        />
      </View>
    </View>
  );
}

const styles = {
  container: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    gap: 8,
  },
  searchBar: {
    height: 40,
    borderRadius: 999,
    backgroundColor: "white",
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden" as const,
  },
  searchIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  modeBar: {
    flexDirection: "row" as const,
    backgroundColor: "white",
    borderRadius: 999,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
};
