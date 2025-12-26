import { Feather } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LoginRequiredOverlay } from "~/features/auth/components/LoginRequiredOverlay";
import { useAuthLoading, useUser } from "~/features/auth/stores/hooks";

const TabsLayout = () => {
  const insets = useSafeAreaInsets();
  const user = useUser();
  const loading = useAuthLoading();
  const router = useRouter();
  const [loginPromptVisible, setLoginPromptVisible] = useState(false);
  if (loading) return null;

  const guardTab = () => ({
    tabPress: (e: any) => {
      if (!user) {
        e.preventDefault();
        router.push("/(auth)/sign-in");
      }
    },
  });

  const isAuthenticated = !!user;
  const handleProtectedTabPress = () => {
    if (!isAuthenticated) {
      setLoginPromptVisible(true);
    }
  };

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "hsl(240 5.9% 10%)",
          tabBarInactiveTintColor: "#657786",
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopWidth: 1,
            borderTopColor: "#E1E8ED",
            height: 50 + insets.bottom,
            paddingTop: 8,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "",
            tabBarIcon: ({ color, size }) => (
              <Feather name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: "",
            tabBarIcon: ({ color, size }) => (
              <Feather name="map" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="areas"
          options={{
            title: "",
            tabBarIcon: ({ color, size }) => (
              <Feather name="compass" size={size} color={color} />
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
          name="notifications"
          options={{
            title: "",
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
            title: "",
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
