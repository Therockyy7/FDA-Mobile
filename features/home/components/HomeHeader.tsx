// features/home/components/HomeHeader.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, StatusBar, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { IconButton } from "~/components/ui/IconButton";
import { useUser } from "~/features/auth/stores/hooks";
import { MAP_COLORS } from "~/lib/design-tokens";
import { useColorScheme } from "~/lib/useColorScheme";
import type { OpenMeteoResponse } from "../types/open-meteo.types";
import { getWeatherTheme } from "../types/open-meteo.types";

interface HomeHeaderProps {
  notificationCount?: number;
  meteo?: OpenMeteoResponse | null;
}

export function HomeHeader({
  notificationCount = 0,
  meteo,
}: HomeHeaderProps) {
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();
  const user = useUser();

  // JS-only color values for icon components (non-NativeWind context)
  // Uses NativeWind dark: class for text, but icon colors must be JS-only
  const iconColor = isDarkColorScheme
    ? MAP_COLORS.dark.subtext
    : MAP_COLORS.light.subtext;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  // Defensive checks for nested meteo properties
  const currentTemp = meteo?.current?.temperature_2m
    ? Math.round(meteo.current.temperature_2m)
    : null;
  const weatherTheme = meteo?.current?.weather_code
    ? getWeatherTheme(meteo.current.weather_code)
    : null;

  return (
    <View
      testID="home-header-container"
      className="bg-white dark:bg-bg-dark border-b border-border-light dark:border-border-dark"
      style={{
        paddingTop:
          Platform.OS === "ios" ? 50 : (StatusBar.currentHeight || 0) + 12,
        paddingBottom: 14,
        paddingHorizontal: 20,
      }}
    >
      <View className="flex-row items-center justify-between">
        {/* Left: Logo + Greeting */}
        <View className="flex-row items-center flex-1">
          <LinearGradient
            colors={
              weatherTheme
                ? (weatherTheme.cardGradient.slice(0, 2) as [string, string])
                : ["#007AFF", "#1D4ED8"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
              shadowColor: weatherTheme?.color ?? "#007AFF",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            {weatherTheme ? (
              <MaterialCommunityIcons
                name={weatherTheme.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                size={24}
                color="white"
              />
            ) : (
              <Ionicons name="water" size={22} color="white" />
            )}
          </LinearGradient>

          <View className="flex-1">
            <View className="flex-row items-center mb-0.5">
              <Text
                testID="home-header-greeting"
                className="text-caption text-text-secondary-light dark:text-text-secondary-dark font-medium"
              >
                {getGreeting()} 👋
              </Text>
            </View>
            <Text
              testID="home-header-city"
              className="text-lg font-extrabold text-text-light dark:text-text-dark"
              style={{ letterSpacing: -0.5 }}
            >
              Đà Nẵng
              {currentTemp !== null && (
                <Text style={{ color: weatherTheme?.color ?? iconColor }}>
                  {" "}
                  {currentTemp}°C
                </Text>
              )}
            </Text>
          </View>
        </View>

        {/* Right: Actions */}
        <View className="flex-row items-center gap-2">
          {!user ? (
            <TouchableOpacity
              testID="home-header-login-btn"
              onPress={() => router.push("/(auth)/sign-in")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#007AFF", "#2563EB"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text className="text-white text-sm font-bold">Đăng nhập</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={{ position: "relative" }}>
              <IconButton
                testID="home-header-notifications-btn"
                variant="outline"
                size="md"
                onPress={() => router.push("/notifications" as any)}
                style={{ borderRadius: 14 }}
              >
                <Ionicons
                  name="notifications"
                  size={20}
                  color={iconColor}
                />
              </IconButton>
              {notificationCount > 0 && (
                <View
                  testID="home-header-notification-badge"
                  className="absolute -top-1 -right-1 bg-flood-danger border-2 border-white dark:border-bg-dark items-center justify-center"
                  style={{
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    paddingHorizontal: 5,
                  }}
                >
                  <Text
                    className="text-white font-extrabold"
                    style={{ fontSize: 11 }}
                  >
                    {/* Validate: notificationCount should be 0-99, cap display at 99+ */}
                    {notificationCount >= 0 && notificationCount <= 99
                      ? notificationCount
                      : "99+"}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Status pill - dynamic from weather data (dynamic color = JS-only exception) */}
      {weatherTheme && (
        <View
          testID="home-header-weather-pill"
          className="flex-row items-center mt-3"
          style={{
            paddingVertical: 8,
            paddingHorizontal: 14,
            backgroundColor: weatherTheme.color + "15",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: weatherTheme.color + "25",
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: weatherTheme.color,
              marginRight: 10,
            }}
          />
          <Text
            className="flex-1 font-semibold"
            style={{ fontSize: 12, color: weatherTheme.color }}
          >
            {weatherTheme.labelVn}
            {meteo && meteo.current.precipitation > 0
              ? ` • Đang mưa ${meteo.current.precipitation}mm`
              : " • Không có mưa"}
          </Text>
          {currentTemp !== null && (
            <View className="flex-row items-center">
              <MaterialCommunityIcons
                name="thermometer"
                size={14}
                color={iconColor}
              />
              <Text
                className="text-text-secondary-light dark:text-text-secondary-dark font-semibold"
                style={{ fontSize: 12, marginLeft: 2 }}
              >
                {currentTemp}°C
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
