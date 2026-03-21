// ─── FCM background handler — MUST be at module level (before React renders) ──
import "~/features/alerts/fcm/initFCM";
// ──────────────────────────────────────────────────────────────────────────────

import { GoogleSignin } from "@react-native-google-signin/google-signin";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { persistor, store } from "~/app/store";
import { InAppNotificationBanner } from "~/features/alerts/fcm/InAppNotificationBanner";
import { initFCM } from "~/features/alerts/fcm/initFCM";
import { useInAppNotification } from "~/features/alerts/fcm/useInAppNotification";
import { initializeAuth } from "~/features/auth/stores/auth.slice";
import { useNotificationNavigation } from "~/features/notifications/lib/useNotificationNavigation";

import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";
import "../global.css";

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};

const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export { ErrorBoundary } from "expo-router";

const queryClient = new QueryClient();

const useIsomorphicLayoutEffect =
  Platform.OS === "web" && typeof window === "undefined"
    ? React.useEffect
    : React.useLayoutEffect;

GoogleSignin.configure({
  webClientId:
    "176554472012-dm1lfi1lq24m5i1p5lb3e4rvlp4gsgpe.apps.googleusercontent.com",
  scopes: ["profile", "email"],
});

function RootStack() {
  const hasMounted = React.useRef(false);
  useSegments();

  const { isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  const dispatch = useAppDispatch();
  const authLoading = useAppSelector((state) => state.auth.loading);

  const navigateToNotification = useNotificationNavigation();

  const { notification, visible, translateY, triggerNotification, dismiss } =
    useInAppNotification();

  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) return;

    if (Platform.OS === "web") {
      document.documentElement.classList.add("bg-background");
    }

    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    return initFCM(
      (data) => {
        navigateToNotification(data);
      },
      (data) => {
        console.log("🔥 [DEBUG] _layout -> foreground message:", data);

        // if (Platform.OS === "android") {
        //   ToastAndroid.show(
        //     "Có thông báo mới (Foreground)!",
        //     ToastAndroid.LONG,
        //   );
        // } else {
        //   Alert.alert("Có thông báo mới (Foreground)!", data.title ?? "");
        // }

        triggerNotification(data);
      },
    );
  }, [navigateToNotification, triggerNotification]);

  if (!isColorSchemeLoaded || authLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0F172A",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color="#3B82F6" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
          <View style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="community" />
              <Stack.Screen name="alerts" />
            </Stack>

            <InAppNotificationBanner
              notification={notification}
              visible={visible}
              translateY={translateY}
              onPress={(n) => {
                if (n.data) {
                  navigateToNotification(n.data);
                }
              }}
              onDismiss={dismiss}
            />
          </View>
        </ThemeProvider>
      </SafeAreaProvider>

      <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <RootStack />
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
