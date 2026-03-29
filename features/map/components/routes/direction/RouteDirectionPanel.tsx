// features/map/components/routes/RouteDirectionPanel.tsx
// Google Maps-style: pill → 2-row expanded → bottom bar
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StatusBar,
  TouchableOpacity,
  View,
} from "react-native";
import { Image as RNImage } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import type { LatLng } from "../../../types/safe-route.types";
import type { User } from "~/features/auth/stores/auth.slice";
import type { RouteDirectionPanelProps } from "../../../types/routing.types";
import { PlaceSearchSheet } from "../sheets/PlaceSearchSheet";
import { TransportModeButton } from "./TransportModeButton";

type Phase = "idle" | "ready";

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
  user,
  onProfilePress,
}: RouteDirectionPanelProps & { user: User | null; onProfilePress?: () => void }) {
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>("idle");
  const [searchTarget, setSearchTarget] = useState<"origin" | "dest" | null>(null);

  if (!visible) return null;

  const hasDestination = isUsingGPSDest || hasDestinationCoord || destinationText.trim().length > 0;
  const isDisabled = isLoading || !hasDestination;
  const isReady = phase === "ready";

  const handleBack = () => {
    if (phase === "idle") {
      onClose();
    } else {
      setPhase("idle");
    }
  };

  const handleSearchSelect = (coord: LatLng, label: string) => {
    if (searchTarget === "origin") {
      onOriginChange(label);
      onOriginPlaceSelected?.(coord, label);
    } else if (searchTarget === "dest") {
      onDestinationChange(label);
      onDestinationPlaceSelected?.(coord, label);
      setPhase("ready");
    }
    setSearchTarget(null);
  };

  const handleSearchPickOnMap = () => {
    if (searchTarget === "origin") {
      onPickOriginOnMap();
    } else {
      onPickDestinationOnMap();
      setPhase("ready");
    }
    setSearchTarget(null);
  };

  const handleSearchUseGPS = () => {
    if (searchTarget === "origin") {
      onUseGPSAsOrigin();
    } else {
      onUseGPSAsDest();
      setPhase("ready");
    }
    setSearchTarget(null);
  };

  const topPadding =
    Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 4 : insets.top;

  // ─── IDLE: Single pill ───────────────────────────────
  if (!isReady) {
    return (
      <>
        <View
          style={{
            position: "absolute",
            top: topPadding,
            left: 0,
            right: 0,
            zIndex: 50,
            paddingHorizontal: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "white",
              borderRadius: 28,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              paddingVertical: 4,
              paddingHorizontal: 6,
              minHeight: 52,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            {/* Search icon */}
            <Ionicons
              name="search"
              size={18}
              color="#9CA3AF"
              style={{ marginRight: 8, marginLeft: 6, flexShrink: 0 }}
            />

            {/* Destination input */}
            <TouchableOpacity
              onPress={() => setSearchTarget("dest")}
              disabled={!!isLoading}
              activeOpacity={0.7}
              style={{ flex: 1, justifyContent: "center", paddingVertical: 8 }}
            >
              <Text
                style={{
                  fontSize: 15,
                  color: hasDestination ? "#111827" : "#9CA3AF",
                  fontWeight: hasDestination ? "500" : "400",
                }}
                numberOfLines={1}
              >
                {hasDestination ? destinationText : "Bạn muốn đi đâu?"}
              </Text>
            </TouchableOpacity>

            {/* Avatar — only in idle */}
            <TouchableOpacity
              onPress={onProfilePress}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: user ? "#10B981" : "#E5E7EB",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: 6,
                flexShrink: 0,
                overflow: "hidden",
              }}
              activeOpacity={0.7}
            >
              {user?.avatarUrl ? (
                <RNImage
                  source={{ uri: user.avatarUrl }}
                  style={{ width: "100%", height: "100%", borderRadius: 18 }}
                />
              ) : (
                <Ionicons
                  name={user ? "person" : "person-outline"}
                  size={18}
                  color={user ? "white" : "#9CA3AF"}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <PlaceSearchSheet
          visible={searchTarget !== null}
          onClose={() => setSearchTarget(null)}
          onSelectPlace={handleSearchSelect}
          onPickOnMap={handleSearchPickOnMap}
          onUseGPS={handleSearchUseGPS}
          showGPSOption={false}
          placeholder="Tìm điểm đến..."
          accentColor="#4F46E5"
          initialQuery={isUsingGPSDest ? "" : destinationText}
        />
      </>
    );
  }

  // ─── READY: 2-row pill + bottom bar ─────────────────
  return (
    <>
      {/* TOP: 2-row pill */}
      <View
        style={{
          position: "absolute",
          top: topPadding,
          left: 0,
          right: 0,
          zIndex: 50,
          paddingHorizontal: 16,
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#E5E7EB",
            padding: 10,
            gap: 6,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          {/* Row 1: back + origin + swap */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            {/* Back */}
            <TouchableOpacity
              onPress={handleBack}
              disabled={isLoading}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#F3F4F6",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={18} color="#374151" />
            </TouchableOpacity>

            {/* Origin */}
            <TouchableOpacity
              onPress={() => setSearchTarget("origin")}
              disabled={!!isLoading}
              activeOpacity={0.7}
              style={{ flex: 1, justifyContent: "center", paddingVertical: 6 }}
            >
              {isLoading && !isUsingGPSOrigin && !hasOriginCoord && originText.length > 0 ? (
                <View style={{ height: 8, borderRadius: 4, backgroundColor: "#D1D5DB", width: "60%" }} />
              ) : (
                <Text
                  style={{
                    fontSize: 14,
                    color: isUsingGPSOrigin ? "#2563EB" : originText ? "#111827" : "#9CA3AF",
                    fontWeight: isUsingGPSOrigin || originText ? "500" : "400",
                  }}
                  numberOfLines={1}
                >
                  {isUsingGPSOrigin ? "Vị trí hiện tại" : originText || "Chọn điểm đi"}
                </Text>
              )}
            </TouchableOpacity>

            {/* Swap */}
            <TouchableOpacity
              onPress={onSwap}
              disabled={isLoading}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "#DBEAFE",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="swap-vertical" size={16} color="#2563EB" />
            </TouchableOpacity>
          </View>

          {/* Row 2: search + destination + arrow */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="search" size={16} color="#9CA3AF" style={{ flexShrink: 0, marginLeft: 10 }} />

            <TouchableOpacity
              onPress={() => setSearchTarget("dest")}
              disabled={!!isLoading}
              activeOpacity={0.7}
              style={{ flex: 1, justifyContent: "center", paddingVertical: 6 }}
            >
              {isLoading && !isUsingGPSDest && !hasDestinationCoord && destinationText.length > 0 ? (
                <View style={{ height: 8, borderRadius: 4, backgroundColor: "#D1D5DB", width: "50%" }} />
              ) : (
                <Text
                  style={{
                    fontSize: 14,
                    color: isUsingGPSDest ? "#2563EB" : destinationText ? "#111827" : "#9CA3AF",
                    fontWeight: isUsingGPSDest || destinationText ? "500" : "400",
                  }}
                  numberOfLines={1}
                >
                  {isUsingGPSDest ? "Vị trí hiện tại" : destinationText || "Chọn điểm đến"}
                </Text>
              )}
            </TouchableOpacity>

            <Ionicons
              name="chevron-forward"
              size={16}
              color="#9CA3AF"
              style={{ flexShrink: 0, marginRight: 10 }}
            />
          </View>
        </View>
      </View>

      {/* BOTTOM: Transport + Find Route */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 8,
        }}
      >
        {error && (
          <View
            style={{
              marginBottom: 8,
              backgroundColor: "#FEF2F2",
              borderRadius: 12,
              padding: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ionicons name="alert-circle" size={16} color="#DC2626" />
            <Text style={{ fontSize: 12, color: "#DC2626", flex: 1 }}>{error}</Text>
          </View>
        )}

        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            paddingVertical: 8,
            paddingHorizontal: 10,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "#F3F4F6",
              borderRadius: 999,
              padding: 3,
            }}
          >
            <TransportModeButton active={transportMode === "car"} icon={<Ionicons name="car" size={15} color={transportMode === "car" ? "white" : "#6B7280"} />} onPress={() => onModeChange("car")} />
            <TransportModeButton active={transportMode === "motorbike"} icon={<MaterialCommunityIcons name="motorbike" size={15} color={transportMode === "motorbike" ? "white" : "#6B7280"} />} onPress={() => onModeChange("motorbike")} />
            <TransportModeButton active={transportMode === "bicycle"} icon={<Ionicons name="bicycle" size={15} color={transportMode === "bicycle" ? "white" : "#6B7280"} />} onPress={() => onModeChange("bicycle")} />
            <TransportModeButton active={transportMode === "walk"} icon={<Ionicons name="walk" size={15} color={transportMode === "walk" ? "white" : "#6B7280"} />} onPress={() => onModeChange("walk")} />
          </View>

          <TouchableOpacity
            onPress={onFindRoute}
            disabled={isDisabled}
            activeOpacity={0.8}
            style={{
              flex: 1,
              backgroundColor: isDisabled ? "#93C5FD" : "#2563EB",
              borderRadius: 999,
              paddingVertical: 11,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="navigate" size={15} color="white" />
            )}
            <Text style={{ color: "white", fontWeight: "700", fontSize: 13 }}>
              {isLoading ? "Đang tìm..." : "Tìm đường"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Place Search Sheet */}
      <PlaceSearchSheet
        visible={searchTarget !== null}
        onClose={() => setSearchTarget(null)}
        onSelectPlace={handleSearchSelect}
        onPickOnMap={handleSearchPickOnMap}
        onUseGPS={handleSearchUseGPS}
        showGPSOption={searchTarget === "origin"}
        placeholder={
          searchTarget === "origin" ? "Tìm điểm đi..." : "Tìm điểm đến..."
        }
        accentColor={searchTarget === "origin" ? "#22C55E" : "#4F46E5"}
        initialQuery={
          searchTarget === "origin"
            ? isUsingGPSOrigin ? "" : originText
            : isUsingGPSDest ? "" : destinationText
        }
      />
    </>
  );
}
