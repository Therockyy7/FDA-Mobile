// features/map/components/RouteDirectionPanel.tsx
import React from "react";
import {
  View,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "~/components/ui/text";

export type TransportMode = "car" | "motorbike" | "walk";

interface RouteDirectionPanelProps {
  visible: boolean;
  onClose: () => void;

  originLabel: string;        // đã là tên đường hiện tại
  destinationText: string;
  onDestinationChange: (value: string) => void;

  transportMode: TransportMode;
  onModeChange: (mode: TransportMode) => void;

  onFindRoute: () => void;
}

export function RouteDirectionPanel({
  visible,
  onClose,
  originLabel,
  destinationText,
  onDestinationChange,
  transportMode,
  onModeChange,
  onFindRoute,
}: RouteDirectionPanelProps) {
  if (!visible) return null;

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
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 50, // tránh header/status bar
        }}
      >
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
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Origin & Destination */}
          <View style={{ gap: 8, marginBottom: 10 }}>
            {/* From: hiển thị tên đường hiện tại */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#F3F4F6",
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 8,
              }}
            >
              <Ionicons name="radio-button-on" size={14} color="#22C55E" />
              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 13,
                  color: "#4B5563",
                  fontWeight: "500",
                }}
                numberOfLines={1}
              >
                {originLabel || "Vị trí hiện tại"}
              </Text>
            </View>

            {/* To */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#EEF2FF",
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 8,
              }}
            >
              <Ionicons name="location-outline" size={16} color="#4F46E5" />
              <TextInput
                value={destinationText}
                onChangeText={onDestinationChange}
                placeholder="Nhập địa điểm muốn đến..."
                placeholderTextColor="#9CA3AF"
                style={{
                  flex: 1,
                  marginLeft: 8,
                  fontSize: 13,
                  color: "#111827",
                }}
              />
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
              style={{
                fontSize: 12,
                color: "#6B7280",
                fontWeight: "500",
              }}
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

          {/* Button find route */}
          <TouchableOpacity
            onPress={onFindRoute}
            style={{
              marginTop: 4,
              backgroundColor: "#2563EB",
              borderRadius: 999,
              paddingVertical: 10,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <Ionicons name="navigate" size={16} color="white" />
            <Text
              style={{
                color: "white",
                fontWeight: "700",
                fontSize: 13,
              }}
            >
              Tìm đường an toàn nhất
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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
