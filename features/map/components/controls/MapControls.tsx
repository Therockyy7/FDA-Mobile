// features/map/components/MapControls.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { AnimatePresence, MotiView } from "moti";
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
  onShowLayers?: () => void; // NEW: Open layer toggle sheet
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
  onShowIsRouting,
  onShowLayers,
}: MapControlsProps) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <View style={{ alignItems: "center", gap: 10 }}>
      {/* Expanded Controls */}
      <View style={{ gap: 10, alignItems: "center" }}>
        <AnimatePresence>
          {expanded && (
            <View style={{ gap: 10, alignItems: "center" }}>
              {/* Clear Street View Marker */}
              {streetViewLocation && onClearStreetView && (
                <MotiView
                  from={{ opacity: 0, scale: 0.5, translateY: 20 }}
                  animate={{ opacity: 1, scale: 1, translateY: 0 }}
                  exit={{ opacity: 0, scale: 0.5, translateY: 10 }}
                  transition={{ type: "timing", duration: 200 }}
                >
                  <TouchableOpacity
                    onPress={onClearStreetView}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      backgroundColor: "#F59E0B",
                      alignItems: "center",
                      justifyContent: "center",
                      shadowColor: "#F59E0B",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.4,
                      shadowRadius: 8,
                      elevation: 6,
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="eye-off" size={22} color="white" />
                  </TouchableOpacity>
                </MotiView>
              )}

              {/* Navigation Button */}
              <MotiView
                from={{ opacity: 0, scale: 0.5, translateY: 20 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                exit={{ opacity: 0, scale: 0.5, translateY: 10 }}
                transition={{ type: "timing", duration: 250, delay: 50 }}
              >
                <TouchableOpacity
                  onPress={onShowIsRouting}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: "#3B82F6",
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#3B82F6",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.35,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="navigate" size={22} color="white" />
                </TouchableOpacity>
              </MotiView>

              {/* Control Group */}
              <MotiView
                from={{ opacity: 0, scale: 0.8, translateY: 20 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                exit={{ opacity: 0, scale: 0.8, translateY: 10 }}
                transition={{ type: "timing", duration: 300, delay: 100 }}
                style={{
                  backgroundColor: "white",
                  borderRadius: 20,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.12,
                  shadowRadius: 12,
                  elevation: 6,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: "#F1F5F9",
                }}
              >
                {/* 3D Toggle */}
                {onToggle3D && (
                  <>
                    <TouchableOpacity
                      onPress={onToggle3D}
                      style={{
                        width: 50,
                        height: 50,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: is3DEnabled ? "#3B82F6" : "white",
                      }}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons
                        name="rotate-3d-variant"
                        size={22}
                        color={is3DEnabled ? "white" : "#1F2937"}
                      />
                    </TouchableOpacity>
                    <View style={{ height: 1, backgroundColor: "#F1F5F9" }} />
                  </>
                )}

                {/* Legend Toggle */}
                <TouchableOpacity
                  onPress={onShowLegend}
                  style={{
                    width: 50,
                    height: 50,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: showLegend ? "#EFF6FF" : "white",
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="information-circle"
                    size={22}
                    color={showLegend ? "#3B82F6" : "#64748B"}
                  />
                </TouchableOpacity>

                <View style={{ height: 1, backgroundColor: "#F1F5F9" }} />

                {/* Zoom In */}
                <TouchableOpacity
                  onPress={onZoomIn}
                  style={{
                    width: 50,
                    height: 50,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={24} color="#1F2937" />
                </TouchableOpacity>

                <View style={{ height: 1, backgroundColor: "#F1F5F9" }} />

                {/* Zoom Out */}
                <TouchableOpacity
                  onPress={onZoomOut}
                  style={{
                    width: 50,
                    height: 50,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove" size={24} color="#1F2937" />
                </TouchableOpacity>
              </MotiView>

              {/* Rotation Controls (3D mode only) */}
              {is3DEnabled && onRotateLeft && onRotateRight && (
                <MotiView
                  from={{ opacity: 0, scale: 0.8, translateY: 20 }}
                  animate={{ opacity: 1, scale: 1, translateY: 0 }}
                  exit={{ opacity: 0, scale: 0.8, translateY: 10 }}
                  transition={{ type: "timing", duration: 300, delay: 150 }}
                  style={{
                    backgroundColor: "white",
                    borderRadius: 20,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.12,
                    shadowRadius: 12,
                    elevation: 6,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: "#F1F5F9",
                  }}
                >
                  <TouchableOpacity
                    onPress={onRotateLeft}
                    style={{
                      width: 50,
                      height: 44,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="return-up-back" size={20} color="#3B82F6" />
                  </TouchableOpacity>
                  <View style={{ height: 1, backgroundColor: "#F1F5F9" }} />
                  <TouchableOpacity
                    onPress={onRotateRight}
                    style={{
                      width: 50,
                      height: 44,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="return-up-forward"
                      size={20}
                      color="#3B82F6"
                    />
                  </TouchableOpacity>
                </MotiView>
              )}

              {/* My Location */}
              <MotiView
                from={{ opacity: 0, scale: 0.5, translateY: 20 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                exit={{ opacity: 0, scale: 0.5, translateY: 10 }}
                transition={{ type: "timing", duration: 250, delay: 200 }}
              >
                <TouchableOpacity
                  onPress={onMyLocation}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: "white",
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.12,
                    shadowRadius: 12,
                    elevation: 6,
                    borderWidth: 2,
                    borderColor: "#3B82F6",
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="locate" size={22} color="#3B82F6" />
                </TouchableOpacity>
              </MotiView>
            </View>
          )}
        </AnimatePresence>
      </View>

      {/* Main Toggle Button */}
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: expanded ? "#EF4444" : "#3B82F6",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: expanded ? "#EF4444" : "#3B82F6",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
          borderWidth: 2,
          borderColor: "white",
        }}
        activeOpacity={0.8}
      >
        <MotiView
          key={expanded ? "close" : "menu"}
          from={{ rotate: "0deg", scale: 0.5 }}
          animate={{ rotate: "180deg", scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <Ionicons
            name={expanded ? "close" : "layers"}
            size={26}
            color="white"
          />
        </MotiView>
      </TouchableOpacity>
    </View>
  );
}
