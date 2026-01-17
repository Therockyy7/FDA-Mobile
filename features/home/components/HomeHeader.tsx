// features/home/components/HomeHeader.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, StatusBar, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

interface HomeHeaderProps {
  notificationCount?: number;
  userName?: string;
}

export function HomeHeader({ notificationCount = 0, userName = "Bạn" }: HomeHeaderProps) {
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  // Get weather icon based on time
  const getWeatherIcon = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 18) return "weather-sunny";
    return "weather-night";
  };

  const colors = {
    background: isDarkColorScheme ? "#0F172A" : "#FFFFFF",
    cardBg: isDarkColorScheme ? "#1E293B" : "#F8FAFC",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    accent: "#3B82F6",
  };

  return (
    <View
      style={{
        backgroundColor: colors.background,
        paddingTop: Platform.OS === "ios" ? 50 : (StatusBar.currentHeight || 0) + 12,
        paddingBottom: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        {/* Left: Greeting & Logo */}
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          {/* App Logo with Gradient */}
          <LinearGradient
            colors={["#3B82F6", "#1D4ED8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 14,
              shadowColor: "#3B82F6",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <Ionicons name="water" size={26} color="white" />
          </LinearGradient>

          <View style={{ flex: 1 }}>
            {/* Greeting with icon */}
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
              <MaterialCommunityIcons 
                name={getWeatherIcon()} 
                size={14} 
                color="#F59E0B" 
                style={{ marginRight: 4 }}
              />
              <Text style={{ fontSize: 12, color: colors.subtext, fontWeight: "500" }}>
                {getGreeting()}
              </Text>
            </View>
            
            {/* App Name / User Name */}
            <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text, letterSpacing: -0.5 }}>
              Lũ An Toàn
            </Text>
          </View>
        </View>

        {/* Right: Action Buttons */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          

          {/* Notification Button with Badge */}
          <TouchableOpacity
            onPress={() => router.push("/notifications" as any)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: colors.cardBg,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: colors.border,
              position: "relative",
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications" size={20} color={colors.subtext} />
            {notificationCount > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  minWidth: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: "#EF4444",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 6,
                  borderWidth: 2,
                  borderColor: colors.background,
                }}
              >
                <Text style={{ color: "white", fontSize: 10, fontWeight: "800" }}>
                  {notificationCount > 99 ? "99+" : notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Bar - Weather/Alert Summary */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 14,
          paddingVertical: 10,
          paddingHorizontal: 14,
          backgroundColor: isDarkColorScheme ? "rgba(34, 197, 94, 0.1)" : "rgba(34, 197, 94, 0.08)",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: isDarkColorScheme ? "rgba(34, 197, 94, 0.2)" : "rgba(34, 197, 94, 0.15)",
        }}
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: "#22C55E",
            marginRight: 10,
          }}
        />
        <Text style={{ fontSize: 13, color: "#22C55E", fontWeight: "600", flex: 1 }}>
          Hiện tại: Thời tiết ổn định
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialCommunityIcons name="thermometer" size={14} color={colors.subtext} />
          <Text style={{ fontSize: 12, color: colors.subtext, fontWeight: "600", marginLeft: 4 }}>
            28°C
          </Text>
        </View>
      </View>
    </View>
  );
}
