import { Feather } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { useState } from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LoginRequiredOverlay } from "~/features/auth/components/LoginRequiredOverlay";
import { useAuthLoading, useUser } from "~/features/auth/stores/hooks";
import { useColorScheme } from "~/lib/useColorScheme";

const TabsLayout = () => {
  const insets = useSafeAreaInsets();
  const user = useUser();
  const loading = useAuthLoading();
  const router = useRouter();
  const [loginPromptVisible, setLoginPromptVisible] = useState(false);
  const { isDarkColorScheme } = useColorScheme();

  if (loading) return null;

  const isAuthenticated = !!user;
  const handleProtectedTabPress = () => {
    if (!isAuthenticated) {
      setLoginPromptVisible(true);
    }
  };

  // Theme colors for tab bar
  const tabBarColors = {
    background: isDarkColorScheme ? "#0F172A" : "#FFFFFF",
    borderColor: isDarkColorScheme ? "#1E293B" : "#E2E8F0",
    activeColor: isDarkColorScheme ? "#60A5FA" : "#3B82F6",
    inactiveColor: isDarkColorScheme ? "#64748B" : "#94A3B8",
  };

  // console.log("TABS layout, user?", !!user);

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: tabBarColors.activeColor,
          tabBarInactiveTintColor: tabBarColors.inactiveColor,
          tabBarStyle: {
            backgroundColor: tabBarColors.background,
            borderTopWidth: 1,
            borderTopColor: tabBarColors.borderColor,
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
          name="home"
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
          name="index"
          options={{
            title: "Bản đồ",
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  top: Platform.OS === "ios" ? -10 : -15,
                  justifyContent: "center",
                  alignItems: "center",
                  width: 58,
                  height: 58,
                  borderRadius: 29,
                  backgroundColor: tabBarColors.background,
                  shadowColor: focused
                    ? tabBarColors.activeColor
                    : tabBarColors.inactiveColor,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.4,
                  shadowRadius: 10,
                  elevation: 5,
                }}
              >
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: focused
                      ? tabBarColors.activeColor
                      : tabBarColors.inactiveColor,
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
