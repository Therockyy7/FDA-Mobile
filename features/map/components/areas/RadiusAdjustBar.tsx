// features/map/components/areas/RadiusAdjustBar.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

interface RadiusAdjustBarProps {
  visible: boolean;
  radius: number;
  onRadiusChange: (radius: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const MIN_RADIUS = 50;
const MAX_RADIUS = 150;

// Format radius for display
function formatRadius(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${meters} m`;
}

// Get color based on radius percentage
function getRadiusColor(value: number): string {
  const percentage = (value - MIN_RADIUS) / (MAX_RADIUS - MIN_RADIUS);
  if (percentage < 0.3) return "#10B981"; // Green for small
  if (percentage < 0.6) return "#3B82F6"; // Blue for medium
  if (percentage < 0.85) return "#F97316"; // Orange for large
  return "#EF4444"; // Red for very large
}

export function RadiusAdjustBar({
  visible,
  radius,
  onRadiusChange,
  onConfirm,
  onCancel,
}: RadiusAdjustBarProps) {
  const { isDarkColorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  const colors = {
    background: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    cardBg: isDarkColorScheme ? "#334155" : "#F8FAFC",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#475569" : "#E2E8F0",
  };

  const radiusColor = getRadiusColor(radius);

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      exiting={FadeOutDown.duration(200)}
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: insets.bottom + 8,
        paddingHorizontal: 16,
        paddingTop: 16,
        backgroundColor: colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 16,
      }}
    >
      {/* Header with instructions */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: `${radiusColor}20`,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons
              name="target"
              size={20}
              color={radiusColor}
            />
          </View>
          <View>
            <Text
              style={{ fontSize: 14, fontWeight: "700", color: colors.text }}
            >
              Chọn vùng theo dõi
            </Text>
            <Text style={{ fontSize: 11, color: colors.subtext }}>
              Nhấn lên bản đồ hoặc kéo để di chuyển
            </Text>
          </View>
        </View>

        {/* Radius Value */}
        <View
          style={{
            backgroundColor: `${radiusColor}15`,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          <MaterialCommunityIcons
            name="radius-outline"
            size={16}
            color={radiusColor}
          />
          <Text
            style={{
              fontSize: 16,
              fontWeight: "800",
              color: radiusColor,
            }}
          >
            {formatRadius(radius)}
          </Text>
        </View>
      </View>

      {/* Slider */}
      <View style={{ marginBottom: 16 }}>
        <Slider
          style={{ width: "100%", height: 40 }}
          minimumValue={MIN_RADIUS}
          maximumValue={MAX_RADIUS}
          step={10}
          value={radius}
          onValueChange={onRadiusChange}
          minimumTrackTintColor={radiusColor}
          maximumTrackTintColor={colors.border}
          thumbTintColor={radiusColor}
        />
        {/* Min/Max Labels */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 4,
          }}
        >
          <Text style={{ fontSize: 10, color: colors.subtext }}>
            {formatRadius(MIN_RADIUS)}
          </Text>
          <Text style={{ fontSize: 10, color: colors.subtext }}>
            {formatRadius(MAX_RADIUS)}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={{ flexDirection: "row", gap: 12 }}>
        {/* Cancel Button */}
        <TouchableOpacity
          onPress={onCancel}
          activeOpacity={0.8}
          style={{
            flex: 1,
            backgroundColor: colors.cardBg,
            borderRadius: 14,
            paddingVertical: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Ionicons name="close" size={18} color={colors.subtext} />
          <Text
            style={{ fontSize: 14, fontWeight: "600", color: colors.subtext }}
          >
            Hủy
          </Text>
        </TouchableOpacity>

        {/* Confirm Button */}
        <TouchableOpacity
          onPress={onConfirm}
          activeOpacity={0.9}
          style={{ flex: 2 }}
        >
          <LinearGradient
            colors={["#3B82F6", "#2563EB"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 14,
              paddingVertical: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <Ionicons name="checkmark-circle" size={18} color="white" />
            <Text style={{ fontSize: 14, fontWeight: "700", color: "white" }}>
              Xác nhận vị trí
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

export default RadiusAdjustBar;
