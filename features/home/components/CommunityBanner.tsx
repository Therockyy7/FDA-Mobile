// features/home/components/CommunityBanner.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { useTranslation } from "~/features/i18n";

export function CommunityBanner() {
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();
  const { t } = useTranslation();

  // Subtle shimmer animation for the report button
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmerAnim]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  const colors = {
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    softBg: isDarkColorScheme ? "#1E293B50" : "#F8FAFC",
  };

  return (
    <View className="px-4 py-1">
      {/* ── Compact Card Container ── */}
      <View
        style={{
          borderRadius: 20,
          overflow: "hidden",
          backgroundColor: colors.cardBg,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: "#8B5CF6",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 3,
        }}
      >
        {/* ── Top: Gradient Hero Strip ── */}
        <TouchableOpacity
          onPress={() => router.push("/community" as any)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={["#7C3AED", "#6D28D9", "#5B21B6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingVertical: 14, paddingHorizontal: 16 }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {/* Left: Icon + Title */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  flex: 1,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    backgroundColor: "rgba(255,255,255,0.18)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="people" size={20} color="white" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: "white",
                      fontSize: 15,
                      fontWeight: "800",
                      letterSpacing: -0.3,
                    }}
                  >
                    {t("home.community.title")}
                  </Text>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: 10,
                      fontWeight: "500",
                      marginTop: 1,
                    }}
                  >
                    {t("home.community.subtitle")}
                  </Text>
                </View>
              </View>

              {/* Right: Mini Stats */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {/* Active reports indicator */}
                <View
                  style={{
                    alignItems: "center",
                    backgroundColor: "rgba(255,255,255,0.15)",
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 10,
                  }}
                >
                  <Text
                    style={{
                      color: "#FCD34D",
                      fontSize: 14,
                      fontWeight: "900",
                    }}
                  >
                    3
                  </Text>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 8,
                      fontWeight: "600",
                    }}
                  >
                    {t("home.community.alert")}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="rgba(255,255,255,0.5)"
                />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Bottom: Quick Actions Row ── */}
        <View
          style={{
            flexDirection: "row",
            paddingVertical: 10,
            paddingHorizontal: 12,
            gap: 8,
          }}
        >
          {/* Report Flood Button */}
          <Animated.View style={{ flex: 1, opacity: shimmerOpacity }}>
            <TouchableOpacity
              onPress={() => router.push("/community/create-post?openCamera=true" as any)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#0EA5E9", "#0284C7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 14,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <Ionicons name="camera" size={16} color="white" />
                <Text
                  style={{
                    color: "white",
                    fontSize: 12,
                    fontWeight: "700",
                  }}
                >
                  {t("home.community.reportFlood")}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* View Map Button */}
          <TouchableOpacity
            onPress={() => router.push("/map" as any)}
            activeOpacity={0.8}
            style={{ flex: 1 }}
          >
            <View
              style={{
                borderRadius: 14,
                paddingVertical: 10,
                paddingHorizontal: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                backgroundColor: isDarkColorScheme
                  ? "rgba(16, 185, 129, 0.12)"
                  : "#ECFDF5",
                borderWidth: 1,
                borderColor: isDarkColorScheme
                  ? "rgba(16, 185, 129, 0.25)"
                  : "#A7F3D0",
              }}
            >
              <MaterialCommunityIcons
                name="map-marker-radius"
                size={16}
                color="#10B981"
              />
              <Text
                style={{
                  color: "#10B981",
                  fontSize: 12,
                  fontWeight: "700",
                }}
              >
                {t("home.community.floodMap")}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Smart Tip Strip ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 8,
            paddingHorizontal: 14,
            backgroundColor: isDarkColorScheme
              ? "rgba(139, 92, 246, 0.08)"
              : "#FAF5FF",
            borderTopWidth: 1,
            borderTopColor: isDarkColorScheme
              ? "rgba(139, 92, 246, 0.15)"
              : "#EDE9FE",
            gap: 8,
          }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: isDarkColorScheme
                ? "rgba(139, 92, 246, 0.2)"
                : "#EDE9FE",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="bulb" size={11} color="#8B5CF6" />
          </View>
          <Text
            style={{
              flex: 1,
              color: isDarkColorScheme ? "#A78BFA" : "#7C3AED",
              fontSize: 10,
              fontWeight: "600",
              lineHeight: 14,
            }}
            numberOfLines={2}
          >
            {t("home.community.tip")}
          </Text>
          <Ionicons
            name="arrow-forward-circle"
            size={16}
            color="#8B5CF6"
            style={{ opacity: 0.6 }}
          />
        </View>
      </View>
    </View>
  );
}
