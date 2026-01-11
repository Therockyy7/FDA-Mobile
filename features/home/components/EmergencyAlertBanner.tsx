// features/home/components/EmergencyAlertBanner.tsx
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { Alert } from "../types/home-types";

interface EmergencyAlertBannerProps {
  alert: Alert;
}

export function EmergencyAlertBanner({ alert }: EmergencyAlertBannerProps) {
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Slow heartbeat pulse animation
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
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Get severity color scheme
  const getSeverityConfig = () => {
    const level = alert.level || "danger";
    switch (level) {
      case "critical":
        return {
          gradient: ["#7F1D1D", "#991B1B", "#DC2626"] as const,
          shadow: "#EF4444",
          badge: "KHẨN CẤP",
        };
      case "danger":
        return {
          gradient: ["#9A3412", "#C2410C", "#EA580C"] as const,
          shadow: "#F97316",
          badge: "NGUY HIỂM",
        };
      case "warning":
        return {
          gradient: ["#854D0E", "#A16207", "#CA8A04"] as const,
          shadow: "#EAB308",
          badge: "CẢNH BÁO",
        };
      default:
        return {
          gradient: ["#DC2626", "#EF4444", "#F87171"] as const,
          shadow: "#EF4444",
          badge: "NGUY HIỂM",
        };
    }
  };

  const config = getSeverityConfig();

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
      <Animated.View
        style={{
          transform: [{ scale: pulseAnim }],
        }}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push("/notifications" as any)}
          style={{
            shadowColor: config.shadow,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 20,
            elevation: 12,
          }}
        >
          <LinearGradient
            colors={config.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 20,
              overflow: "hidden",
            }}
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
            <View style={{ padding: 18 }}>
              {/* Top Row: Badge + Time */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                {/* Severity Badge */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "rgba(255,255,255,0.25)",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                  }}
                >
                  <MaterialCommunityIcons name="alert-circle" size={14} color="white" />
                  <Text style={{ color: "white", fontSize: 11, fontWeight: "800", marginLeft: 6, letterSpacing: 1 }}>
                    {config.badge}
                  </Text>
                </View>

                {/* Time ago */}
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.7)" />
                  <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "500", marginLeft: 4 }}>
                    {alert.time}
                  </Text>
                </View>
              </View>

              {/* Middle Row: Icon + Content */}
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                {/* Animated Lottie Icon Container */}
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 14,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.3)",
                    overflow: "hidden",
                  }}
                >
                  <MaterialIcons name="flood" size={30} color="white" />
                  {/* Mini pulse behind icon */}
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

                {/* Text Content */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: "white",
                      fontSize: 17,
                      fontWeight: "800",
                      lineHeight: 22,
                      marginBottom: 6,
                    }}
                    numberOfLines={2}
                  >
                    {alert.title}
                  </Text>
                  <Text
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

              {/* Bottom Row: Location + Action */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 14,
                  paddingTop: 14,
                  borderTopWidth: 1,
                  borderTopColor: "rgba(255,255,255,0.15)",
                }}
              >
                {/* Location */}
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                  <Ionicons name="location" size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "500", marginLeft: 4 }}>
                    Phát hành: {alert.date}
                  </Text>
                </View>

                {/* View Details Button */}
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "rgba(255,255,255,0.2)",
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.3)",
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: "white", fontSize: 12, fontWeight: "700" }}>Xem chi tiết</Text>
                  <Ionicons name="chevron-forward" size={14} color="white" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom Progress Indicator */}
            <View style={{ height: 4, backgroundColor: "rgba(0,0,0,0.2)" }}>
              <View
                style={{
                  height: "100%",
                  width: "75%",
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
