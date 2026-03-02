// features/map/components/routes/RouteDirectionPanel.tsx
import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "~/components/ui/text";

export type TransportMode = "car" | "motorbike" | "walk";

interface RouteDirectionPanelProps {
  visible: boolean;
  onClose: () => void;

  // Origin
  originText: string;
  onOriginChange: (value: string) => void;
  useCurrentLocationAsOrigin: boolean;
  onUseGPSAsOrigin: () => void;
  onPickOriginOnMap: () => void;
  hasOriginCoord: boolean;

  // Destination
  destinationText: string;
  onDestinationChange: (value: string) => void;
  useCurrentLocationAsDest: boolean;
  onUseGPSAsDest: () => void;
  onPickDestinationOnMap: () => void;
  hasDestinationCoord: boolean;

  // Swap
  onSwap: () => void;

  // Transport
  transportMode: TransportMode;
  onModeChange: (mode: TransportMode) => void;

  // Action
  onFindRoute: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function RouteDirectionPanel({
  visible,
  onClose,
  originText,
  onOriginChange,
  useCurrentLocationAsOrigin,
  onUseGPSAsOrigin,
  onPickOriginOnMap,
  hasOriginCoord,
  destinationText,
  onDestinationChange,
  useCurrentLocationAsDest,
  onUseGPSAsDest,
  onPickDestinationOnMap,
  hasDestinationCoord,
  onSwap,
  transportMode,
  onModeChange,
  onFindRoute,
  isLoading,
  error,
}: RouteDirectionPanelProps) {
  if (!visible) return null;

  const hasOrigin = useCurrentLocationAsOrigin || hasOriginCoord;
  const hasDest =
    useCurrentLocationAsDest ||
    hasDestinationCoord ||
    destinationText.trim().length > 0;
  const canFindRoute = hasOrigin && hasDest;
  const isDisabled = isLoading || !canFindRoute;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        zIndex: 40,
      }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 48 : 0}
    >
      <View style={{ paddingHorizontal: 16, paddingTop: 50 }}>
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 20,
            padding: 14,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                fontWeight: "700",
                color: "#111827",
              }}
            >
              Chỉ đường an toàn
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={8}
              disabled={isLoading}
            >
              <Ionicons name="close" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Origin & Destination with Swap */}
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
            {/* Left: dot connector */}
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 4,
                width: 20,
              }}
            >
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "#22C55E",
                }}
              />
              <View
                style={{
                  width: 2,
                  flex: 1,
                  backgroundColor: "#D1D5DB",
                  marginVertical: 2,
                }}
              />
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "#EF4444",
                }}
              />
            </View>

            {/* Center: inputs */}
            <View style={{ flex: 1, gap: 8 }}>
              {/* Origin Input */}
              <LocationInput
                value={
                  useCurrentLocationAsOrigin ? "Vị trí hiện tại" : originText
                }
                onChangeText={onOriginChange}
                placeholder="Nhập điểm đi..."
                isCurrentLocation={useCurrentLocationAsOrigin}
                hasCoord={hasOriginCoord}
                onPickOnMap={onPickOriginOnMap}
                onUseGPS={onUseGPSAsOrigin}
                showGPSButton={!useCurrentLocationAsOrigin}
                editable={!isLoading && !useCurrentLocationAsOrigin}
                accentColor="#22C55E"
              />

              {/* Destination Input */}
              <LocationInput
                value={
                  useCurrentLocationAsDest
                    ? "Vị trí hiện tại"
                    : destinationText
                }
                onChangeText={onDestinationChange}
                placeholder="Nhập điểm đến..."
                isCurrentLocation={useCurrentLocationAsDest}
                hasCoord={hasDestinationCoord}
                onPickOnMap={onPickDestinationOnMap}
                onUseGPS={onUseGPSAsDest}
                showGPSButton={!useCurrentLocationAsDest}
                editable={!isLoading && !useCurrentLocationAsDest}
                accentColor="#4F46E5"
              />
            </View>

            {/* Right: swap button */}
            <View style={{ justifyContent: "center" }}>
              <TouchableOpacity
                onPress={onSwap}
                disabled={isLoading}
                style={{
                  padding: 6,
                  backgroundColor: "#F3F4F6",
                  borderRadius: 999,
                }}
              >
                <Ionicons name="swap-vertical" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Transport modes */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <Text
              style={{ fontSize: 12, color: "#6B7280", fontWeight: "500" }}
            >
              Phương tiện
            </Text>
            <View
              style={{
                flexDirection: "row",
                backgroundColor: "#F3F4F6",
                borderRadius: 999,
                padding: 4,
              }}
            >
              <TransportIcon
                active={transportMode === "car"}
                icon={
                  <Ionicons
                    name="car"
                    size={16}
                    color={transportMode === "car" ? "white" : "#4B5563"}
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
                      transportMode === "motorbike" ? "white" : "#4B5563"
                    }
                  />
                }
                onPress={() => onModeChange("motorbike")}
              />
              <TransportIcon
                active={transportMode === "walk"}
                icon={
                  <Ionicons
                    name="walk"
                    size={16}
                    color={transportMode === "walk" ? "white" : "#4B5563"}
                  />
                }
                onPress={() => onModeChange("walk")}
              />
            </View>
          </View>

          {/* Error message */}
          {error && (
            <View
              style={{
                backgroundColor: "#FEF2F2",
                borderRadius: 8,
                padding: 8,
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 12, color: "#DC2626" }}>{error}</Text>
            </View>
          )}

          {/* Find route button */}
          <TouchableOpacity
            onPress={onFindRoute}
            disabled={isDisabled}
            style={{
              marginTop: 4,
              backgroundColor: isDisabled ? "#93C5FD" : "#2563EB",
              borderRadius: 999,
              paddingVertical: 10,
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
              style={{ color: "white", fontWeight: "700", fontSize: 13 }}
            >
              {isLoading ? "Đang tìm đường..." : "Tìm đường an toàn nhất"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ==================== SUB-COMPONENTS ====================

function LocationInput({
  value,
  onChangeText,
  placeholder,
  isCurrentLocation,
  hasCoord,
  onPickOnMap,
  onUseGPS,
  showGPSButton,
  editable,
  accentColor,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  isCurrentLocation: boolean;
  hasCoord: boolean;
  onPickOnMap: () => void;
  onUseGPS: () => void;
  showGPSButton: boolean;
  editable: boolean;
  accentColor: string;
}) {
  const bgColor = isCurrentLocation
    ? "#DCFCE7"
    : hasCoord
      ? "#DCFCE7"
      : "#F3F4F6";

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: bgColor,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
        gap: 4,
      }}
    >
      {isCurrentLocation ? (
        // Current location badge (tappable to clear)
        <TouchableOpacity
          onPress={onUseGPS}
          style={{
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
            gap: 6,
          }}
        >
          <Ionicons name="navigate-circle" size={16} color="#16A34A" />
          <Text
            style={{
              fontSize: 13,
              color: "#16A34A",
              fontWeight: "600",
              flex: 1,
            }}
            numberOfLines={1}
          >
            Vị trí hiện tại
          </Text>
        </TouchableOpacity>
      ) : (
        // Text input
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          editable={editable}
          style={{
            flex: 1,
            fontSize: 13,
            color: "#111827",
            paddingVertical: 2,
          }}
        />
      )}

      {/* Quick GPS button */}
      {showGPSButton && (
        <TouchableOpacity
          onPress={onUseGPS}
          hitSlop={6}
          style={{
            padding: 4,
            backgroundColor: "#D1FAE5",
            borderRadius: 999,
          }}
        >
          <Ionicons name="navigate-circle" size={14} color="#16A34A" />
        </TouchableOpacity>
      )}

      {/* Pick on map button */}
      <TouchableOpacity
        onPress={onPickOnMap}
        hitSlop={6}
        style={{
          padding: 4,
          backgroundColor: accentColor + "20",
          borderRadius: 999,
        }}
      >
        <Ionicons name="map" size={14} color={accentColor} />
      </TouchableOpacity>

      {/* Clear button when current location is active */}
      {isCurrentLocation && (
        <TouchableOpacity
          onPress={() => onChangeText("")}
          hitSlop={6}
          style={{ padding: 4 }}
        >
          <Ionicons name="close-circle" size={14} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </View>
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
