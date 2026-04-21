// app.config.js - Replaces app.json to support environment variables
// Environment variables are loaded from .env via Expo's built-in dotenv support

/** @type {import('@expo/config').ExpoConfig} */
module.exports = {
  expo: {
    name: "FDA App",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "fda-mobile",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.fda.mobile",
    },
    android: {
      package: "com.fda.mobile",
      googleServicesFile: "./google-services.json",
      permissions: [
        "android.permission.POST_NOTIFICATIONS",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.FOREGROUND_SERVICE",
      ],
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#0B1A33",
      },
      edgeToEdgeEnabled: true,
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#0B1A33",
        },
      ],
      "expo-secure-store",
      "expo-web-browser",
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme:
            "com.googleusercontent.apps.176554472012-2ks2ui6bnf59s3e4d179422jctoohgcj",
          scopes: ["profile", "email"],
        },
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Cho phép FDA App truy cập vị trí để hiển thị trên bản đồ và tìm đường an toàn.",
          locationWhenInUsePermission:
            "Cho phép FDA App truy cập vị trí để hiển thị trên bản đồ và tìm đường an toàn.",
          isAndroidBackgroundLocationEnabled: false,
        },
      ],
      [
        "expo-camera",
        {
          cameraPermission:
            "Cho phép FDA App truy cập camera để chụp ảnh/video ngập lụt.",
          microphonePermission:
            "Cho phép FDA App truy cập microphone để quay video ngập lụt.",
          recordAudioAndroid: true,
        },
      ],
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 35,
            targetSdkVersion: 34,
            buildToolsVersion: "34.0.0",
          },
        },
      ],
      "expo-video",
      "@react-native-firebase/app",
      "@react-native-firebase/messaging",
      "./plugins/withAndroidLargeHeap.js",
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      googleRedirectPath: "auth/google/callback",
      router: {},
      eas: {
        projectId: "620158e0-e474-4ace-b801-c2f2e5406932",
      },
    },
  },
};
