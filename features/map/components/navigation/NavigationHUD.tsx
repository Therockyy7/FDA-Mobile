// features/map/components/navigation/NavigationHUD.tsx

import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { formatDistance, formatDuration } from "../../lib/polyline-utils";
import { formatETA, getManeuverIcon } from "../../lib/navigation-utils";
import type { GeoJsonInstruction } from "../../types/safe-route.types";

interface NavigationHUDProps {
  instruction: GeoJsonInstruction | null;
  nextInstruction: GeoJsonInstruction | null;
  distanceToNextTurn: number;
  remainingDistance: number;
  remainingTime: number;
  isOffRoute: boolean;
  isFollowingUser: boolean;
  onExit: () => void;
  onRecenter: () => void;
}

export function NavigationHUD({
  instruction,
  nextInstruction,
  distanceToNextTurn,
  remainingDistance,
  remainingTime,
  isOffRoute,
  isFollowingUser,
  onExit,
  onRecenter,
}: NavigationHUDProps) {
  const insets = useSafeAreaInsets();
  const iconName = instruction
    ? (getManeuverIcon(instruction.text) as any)
    : "navigate";

  const isClose = distanceToNextTurn < 100;

  return (
    <>
      {/* TOP INSTRUCTION CARD */}
      <MotiView
        from={{ opacity: 0, translateY: -30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 400 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          paddingTop: insets.top + 4,
          paddingHorizontal: 12,
        }}
      >
        <View
          style={{
            backgroundColor: "#1E3A5F",
            borderRadius: 16,
            padding: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 12,
          }}
        >
          {instruction ? (
            <>
              {/* Primary instruction */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: "rgba(255,255,255,0.15)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name={iconName} size={28} color="white" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: "white",
                      fontSize: isClose ? 18 : 15,
                      fontWeight: "700",
                      lineHeight: isClose ? 22 : 20,
                    }}
                    numberOfLines={2}
                  >
                    {instruction.text}
                  </Text>
                  <Text
                    style={{
                      color: isClose ? "#FCD34D" : "#93C5FD",
                      fontSize: isClose ? 22 : 16,
                      fontWeight: "800",
                      marginTop: 2,
                    }}
                  >
                    {formatDistance(distanceToNextTurn)}
                  </Text>
                </View>
              </View>

              {/* Next step preview (look-ahead) */}
              {nextInstruction && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 10,
                    paddingTop: 10,
                    borderTopWidth: 1,
                    borderTopColor: "rgba(255,255,255,0.15)",
                  }}
                >
                  <Ionicons
                    name={getManeuverIcon(nextInstruction.text) as any}
                    size={16}
                    color="#93C5FD"
                  />
                  <Text
                    style={{ color: "#93C5FD", fontSize: 12, flex: 1 }}
                    numberOfLines={1}
                  >
                    Sau đó: {nextInstruction.text}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <Text style={{ color: "white", fontSize: 15, textAlign: "center" }}>
              Đang tính toán...
            </Text>
          )}
        </View>

        {/* Off-route warning */}
        {isOffRoute && (
          <View
            style={{
              marginTop: 8,
              backgroundColor: "#DC2626",
              borderRadius: 12,
              paddingVertical: 10,
              paddingHorizontal: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ionicons name="warning" size={18} color="white" />
            <Text style={{ color: "white", fontSize: 13, fontWeight: "600", flex: 1 }}>
              Bạn đã lạc đường! Hãy quay lại tuyến đường.
            </Text>
          </View>
        )}
      </MotiView>

      {/* RE-CENTER BUTTON (shown when user panned away) */}
      {!isFollowingUser && (
        <View
          style={{
            position: "absolute",
            right: 16,
            bottom: 140,
            zIndex: 100,
          }}
        >
          <TouchableOpacity
            onPress={onRecenter}
            activeOpacity={0.8}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "white",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 6,
            }}
          >
            <Ionicons name="navigate" size={22} color="#2563EB" />
          </TouchableOpacity>
        </View>
      )}

      {/* BOTTOM ETA BAR */}
      <MotiView
        from={{ opacity: 0, translateY: 30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 400 }}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          paddingBottom: insets.bottom + 8,
          paddingHorizontal: 12,
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            paddingVertical: 14,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 10,
          }}
        >
          {/* ETA */}
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "800", color: "#1E293B" }}>
              {formatETA(remainingTime)}
            </Text>
            <Text style={{ fontSize: 11, color: "#64748B", marginTop: 1 }}>
              Đến nơi
            </Text>
          </View>

          {/* Divider */}
          <View
            style={{
              width: 1,
              height: 30,
              backgroundColor: "#E2E8F0",
            }}
          />

          {/* Duration */}
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#1E293B" }}>
              {formatDuration(remainingTime)}
            </Text>
            <Text style={{ fontSize: 11, color: "#64748B", marginTop: 1 }}>
              Thời gian
            </Text>
          </View>

          {/* Divider */}
          <View
            style={{
              width: 1,
              height: 30,
              backgroundColor: "#E2E8F0",
            }}
          />

          {/* Distance */}
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#1E293B" }}>
              {formatDistance(remainingDistance)}
            </Text>
            <Text style={{ fontSize: 11, color: "#64748B", marginTop: 1 }}>
              Khoảng cách
            </Text>
          </View>

          {/* Exit button */}
          <TouchableOpacity
            onPress={onExit}
            activeOpacity={0.8}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "#EF4444",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="close" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </MotiView>
    </>
  );
}
