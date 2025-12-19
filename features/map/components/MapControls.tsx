// features/map/components/MapControls.tsx
import { Ionicons } from "@expo/vector-icons";

import React from "react";
import { TouchableOpacity, View } from "react-native";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onMyLocation: () => void;
  is3DEnabled?: boolean;
  onToggle3D?: () => void;
  showLegend?: boolean;
  onShowLegend?: () => void;
  onRotateLeft?: () => void;
  onRotateRight?: () => void;
  streetViewLocation?: { latitude: number; longitude: number } | null;
  onClearStreetView?: () => void;
  onShowIsRouting?: () => void;
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onMyLocation,
  is3DEnabled = false,
  showLegend = true,
  onShowLegend,
  onToggle3D,
  onRotateLeft,
  onRotateRight,
  streetViewLocation,
  onClearStreetView,
  onShowIsRouting
}: MapControlsProps) {
  return (
    <View style={{ gap: 12 }}>
      {/* ✅ Clear Street View Marker */}
      {streetViewLocation && onClearStreetView && (
        <TouchableOpacity
          onPress={onClearStreetView}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: "#F59E0B",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      )}

      <TouchableOpacity
                    onPress={onShowIsRouting}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: "#2563EB",
                      alignItems: "center",
                      justifyContent: "center",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.18,
                      shadowRadius: 4,
                      elevation: 4,
                    }}
                  >
                    <Ionicons name="navigate" size={22} color="white" />
                  </TouchableOpacity>

      {/* 3D Toggle Button */}
      {onToggle3D && (
        <TouchableOpacity
          onPress={onToggle3D}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: is3DEnabled ? "#3B82F6" : "white",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="cube-outline"
            size={24}
            color={is3DEnabled ? "white" : "#1F2937"}
          />
        </TouchableOpacity>
      )}

      <TouchableOpacity
          onPress={onShowLegend}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: showLegend ? "#3B82F6" : "white",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="information-circle-outline" size={24} color="black" />
        </TouchableOpacity>

      {/* Rotation Controls */}
      {is3DEnabled && onRotateLeft && onRotateRight && (
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
            overflow: "hidden",
          }}
        >
          <TouchableOpacity
            onPress={onRotateLeft}
            style={{
              width: 48,
              height: 48,
              alignItems: "center",
              justifyContent: "center",
              borderBottomWidth: 1,
              borderBottomColor: "#F3F4F6",
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#1F2937" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onRotateRight}
            style={{
              width: 48,
              height: 48,
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-forward" size={20} color="#1F2937" />
          </TouchableOpacity>
        </View>
      )}

      {/* Standard Controls */}
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 24,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
          overflow: "hidden",
        }}
      >
        <TouchableOpacity
          onPress={onZoomIn}
          style={{
            width: 48,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
            borderBottomWidth: 1,
            borderBottomColor: "#F3F4F6",
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color="#1F2937" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onZoomOut}
          style={{
            width: 48,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="remove" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={onMyLocation}
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: "white",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="locate" size={24} color="#3B82F6" />
      </TouchableOpacity>
    </View>
  );
}
