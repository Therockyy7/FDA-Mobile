import { Feather } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import * as Font from "expo-font";
import { useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LoginRequiredOverlay } from "~/features/auth/components/LoginRequiredOverlay";
import { useAuthLoading, useUser } from "~/features/auth/stores/hooks";
import { useColorScheme } from "~/lib/useColorScheme";
import { TAB_COLORS } from "~/lib/design-tokens";

// Set initial route to map tab — previously this was the default tab (index.tsx)
export const unstable_settings = {
  initialRouteName: "map/index",
};

// Preload Feather font at module level — runs before any component renders
const FEATHER_FONT = require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Feather.ttf");
Font.loadAsync({ Feather: FEATHER_FONT });

const TabsLayout = () => {
  const insets = useSafeAreaInsets();
  const user = useUser();
  const loading = useAuthLoading();
  const router = useRouter();
  const [loginPromptVisible, setLoginPromptVisible] = useState(false);
  const { colorScheme } = useColorScheme();

  // Show loading while auth is initializing — must still render Tabs to avoid "Unmatched route"
  if (loading) {
    const theme = TAB_COLORS[colorScheme];
    return (
      <View testID="tabsLayout-loadingContainer" style={{ flex: 1, backgroundColor: theme.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator testID="tabsLayout-loadingIndicator" color={theme.active} />
      </View>
    );
  }

  const isAuthenticated = !!user;
  const handleProtectedTabPress = () => {
    if (!isAuthenticated) {
      setLoginPromptVisible(true);
    }
  };

  // Theme colors for tab bar — sourced from design tokens
  const theme = TAB_COLORS[colorScheme];

  // console.log("TABS layout, user?", !!user);

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.active,
          tabBarInactiveTintColor: theme.inactive,
          tabBarStyle: {
            backgroundColor: theme.background,
            borderTopWidth: 1,
            borderTopColor: theme.border,
            height: 60 + insets.bottom,
            paddingTop: 8,
            paddingBottom: insets.bottom > 0 ? 0 : 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="home/index"
          options={{
            title: "Trang chủ",
            tabBarIcon: ({ color, size }) => (
              <Feather name="home" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="areas"
          options={{
            title: "Khu vực",
            tabBarIcon: ({ color, size }) => (
              <Feather name="compass" size={size} color={color} />
            ),
          }}
          listeners={{
            tabPress: (e: any) => {
              if (!isAuthenticated) {
                e.preventDefault();
                handleProtectedTabPress();
                return;
              }
              router.replace("/areas");
            },
          }}
        />

        <Tabs.Screen
          name="map/index"
          options={{
            title: "Bản đồ",
            tabBarIcon: ({ focused }) => (
              <View
                testID="tabbar-map-container"
                style={{
                  top: Platform.OS === "ios" ? -10 : -15,
                  justifyContent: "center",
                  alignItems: "center",
                  width: 58,
                  height: 58,
                  borderRadius: 29,
                  backgroundColor: theme.background,
                  shadowColor: focused
                    ? theme.active
                    : theme.inactive,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.4,
                  shadowRadius: 10,
                  elevation: 5,
                }}
              >
                <View
                  testID="tabbar-map-inner"
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: focused
                      ? theme.active
                      : theme.inactive,
                  }}
                >
                  <Feather name="map" size={24} color="#FFFFFF" />
                </View>
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="notifications"
          options={{
            title: "Thông báo",
            tabBarIcon: ({ color, size }) => (
              <Feather name="bell" size={size} color={color} />
            ),
          }}
          listeners={{
            tabPress: (e: any) => {
              if (!isAuthenticated) {
                e.preventDefault();
                handleProtectedTabPress();
                return;
              }
              // Force route to the root of the notifications tab to clear any cached detail screens
              // Only navigate if not already on the notifications root
              if (router.canGoBack()) {
                router.replace("/notifications");
              }
            },
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Hồ sơ",
            tabBarIcon: ({ color, size }) => (
              <Feather name="user" size={size} color={color} />
            ),
          }}
          listeners={{
            tabPress: (e: any) => {
              if (!isAuthenticated) {
                e.preventDefault();
                handleProtectedTabPress();
              }
            },
          }}
        />
      </Tabs>

      <LoginRequiredOverlay
        visible={loginPromptVisible}
        onClose={() => setLoginPromptVisible(false)}
        onLogin={() => {
          setLoginPromptVisible(false);
          router.push("/(auth)/sign-in");
        }}
        onSignUp={() => {
          setLoginPromptVisible(false);
          router.push("/(auth)/sign-up");
        }}
      />
    </>
  );
};

export default TabsLayout;
