import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, TouchableOpacity, View } from "react-native";

import { ViewMode } from "./ViewModeSelector";
import { MapSearch } from "../ui/MapSearch";

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
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
      }}
    >
      <Animated.View
        style={{
          width: containerWidth,
          height: 40,
          borderRadius: 999,
          backgroundColor: "white",
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
          overflow: "hidden",
        }}
      >
        <TouchableOpacity
          onPress={handleToggleSearch}
          activeOpacity={0.7}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          
          <Animated.View
            style={{
              position: 'absolute',
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
              position: 'absolute',
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
          style={{
            flex: 1,
            marginLeft: 4,
            opacity: opacityAnim,
          }}
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
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "white",
          borderRadius: 999,
          padding: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <ModeIcon
          active={viewMode === "zones"}
          icon={
            <MaterialCommunityIcons
              name="waves"
              size={18}
              color={viewMode === "zones" ? "white" : "#4B5563"}
            />
          }
          onPress={() => onViewModeChange("zones")}
        />
        <ModeIcon
          active={viewMode === "routes"}
          icon={
            <MaterialCommunityIcons
              name="road-variant"
              size={18}
              color={viewMode === "routes" ? "white" : "#4B5563"}
            />
          }
          onPress={() => onViewModeChange("routes")}
        />
      </View>
    </View>
  );
}

interface ModeIconProps {
  active: boolean;
  icon: React.ReactNode;
  onPress: () => void;
}

function ModeIcon({ active, icon, onPress }: ModeIconProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 80,
        useNativeDriver: false,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: false,
      }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={{
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 999,
          backgroundColor: active ? "#3B82F6" : "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </TouchableOpacity>
    </Animated.View>
  );
}
