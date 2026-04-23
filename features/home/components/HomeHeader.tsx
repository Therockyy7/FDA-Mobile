// features/home/components/HomeHeader.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, StatusBar, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useUser } from "~/features/auth/stores/hooks";
import { useTranslation } from "~/features/i18n";
import { useColorScheme } from "~/lib/useColorScheme";
import type { OpenMeteoResponse } from "../types/open-meteo.types";
import { getWeatherTheme } from "../types/open-meteo.types";

interface HomeHeaderProps {
  notificationCount?: number;
  meteo?: OpenMeteoResponse | null;
}

export function HomeHeader({ notificationCount = 0, meteo }: HomeHeaderProps) {
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();
  const user = useUser();
  const { t, locale } = useTranslation();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("home.greeting.morning");
    if (hour < 18) return t("home.greeting.afternoon");
    return t("home.greeting.evening");
  };

  const currentTemp = meteo ? Math.round(meteo.current.temperature_2m) : null;
  const weatherTheme = meteo
    ? getWeatherTheme(meteo.current.weather_code)
    : null;

  const colors = {
    background: isDarkColorScheme ? "#0B1A33" : "#FFFFFF",
    cardBg: isDarkColorScheme ? "#1E293B" : "#F8FAFC",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
  };

  return (
    <View
      style={{
        backgroundColor: colors.background,
        paddingTop:
          Platform.OS === "ios" ? 50 : (StatusBar.currentHeight || 0) + 12,
        paddingBottom: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Left: Logo + Greeting */}
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <LinearGradient
            colors={
              weatherTheme
                ? (weatherTheme.cardGradient as any)
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
              shadowColor: weatherTheme?.color || "#007AFF",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            {weatherTheme ? (
              <MaterialCommunityIcons
                name={weatherTheme.icon as any}
                size={24}
                color="white"
              />
            ) : (
              <Ionicons name="water" size={22} color="white" />
            )}
          </LinearGradient>

          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: colors.subtext,
                  fontWeight: "500",
                }}
              >
                {getGreeting()} 👋
              </Text>
            </View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: colors.text,
                letterSpacing: -0.5,
              }}
            >
              {t("home.greeting.city")}
              {currentTemp !== null && (
                <Text style={{ color: weatherTheme?.color || colors.subtext }}>
                  {" "}
                  {currentTemp}°C
                </Text>
              )}
            </Text>
          </View>
        </View>

        {/* Right: Actions */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {!user ? (
            <TouchableOpacity
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
                <Text
                  style={{ color: "white", fontSize: 13, fontWeight: "700" }}
                >
                  {t("auth.signIn")}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => router.push("/notifications" as any)}
              style={{
                width: 42,
                height: 42,
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
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: "#EF4444",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 5,
                    borderWidth: 2,
                    borderColor: colors.background,
                  }}
                >
                  <Text
                    style={{ color: "white", fontSize: 9, fontWeight: "800" }}
                  >
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Status pill - dynamic from weather data */}
      {weatherTheme && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 12,
            paddingVertical: 8,
            paddingHorizontal: 14,
            backgroundColor:
              weatherTheme.color + (isDarkColorScheme ? "18" : "10"),
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
            style={{
              fontSize: 12,
              color: weatherTheme.color,
              fontWeight: "600",
              flex: 1,
            }}
          >
            {weatherTheme.labelVn && locale === "vi"
              ? weatherTheme.labelVn
              : weatherTheme.label || weatherTheme.labelVn}
            {meteo && meteo.current.precipitation > 0
              ? ` • ${t("home.weather.raining").replace("{amount}", String(meteo.current.precipitation))}`
              : ` • ${t("home.weather.noRain")}`}
          </Text>
          {currentTemp !== null && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialCommunityIcons
                name="thermometer"
                size={14}
                color={colors.subtext}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: colors.subtext,
                  fontWeight: "600",
                  marginLeft: 2,
                }}
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
