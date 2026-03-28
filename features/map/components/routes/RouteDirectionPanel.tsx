// features/map/components/routes/RouteDirectionPanel.tsx
// Google Maps-style: compact header (inputs only) + bottom action bar
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StatusBar,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import type { LatLng } from "../../types/safe-route.types";
import type { TransportMode, RouteDirectionPanelProps } from "../../types/routing.types";
import { PlaceSearchSheet } from "./PlaceSearchSheet";

export type { TransportMode };

export function RouteDirectionPanel({
  visible,
  onClose,
  originText,
  onOriginChange,
  isUsingGPSOrigin,
  onUseGPSAsOrigin,
  onPickOriginOnMap,
  hasOriginCoord,
  onOriginPlaceSelected,
  destinationText,
  onDestinationChange,
  isUsingGPSDest,
  onUseGPSAsDest,
  onPickDestinationOnMap,
  hasDestinationCoord,
  onDestinationPlaceSelected,
  onSwap,
  transportMode,
  onModeChange,
  onFindRoute,
  isLoading,
  error,
}: RouteDirectionPanelProps) {
  const insets = useSafeAreaInsets();
  const [searchTarget, setSearchTarget] = useState<
    "origin" | "dest" | null
  >(null);

  if (!visible) return null;

  const hasOrigin = isUsingGPSOrigin || hasOriginCoord;
  const hasDest =
    isUsingGPSDest || hasDestinationCoord || destinationText.trim().length > 0;
  const canFindRoute = hasOrigin && hasDest;
  const isDisabled = isLoading || !canFindRoute;

  const handleSearchSelect = (coord: LatLng, label: string) => {
    if (searchTarget === "origin") {
      onOriginChange(label);
      onOriginPlaceSelected?.(coord, label);
    } else if (searchTarget === "dest") {
      onDestinationChange(label);
      onDestinationPlaceSelected?.(coord, label);
    }
    setSearchTarget(null);
  };

  const handleSearchPickOnMap = () => {
    if (searchTarget === "origin") {
      onPickOriginOnMap();
    } else {
      onPickDestinationOnMap();
    }
    setSearchTarget(null);
  };

  const handleSearchUseGPS = () => {
    if (searchTarget === "origin") {
      onUseGPSAsOrigin();
    } else {
      onUseGPSAsDest();
    }
    setSearchTarget(null);
  };

  const topPadding =
    Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 4 : insets.top;

  return (
    <>
      {/* ===== TOP HEADER: Back + Inputs + Swap (like Google Maps) ===== */}
      <View
        style={{
          backgroundColor: "white",
          paddingTop: topPadding,
          paddingBottom: 14,
          paddingHorizontal: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          {/* Back button */}
          <TouchableOpacity
            onPress={onClose}
            disabled={isLoading}
            style={{
              width: 38,
              height: 38,
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#374151" />
          </TouchableOpacity>

          {/* Dot connector + inputs */}
          <View style={{ flex: 1, flexDirection: "row", gap: 8 }}>
            {/* Dot connector */}
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 4,
                width: 12,
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#007AFF",
                }}
              />
              <View
                style={{
                  width: 1.5,
                  flex: 1,
                  backgroundColor: "#D1D5DB",
                  marginVertical: 2,
                }}
              />
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  backgroundColor: "#EF4444",
                }}
              />
            </View>

            {/* Two input fields */}
            <View style={{ flex: 1, gap: 8 }}>
              <LocationInput
                label={
                  isUsingGPSOrigin
                    ? "Vị trí hiện tại"
                    : originText || undefined
                }
                placeholder="Chọn điểm đi"
                isGPS={isUsingGPSOrigin}
                hasCoord={hasOriginCoord}
                onPress={() => setSearchTarget("origin")}
                disabled={!!isLoading}
              />
              <LocationInput
                label={
                  isUsingGPSDest
                    ? "Vị trí hiện tại"
                    : destinationText || undefined
                }
                placeholder="Chọn điểm đến"
                isGPS={isUsingGPSDest}
                hasCoord={hasDestinationCoord}
                onPress={() => setSearchTarget("dest")}
                disabled={!!isLoading}
              />
            </View>
          </View>

          {/* Swap button */}
          <TouchableOpacity
            onPress={onSwap}
            disabled={isLoading}
            style={{
              width: 38,
              height: 38,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="swap-vertical" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ===== BOTTOM BAR: Transport + Find Route (like Google Maps) ===== */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          paddingBottom: insets.bottom + 8,
        }}
      >
        {/* Error message */}
        {error && (
          <View
            style={{
              marginHorizontal: 16,
              marginBottom: 8,
              backgroundColor: "#FEF2F2",
              borderRadius: 12,
              padding: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Ionicons name="alert-circle" size={16} color="#DC2626" />
            <Text style={{ fontSize: 12, color: "#DC2626", flex: 1 }}>
              {error}
            </Text>
          </View>
        )}

        {/* Action bar */}
        <View
          style={{
            marginHorizontal: 16,
            backgroundColor: "white",
            borderRadius: 16,
            paddingVertical: 10,
            paddingHorizontal: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          {/* Transport mode selector */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "#F3F4F6",
              borderRadius: 999,
              padding: 3,
            }}
          >
            <TransportIcon
              active={transportMode === "car"}
              icon={
                <Ionicons
                  name="car"
                  size={16}
                  color={transportMode === "car" ? "white" : "#6B7280"}
                />
              }
              onPress={() => onModeChange("car")}
            />
            <TransportIcon
              active={transportMode === "motorbike"}
              icon={
                <MaterialCommunityIcons
                  name="motorbike"
                  size={16}
                  color={
                    transportMode === "motorbike" ? "white" : "#6B7280"
                  }
                />
              }
              onPress={() => onModeChange("motorbike")}
            />
            <TransportIcon
              active={transportMode === "bicycle"}
              icon={
                <Ionicons
                  name="bicycle"
                  size={16}
                  color={transportMode === "bicycle" ? "white" : "#6B7280"}
                />
              }
              onPress={() => onModeChange("bicycle")}
            />
            <TransportIcon
              active={transportMode === "walk"}
              icon={
                <Ionicons
                  name="walk"
                  size={16}
                  color={transportMode === "walk" ? "white" : "#6B7280"}
                />
              }
              onPress={() => onModeChange("walk")}
            />
          </View>

          {/* Find route button */}
          <TouchableOpacity
            onPress={onFindRoute}
            disabled={isDisabled}
            activeOpacity={0.8}
            style={{
              flex: 1,
              backgroundColor: isDisabled ? "#93C5FD" : "#2563EB",
              borderRadius: 999,
              paddingVertical: 12,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="navigate" size={16} color="white" />
            )}
            <Text
              style={{
                color: "white",
                fontWeight: "700",
                fontSize: 14,
              }}
            >
              {isLoading ? "Đang tìm đường..." : "Tìm đường an toàn"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Fullscreen Place Search Sheet */}
      <PlaceSearchSheet
        visible={searchTarget !== null}
        onClose={() => setSearchTarget(null)}
        onSelectPlace={handleSearchSelect}
        onPickOnMap={handleSearchPickOnMap}
        onUseGPS={handleSearchUseGPS}
        showGPSOption={searchTarget === "origin"}
        placeholder={
          searchTarget === "origin"
            ? "Tìm điểm đi..."
            : "Tìm điểm đến..."
        }
        accentColor={searchTarget === "origin" ? "#22C55E" : "#4F46E5"}
        initialQuery={
          searchTarget === "origin"
            ? isUsingGPSOrigin
              ? ""
              : originText
            : isUsingGPSDest
              ? ""
              : destinationText
        }
      />
    </>
  );
}

// ==================== SUB-COMPONENTS ====================

function LocationInput({
  label,
  placeholder,
  isGPS,
  onPress,
  disabled,
}: {
  label?: string;
  placeholder: string;
  isGPS: boolean;
  hasCoord?: boolean;
  onPress: () => void;
  disabled: boolean;
}) {
  const hasValue = isGPS || (label && label.length > 0);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.6}
      style={{
        backgroundColor: "#F3F4F6",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: hasValue ? "#E5E7EB" : "#F3F4F6",
      }}
    >
      <Text
        style={{
          fontSize: 14,
          color: hasValue
            ? isGPS
              ? "#2563EB"
              : "#111827"
            : "#9CA3AF",
          fontWeight: hasValue ? "500" : "400",
        }}
        numberOfLines={1}
      >
        {hasValue ? label : placeholder}
      </Text>
    </TouchableOpacity>
  );
}

function TransportIcon({
  active,
  icon,
  onPress,
}: {
  active: boolean;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: active ? "#2563EB" : "transparent",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </TouchableOpacity>
  );
}
