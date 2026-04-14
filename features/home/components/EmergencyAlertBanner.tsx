// features/home/components/EmergencyAlertBanner.tsx
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { SHADOW } from "~/lib/design-tokens";
import { Alert } from "../types/home-types";

interface EmergencyAlertBannerProps {
  alert: Alert;
}

// Severity gradient colors are JS-only (LinearGradient prop, not NativeWind)
const SEVERITY_CONFIG = {
  critical: {
    gradient: ["#7F1D1D", "#991B1B", "#DC2626"] as const,
    shadowColor: "#EF4444",
    badge: "KHẨN CẤP",
  },
  danger: {
    gradient: ["#9A3412", "#C2410C", "#EA580C"] as const,
    shadowColor: "#F97316",
    badge: "NGUY HIỂM",
  },
  warning: {
    gradient: ["#854D0E", "#A16207", "#CA8A04"] as const,
    shadowColor: "#EAB308",
    badge: "CẢNH BÁO",
  },
} as const;

const DEFAULT_SEVERITY = SEVERITY_CONFIG.danger;

export function EmergencyAlertBanner({ alert }: EmergencyAlertBannerProps) {
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.015,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const level = alert.level ?? "danger";
  // Type-safe lookup: validate level is a valid key before accessing
  const config =
    level in SEVERITY_CONFIG
      ? SEVERITY_CONFIG[level as keyof typeof SEVERITY_CONFIG]
      : DEFAULT_SEVERITY;

  return (
    <View testID="home-alert-container" className="px-4 py-2">
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          testID="home-alert-touchable"
          activeOpacity={0.9}
          onPress={() => router.push("/notifications" as any)}
          style={{ ...SHADOW.lg, shadowColor: config.shadowColor }}
        >
          <LinearGradient
            colors={config.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 20, overflow: "hidden" }}
          >
            {/* Lottie Heartbeat Pulse Background */}
            <LottieView
              source={require("../../../assets/animations/heartbeat-pulse.json")}
              autoPlay
              loop
              speed={0.6}
              style={{
                position: "absolute",
                width: 120,
                height: 120,
                right: -20,
                top: -20,
                opacity: 0.3,
              }}
            />

            {/* Main Content */}
            <View className="p-[18px]">
              {/* Top Row: Badge + Time */}
              <View className="flex-row justify-between items-center mb-[14px]">
                <View
                  testID="home-alert-severity-badge"
                  className="flex-row items-center px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.25)" }}
                >
                  <MaterialCommunityIcons
                    name="alert-circle"
                    size={14}
                    color="white"
                  />
                  <Text
                    className="text-white font-extrabold ml-1.5"
                    style={{ fontSize: 11, letterSpacing: 1 }}
                  >
                    {config.badge}
                  </Text>
                </View>

                <View testID="home-alert-time" className="flex-row items-center">
                  <Ionicons
                    name="time-outline"
                    size={12}
                    color="rgba(255,255,255,0.7)"
                  />
                  <Text
                    className="font-medium ml-1"
                    style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}
                  >
                    {alert.time}
                  </Text>
                </View>
              </View>

              {/* Middle Row: Icon + Content */}
              <View className="flex-row items-start">
                <View
                  className="items-center justify-center mr-[14px] overflow-hidden"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.3)",
                  }}
                >
                  <MaterialIcons name="flood" size={30} color="white" />
                  <LottieView
                    source={require("../../../assets/animations/heartbeat-pulse.json")}
                    autoPlay
                    loop
                    speed={0.8}
                    style={{
                      position: "absolute",
                      width: 80,
                      height: 80,
                      opacity: 0.2,
                    }}
                  />
                </View>

                <View className="flex-1">
                  <Text
                    testID="home-alert-title"
                    className="text-white font-extrabold mb-1.5"
                    style={{ fontSize: 17, lineHeight: 22 }}
                    numberOfLines={2}
                  >
                    {alert.title}
                  </Text>
                  <Text
                    testID="home-alert-subtitle"
                    style={{
                      color: "rgba(255,255,255,0.8)",
                      fontSize: 13,
                      lineHeight: 18,
                    }}
                    numberOfLines={2}
                  >
                    {alert.subtitle}
                  </Text>
                </View>
              </View>

              {/* Bottom Row: Date + Action */}
              <View
                className="flex-row justify-between items-center mt-[14px] pt-[14px]"
                style={{
                  borderTopWidth: 1,
                  borderTopColor: "rgba(255,255,255,0.15)",
                }}
              >
                <View testID="home-alert-date" className="flex-row items-center flex-1">
                  <Ionicons
                    name="location"
                    size={14}
                    color="rgba(255,255,255,0.7)"
                  />
                  <Text
                    className="font-medium ml-1"
                    style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}
                  >
                    Phát hành: {alert.date}
                  </Text>
                </View>

                <TouchableOpacity
                  testID="home-alert-details-btn"
                  className="flex-row items-center px-[14px] py-2 rounded-xl"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.3)",
                  }}
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-bold" style={{ fontSize: 12 }}>
                    Xem chi tiết
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={14}
                    color="white"
                    style={{ marginLeft: 4 }}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom Progress Indicator */}
            <View className="h-1" style={{ backgroundColor: "rgba(0,0,0,0.2)" }}>
              <View
                className="h-full w-3/4"
                style={{
                  backgroundColor: "rgba(255,255,255,0.5)",
                  borderTopRightRadius: 2,
                  borderBottomRightRadius: 2,
                }}
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
