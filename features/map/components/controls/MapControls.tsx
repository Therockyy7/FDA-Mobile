// features/map/components/controls/MapControls.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState, useCallback } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { useColorScheme } from "~/lib/useColorScheme";
import { SHADOW, MAP_ICON_COLORS, MAP_OVERLAY_LAYER_COLORS } from "~/lib/design-tokens";

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

const TIMING = { duration: 180, easing: Easing.out(Easing.cubic) };
const SPRING = { stiffness: 260, damping: 22, mass: 0.8 };

function useItemAnim(delay = 0) {
  const progress = useSharedValue(0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { scale: interpolate(progress.value, [0, 1], [0.7, 1]) },
      { translateY: interpolate(progress.value, [0, 1], [14, 0]) },
    ] as any,
  })) as any;

  const show = useCallback(() => {
    progress.value = withDelay(delay, withTiming(1, TIMING));
  }, [delay, progress]);

  const hide = useCallback((onDone?: () => void) => {
    progress.value = withTiming(0, { duration: 120, easing: Easing.in(Easing.cubic) });
    if (onDone) setTimeout(onDone, 120);
  }, [progress]);

  return { animatedStyle, show, hide, progress };
}

export function MapControls({
  onZoomIn, onZoomOut, is3DEnabled = false, showLegend = true,
  onShowLegend, onToggle3D, onRotateLeft, onRotateRight,
  streetViewLocation, onClearStreetView, onShowLayers,
}: MapControlsProps) {
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(false);
  const { isDarkColorScheme } = useColorScheme();
  const isDark = isDarkColorScheme;

  const panelBg = isDark ? "rgba(15,23,42,0.95)" : "white";
  const divider = isDark ? "#334155" : "#F1F5F9";
  const iconColor = isDark ? MAP_ICON_COLORS.dark.inactive : MAP_ICON_COLORS.light.inactive;

  // FAB rotation + scale
  const fabRotate = useSharedValue(0);
  const fabScale = useSharedValue(1);

  // Per-item animations with stagger
  const streetViewAnim = useItemAnim(0);
  const layersAnim = useItemAnim(40);
  const controlsAnim = useItemAnim(80);
  const rotationAnim = useItemAnim(120);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fabStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${fabRotate.value * 180}deg` },
      { scale: fabScale.value },
    ] as any,
  })) as any;

  const open = useCallback(() => {
    setVisible(true);
    setExpanded(true);
    fabRotate.value = withSpring(1, SPRING);
    fabScale.value = withSpring(0.92, SPRING);
    streetViewAnim.show();
    layersAnim.show();
    controlsAnim.show();
    rotationAnim.show();
  }, [fabRotate, fabScale, streetViewAnim, layersAnim, controlsAnim, rotationAnim]);

  const close = useCallback(() => {
    setExpanded(false);
    fabRotate.value = withSpring(0, SPRING);
    fabScale.value = withSpring(1, SPRING);
    // hide all, unmount after last one done
    streetViewAnim.hide();
    layersAnim.hide();
    controlsAnim.hide();
    rotationAnim.hide(() => setVisible(false));
  }, [fabRotate, fabScale, streetViewAnim, layersAnim, controlsAnim, rotationAnim]);

  const toggle = useCallback(() => {
    expanded ? close() : open();
  }, [expanded, open, close]);

  return (
    <View style={styles.container}>
      {visible && (
        <View style={styles.expandedGroup} pointerEvents={expanded ? "auto" : "none"}>

          {onShowLayers && (
            <Animated.View style={layersAnim.animatedStyle}>
              <TouchableOpacity
                onPress={onShowLayers}
                testID="map-controls-layers-fab-btn"
                style={[styles.fabBlue, SHADOW.md]}
                activeOpacity={0.8}
              >
                <Ionicons name="layers" size={22} color="white" />
              </TouchableOpacity>
            </Animated.View>
          )}

          <Animated.View style={[controlsAnim.animatedStyle, styles.panel, SHADOW.md, { backgroundColor: panelBg, borderColor: divider }]}>
            {onToggle3D && (
              <>
                <TouchableOpacity
                  onPress={onToggle3D}
                  testID="map-controls-3d-btn"
                  style={[styles.iconBtn, is3DEnabled && styles.iconBtnActive]}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="rotate-3d-variant"
                    size={22}
                    color={is3DEnabled ? "white" : iconColor}
                  />
                </TouchableOpacity>
                <View style={[styles.divider, { backgroundColor: divider }]} />
              </>
            )}

            <TouchableOpacity
              onPress={onShowLegend}
              testID="map-controls-legend-btn"
              style={[styles.iconBtn, showLegend && styles.iconBtnLegend]}
              activeOpacity={0.7}
            >
              <Ionicons
                name="information-circle"
                size={22}
                color={showLegend ? "#3B82F6" : isDark ? "#94A3B8" : "#64748B"}
              />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: divider }]} />

            <TouchableOpacity onPress={onZoomIn} testID="map-controls-zoom-in-btn" style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="add" size={24} color={iconColor} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: divider }]} />

            <TouchableOpacity onPress={onZoomOut} testID="map-controls-zoom-out-btn" style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="remove" size={24} color={iconColor} />
            </TouchableOpacity>
          </Animated.View>

          {is3DEnabled && onRotateLeft && onRotateRight && (
            <Animated.View style={[rotationAnim.animatedStyle, styles.panel, SHADOW.md, { backgroundColor: panelBg, borderColor: divider }]}>
              <TouchableOpacity onPress={onRotateLeft} testID="map-controls-rotate-left-btn" style={styles.iconBtn} activeOpacity={0.7}>
                <Ionicons name="return-up-back" size={20} color="#3B82F6" />
              </TouchableOpacity>
              <View style={[styles.divider, { backgroundColor: divider }]} />
              <TouchableOpacity onPress={onRotateRight} testID="map-controls-rotate-right-btn" style={styles.iconBtn} activeOpacity={0.7}>
                <Ionicons name="return-up-forward" size={20} color="#3B82F6" />
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      )}

      {/* FAB toggle */}
      <TouchableOpacity
        onPress={toggle}
        testID="map-controls-fab-btn"
        style={[
          styles.fab,
          SHADOW.md,
          {
            backgroundColor: expanded ? "#EF4444" : MAP_OVERLAY_LAYER_COLORS.primary,
            shadowColor: expanded ? "#EF4444" : MAP_OVERLAY_LAYER_COLORS.primary,
          },
        ]}
        activeOpacity={0.85}
      >
        <Animated.View style={fabStyle}>
          <Ionicons name={expanded ? "close" : "layers"} size={26} color="white" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 10,
  },
  expandedGroup: {
    gap: 10,
    alignItems: "center",
  },
  panel: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  divider: {
    height: 1,
    width: 50,
  },
  iconBtn: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnActive: {
    backgroundColor: "#3B82F6",
  },
  iconBtnLegend: {
    backgroundColor: "#EFF6FF",
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  fabBlue: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: MAP_OVERLAY_LAYER_COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
