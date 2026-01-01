import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { DarkTheme, DefaultTheme, Theme } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { persistor, store } from "~/app/store";

import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { initializeAuth } from "~/features/auth/stores/auth.slice";

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

// RootLayout.tsx hoặc app/_layout.tsx

GoogleSignin.configure({
  webClientId: "176554472012-dm1lfi1lq24m5i1p5lb3e4rvlp4gsgpe.apps.googleusercontent.com",
  scopes: ["profile", "email"],
});


function RootStack() {
  const hasMounted = React.useRef(false);
  const segments = useSegments();
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);
  const status = useAppSelector((state) => state.auth.status);
  const dispatch = useAppDispatch();
  const authLoading = useAppSelector((state) => state.auth.loading);



  useEffect(() => {
    console.log("Path: ", segments[0]);
  }, [segments]);

  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }

    if (Platform.OS === "web") {
      document.documentElement.classList.add("bg-background");
    }
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  // gọi initializeAuth khi app start
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

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
    <>
      <SafeAreaProvider>
        {/* 
        <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}> */}
        <Stack screenOptions={{ headerShown: false }}>
          
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          
        </Stack>
        {/* </ThemeProvider> */}
      </SafeAreaProvider>
      <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
    </>
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
