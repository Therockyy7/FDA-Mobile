// features/map/components/controls/MapControls.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useColorScheme } from "~/lib/useColorScheme";
import { OVERLAY_SHADOW, RADIUS } from "~/features/map/lib/map-ui-utils";
import { RotationControls } from "./RotationControls";
import { StreetViewClearButton } from "./StreetViewClearButton";
import { ZoomControls } from "./ZoomControls";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  is3DEnabled?: boolean;
  onToggle3D?: () => void;
  showLegend?: boolean;
  onShowLegend?: () => void;
  onRotateLeft?: () => void;
  onRotateRight?: () => void;
  streetViewLocation?: { latitude: number; longitude: number } | null;
  onClearStreetView?: () => void;
  onShowLayers?: () => void;
}

export function MapControls({
  onZoomIn, onZoomOut, is3DEnabled = false, showLegend = true,
  onShowLegend, onToggle3D, onRotateLeft, onRotateRight,
  streetViewLocation, onClearStreetView, onShowLayers,
}: MapControlsProps) {
  const [expanded, setExpanded] = useState(false);
  const { isDarkColorScheme } = useColorScheme();
  const isDark = isDarkColorScheme;

  const panelBg = isDark ? "rgba(15,23,42,0.95)" : "rgba(255,255,255,0.97)";
  const divider = isDark ? "#334155" : "#F1F5F9";
  const primary = "#3B82F6";
  const fabColor = expanded ? "#EF4444" : primary;

  return (
    <View style={styles.container}>
      {expanded && (
        <View style={[styles.panel, OVERLAY_SHADOW, { backgroundColor: panelBg, borderColor: divider }]}>
          {streetViewLocation && onClearStreetView && (
            <>
              <StreetViewClearButton onPress={onClearStreetView} />
              <View style={[styles.divider, { backgroundColor: divider }]} />
            </>
          )}

          {onShowLayers && (
            <TouchableOpacity onPress={onShowLayers} style={styles.iconBtn} activeOpacity={0.75}>
              <Ionicons name="layers" size={18} color={primary} />
            </TouchableOpacity>
          )}

          {onToggle3D && (
            <>
              <View style={[styles.divider, { backgroundColor: divider }]} />
              <TouchableOpacity
                onPress={onToggle3D}
                style={[styles.iconBtn, is3DEnabled && { backgroundColor: primary }]}
                activeOpacity={0.75}
              >
                <MaterialCommunityIcons
                  name="rotate-3d-variant"
                  size={18}
                  color={is3DEnabled ? "white" : isDark ? "#94A3B8" : "#4B5563"}
                />
              </TouchableOpacity>
            </>
          )}

          <View style={[styles.divider, { backgroundColor: divider }]} />

          <TouchableOpacity
            onPress={onShowLegend!}
            style={[styles.iconBtn, showLegend && { backgroundColor: "#EFF6FF" }]}
            activeOpacity={0.75}
          >
            <Ionicons
              name="information-circle"
              size={18}
              color={showLegend ? primary : isDark ? "#94A3B8" : "#64748B"}
            />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: divider }]} />

          <ZoomControls onZoomIn={onZoomIn} onZoomOut={onZoomOut} />
        </View>
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={[styles.fab, { backgroundColor: fabColor }]}
        activeOpacity={0.8}
      >
        <Ionicons name={expanded ? "close" : "add"} size={22} color="white" />
      </TouchableOpacity>

      {expanded && is3DEnabled && onRotateLeft && onRotateRight && (
        <View style={[styles.rotationWrap, OVERLAY_SHADOW, { backgroundColor: panelBg, borderColor: divider }]}>
          <RotationControls onRotateLeft={onRotateLeft} onRotateRight={onRotateRight} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center" },
  panel: {
    borderRadius: RADIUS.sheet,
    padding: 6,
    gap: 0,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 8,
  },
  divider: { width: 28, height: StyleSheet.hairlineWidth, marginVertical: 3 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.2)",
  },
  rotationWrap: {
    borderRadius: RADIUS.sheet,
    padding: 6,
    borderWidth: 1,
    marginTop: 6,
  },
});