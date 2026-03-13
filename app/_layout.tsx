// // // ─── FCM background handler — MUST be at module level (before React renders) ──
// // import "~/features/alerts/fcm/initFCM";
// // // ──────────────────────────────────────────────────────────────────────────────

// // import { GoogleSignin } from "@react-native-google-signin/google-signin";
// // import { DarkTheme, DefaultTheme, Theme } from "@react-navigation/native";
// // import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// // import { Stack, useSegments } from "expo-router";
// // import { StatusBar } from "expo-status-bar";
// // import React, { useEffect } from "react";
// // import { ActivityIndicator, Platform, View, ToastAndroid, Alert } from "react-native";
// // import { GestureHandlerRootView } from "react-native-gesture-handler";
// // import { SafeAreaProvider } from "react-native-safe-area-context";
// // import { Provider } from "react-redux";
// // import { PersistGate } from "redux-persist/integration/react";

// // import { useAppDispatch, useAppSelector } from "~/app/hooks";
// // import { persistor, store } from "~/app/store";
// // import { InAppNotificationBanner } from "~/features/alerts/fcm/InAppNotificationBanner";
// // import { initFCM } from "~/features/alerts/fcm/initFCM";
// // import { useInAppNotification } from "~/features/alerts/fcm/useInAppNotification";
// // import { initializeAuth } from "~/features/auth/stores/auth.slice";
// // import { useNotificationNavigation } from "~/features/notifications/lib/useNotificationNavigation";

// // import { NAV_THEME } from "~/lib/constants";
// // import { useColorScheme } from "~/lib/useColorScheme";
// // import "../global.css";

// // const LIGHT_THEME: Theme = {
// //   ...DefaultTheme,
// //   colors: NAV_THEME.light,
// // };
// // const DARK_THEME: Theme = {
// //   ...DarkTheme,
// //   colors: NAV_THEME.dark,
// // };

// // export { ErrorBoundary } from "expo-router";

// // const queryClient = new QueryClient();

// // const useIsomorphicLayoutEffect =
// //   Platform.OS === "web" && typeof window === "undefined"
// //     ? React.useEffect
// //     : React.useLayoutEffect;

// // // Configure Google Sign-In once at module level
// // GoogleSignin.configure({
// //   webClientId:
// //     "176554472012-dm1lfi1lq24m5i1p5lb3e4rvlp4gsgpe.apps.googleusercontent.com",
// //   scopes: ["profile", "email"],
// // });

// // function RootStack() {
// //   const hasMounted = React.useRef(false);
// //   const segments = useSegments();
// //   const { isDarkColorScheme } = useColorScheme();
// //   const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);
// //   const dispatch = useAppDispatch();
// //   const authLoading = useAppSelector((state) => state.auth.loading);

// //   // Navigation callback for FCM taps
// //   const navigateToNotification = useNotificationNavigation();

// //   // In-app notification banner (for foreground FCM messages)
// //   const { notification, visible, translateY, triggerNotification, animateIn, dismiss } =
// //     useInAppNotification();

// //   useIsomorphicLayoutEffect(() => {
// //     if (hasMounted.current) return;
// //     if (Platform.OS === "web") {
// //       document.documentElement.classList.add("bg-background");
// //     }
// //     setIsColorSchemeLoaded(true);
// //     hasMounted.current = true;
// //   }, []);

// //   // 1. Initialize auth state on app start
// //   useEffect(() => {
// //     dispatch(initializeAuth());
// //   }, [dispatch]);

// //   // 2. Initialize FCM — foreground shows banner; background/killed navigate directly
// //   useEffect(() => {
// //     return initFCM(
// //       (data) => navigateToNotification(data),  // onNavigate (background/killed tap)
// //       (data) => {
// //         console.log("🔥 [DEBUG] _layout.tsx -> onShowBanner called with data:", data);
// //         if (Platform.OS === 'android') {
// //            ToastAndroid.show("Có thông báo mới (Foreground)!", ToastAndroid.LONG);
// //         } else {
// //            Alert.alert("Có thông báo mới (Foreground)!", data.title ?? "");
// //         }
// //         triggerNotification(data);
// //       },      // onShowBanner (foreground)
// //     );
// //   }, [navigateToNotification, triggerNotification]);

// //   if (!isColorSchemeLoaded || authLoading) {
// //     return (
// //       <View
// //         style={{
// //           flex: 1,
// //           backgroundColor: "#0F172A",
// //           alignItems: "center",
// //           justifyContent: "center",
// //         }}
// //       >
// //         <ActivityIndicator color="#3B82F6" />
// //       </View>
// //     );
// //   }

// //   return (
// //     <GestureHandlerRootView style={{ flex: 1 }}>
// //       <SafeAreaProvider>
// //         <View style={{ flex: 1 }}>
// //           <Stack screenOptions={{ headerShown: false }}>
// //             <Stack.Screen name="(tabs)" />
// //             <Stack.Screen name="(auth)" />
// //             <Stack.Screen name="community" />
// //             <Stack.Screen name="alerts" />
// //           </Stack>
// //         </View>

// //         {/* ── In-App FCM Notification Banner ── outside Stack container so it's not covered by navigation native views */}
// //         <InAppNotificationBanner
// //           notification={notification}
// //           visible={visible}
// //           translateY={translateY}
// //           onPress={(n) => n.data && navigateToNotification(n.data)}
// //           onDismiss={dismiss}
// //           onModalShow={animateIn}
// //         />
// //       </SafeAreaProvider>

// //       <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
// //     </GestureHandlerRootView>
// //   );
// // }

// // export default function RootLayout() {
// //   return (
// //     <Provider store={store}>
// //       <PersistGate loading={null} persistor={persistor}>
// //         <QueryClientProvider client={queryClient}>
// //           <RootStack />
// //         </QueryClientProvider>
// //       </PersistGate>
// //     </Provider>
// //   );
// // }

// // ─── FCM background handler — MUST be at module level (before React renders) ──
// import "~/features/alerts/fcm/initFCM";
// // ──────────────────────────────────────────────────────────────────────────────

// import { GoogleSignin } from "@react-native-google-signin/google-signin";
// import {
//   DarkTheme,
//   DefaultTheme,
//   Theme,
//   ThemeProvider,
// } from "@react-navigation/native";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { Stack, useSegments } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import React, { useEffect } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Platform,
//   ToastAndroid,
//   View,
// } from "react-native";
// import { GestureHandlerRootView } from "react-native-gesture-handler";
// import { SafeAreaProvider } from "react-native-safe-area-context";
// import { Provider } from "react-redux";
// import { PersistGate } from "redux-persist/integration/react";

// import { useAppDispatch, useAppSelector } from "~/app/hooks";
// import { persistor, store } from "~/app/store";
// import { InAppNotificationBanner } from "~/features/alerts/fcm/InAppNotificationBanner";
// import { initFCM } from "~/features/alerts/fcm/initFCM";
// import { useInAppNotification } from "~/features/alerts/fcm/useInAppNotification";
// import { initializeAuth } from "~/features/auth/stores/auth.slice";
// import { useNotificationNavigation } from "~/features/notifications/lib/useNotificationNavigation";

// import { NAV_THEME } from "~/lib/constants";
// import { useColorScheme } from "~/lib/useColorScheme";
// import "../global.css";

// const LIGHT_THEME: Theme = {
//   ...DefaultTheme,
//   colors: NAV_THEME.light,
// };

// const DARK_THEME: Theme = {
//   ...DarkTheme,
//   colors: NAV_THEME.dark,
// };

// export { ErrorBoundary } from "expo-router";

// const queryClient = new QueryClient();

// const useIsomorphicLayoutEffect =
//   Platform.OS === "web" && typeof window === "undefined"
//     ? React.useEffect
//     : React.useLayoutEffect;

// // Configure Google Sign-In once at module level
// GoogleSignin.configure({
//   webClientId:
//     "176554472012-dm1lfi1lq24m5i1p5lb3e4rvlp4gsgpe.apps.googleusercontent.com",
//   scopes: ["profile", "email"],
// });

// function RootStack() {
//   const hasMounted = React.useRef(false);
//   useSegments(); // giữ nếu bạn dùng sau này; tránh thay đổi flow router hiện tại

//   const { isDarkColorScheme } = useColorScheme();
//   const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

//   const dispatch = useAppDispatch();
//   const authLoading = useAppSelector((state) => state.auth.loading);

//   const navigateToNotification = useNotificationNavigation();

//   const {
//     notification,
//     visible,
//     translateY,
//     triggerNotification,
//     animateIn,
//     dismiss,
//   } = useInAppNotification();

//   React.useEffect(() => {
//     console.log("🟦 [_layout] banner state", {
//       visible,
//       notification,
//     });
//   }, [visible, notification]);

//   useIsomorphicLayoutEffect(() => {
//     if (hasMounted.current) return;

//     if (Platform.OS === "web") {
//       document.documentElement.classList.add("bg-background");
//     }

//     setIsColorSchemeLoaded(true);
//     hasMounted.current = true;
//   }, []);

//   useEffect(() => {
//     dispatch(initializeAuth());
//   }, [dispatch]);

//   useEffect(() => {
//     return initFCM(
//       (data) => {
//         // background/killed tap navigation
//         navigateToNotification(data);
//       },
//       (data) => {
//         // foreground message → show in-app banner
//         console.log(
//           "🔥 [DEBUG] _layout.tsx -> onShowBanner called with data:",
//           data,
//         );

//         if (Platform.OS === "android") {
//           ToastAndroid.show(
//             "Có thông báo mới (Foreground)!",
//             ToastAndroid.LONG,
//           );
//         } else {
//           Alert.alert("Có thông báo mới (Foreground)!", data.title ?? "");
//         }

//         triggerNotification(data);
//       },
//     );
//   }, [navigateToNotification, triggerNotification]);

//   if (!isColorSchemeLoaded || authLoading) {
//     return (
//       <View
//         style={{
//           flex: 1,
//           backgroundColor: "#0F172A",
//           alignItems: "center",
//           justifyContent: "center",
//         }}
//       >
//         <ActivityIndicator color="#3B82F6" />
//       </View>
//     );
//   }

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <SafeAreaProvider>
//         <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
//           <View style={{ flex: 1 }}>
//             <Stack screenOptions={{ headerShown: false }}>
//               <Stack.Screen name="(tabs)" />
//               <Stack.Screen name="(auth)" />
//               <Stack.Screen name="community" />
//               <Stack.Screen name="alerts" />
//             </Stack>
//           </View>

//           <InAppNotificationBanner
//             notification={notification}
//             visible={visible}
//             translateY={translateY}
//             onShow={animateIn}
//             onPress={(n) => {
//               if (n.data) {
//                 navigateToNotification(n.data);
//               }
//             }}
//             onDismiss={dismiss}
//           />
//         </ThemeProvider>
//       </SafeAreaProvider>

//       <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
//     </GestureHandlerRootView>
//   );
// }

// export default function RootLayout() {
//   return (
//     <Provider store={store}>
//       <PersistGate loading={null} persistor={persistor}>
//         <QueryClientProvider client={queryClient}>
//           <RootStack />
//         </QueryClientProvider>
//       </PersistGate>
//     </Provider>
//   );
// }

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
import {
  ActivityIndicator,
  Alert,
  Platform,
  ToastAndroid,
  View,
} from "react-native";
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

        if (Platform.OS === "android") {
          ToastAndroid.show(
            "Có thông báo mới (Foreground)!",
            ToastAndroid.LONG,
          );
        } else {
          Alert.alert("Có thông báo mới (Foreground)!", data.title ?? "");
        }

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
