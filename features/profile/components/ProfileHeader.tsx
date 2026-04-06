// features/profile/components/ProfileHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React from "react";
import {
  Image,
  Platform,
  StatusBar,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

type Props = {
  displayName: string;
  email: string;
  avatarUrl?: string | null;
  onLogout: () => void;
  createdAt?: string;
  role?: string[];
  status?: string;
  onPickAvatar: () => void;
  scrollY?: SharedValue<number>;
};

const HEADER_MAX_HEIGHT = 320;

const ProfileHeader: React.FC<Props> = ({
  displayName,
  email,
  avatarUrl,
  onLogout,
  createdAt,
  role,
  status,
  onPickAvatar,
  scrollY,
}) => {
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();

  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === "android" ? StatusBar.currentHeight || insets.top : insets.top;
  const HEADER_MIN_HEIGHT = Math.max(80, statusBarHeight + 50); // Ensure minimal space for buttons
  const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

  // Header translates up instead of changing height
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = scrollY
      ? interpolate(
          scrollY.value,
          [0, HEADER_SCROLL_DISTANCE],
          [0, -HEADER_SCROLL_DISTANCE],
          Extrapolation.CLAMP
        )
      : 0;
    return { transform: [{ translateY }] };
  });

  // Keep top nav bar pinned to screen top while header translates up
  const topNavAnimatedStyle = useAnimatedStyle(() => {
    const translateY = scrollY
      ? interpolate(
          scrollY.value,
          [0, HEADER_SCROLL_DISTANCE],
          [0, HEADER_SCROLL_DISTANCE],
          Extrapolation.CLAMP
        )
      : 0;
    return { transform: [{ translateY }] };
  });

  // Full info fades out smoothly and translates up slightly
  const fullInfoAnimatedStyle = useAnimatedStyle(() => {
    const opacity = scrollY
      ? interpolate(
          scrollY.value,
          [0, HEADER_SCROLL_DISTANCE * 0.4],
          [1, 0],
          Extrapolation.CLAMP
        )
      : 1;
    const scale = scrollY
      ? interpolate(
          scrollY.value,
          [0, HEADER_SCROLL_DISTANCE * 0.4],
          [1, 0.9],
          Extrapolation.CLAMP
        )
      : 1;
    const translateY = scrollY
      ? interpolate(
          scrollY.value,
          [0, HEADER_SCROLL_DISTANCE * 0.4],
          [0, -15],
          Extrapolation.CLAMP
        )
      : 0;

    return {
      opacity,
      transform: [{ scale }, { translateY }],
    } as ViewStyle;
  });

  // Collapsed info fades in later
  const collapsedInfoAnimatedStyle = useAnimatedStyle(() => {
    const opacity = scrollY
      ? interpolate(
          scrollY.value,
          [HEADER_SCROLL_DISTANCE * 0.6, HEADER_SCROLL_DISTANCE],
          [0, 1],
          Extrapolation.CLAMP
        )
      : 0;
    const translateY = scrollY
      ? interpolate(
          scrollY.value,
          [HEADER_SCROLL_DISTANCE * 0.6, HEADER_SCROLL_DISTANCE],
          [10, 0],
          Extrapolation.CLAMP
        )
      : 0;
    return { opacity, transform: [{ translateY }] };
  });

  const bgBlurAnimatedStyle = useAnimatedStyle(() => {
    const opacity = scrollY
      ? interpolate(
          scrollY.value,
          [HEADER_SCROLL_DISTANCE * 0.5, HEADER_SCROLL_DISTANCE],
          [0, 1],
          Extrapolation.CLAMP
        )
      : 0;
    return { opacity };
  });

  const colors = {
    gradientStart: isDarkColorScheme ? "#1E293B" : "#2563EB",
    gradientEnd: isDarkColorScheme ? "#0B1120" : "#1D4ED8",
    avatarBorder: isDarkColorScheme ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.4)",
  };

  return (
    <Animated.View 
      style={[
        { 
          position: "absolute", 
          top: 0, 
          left: 0, 
          right: 0, 
          height: HEADER_MAX_HEIGHT, 
          overflow: "hidden", 
          zIndex: 100 
        }, 
        headerAnimatedStyle
      ]}
    >
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flex: 1,
          paddingTop: statusBarHeight + 10,
          paddingHorizontal: 16,
        }}
      >
        {/* Background Lottie Animation */}
        <LottieView
          source={require("../../../assets/animations/profile-waves.json")}
          autoPlay
          loop
          speed={0.4}
          style={{
            position: "absolute",
            width: "150%",
            height: "100%",
            left: "-25%",
            bottom: 0,
            opacity: isDarkColorScheme ? 0.15 : 0.25,
            zIndex: 0,
          }}
        />

        {/* Animated Glassmorphism Background for Collapsed State */}
        <Animated.View style={[
          { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 },
          bgBlurAnimatedStyle
        ]}>
          <BlurView intensity={isDarkColorScheme ? 80 : 50} tint={isDarkColorScheme ? "dark" : "light"} style={{ flex: 1 }} />
        </Animated.View>

        {/* Top Navigation Bar - Always visible */}
        <Animated.View
          style={[
            {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              zIndex: 10,
              height: 40,
            },
            topNavAnimatedStyle
          ]}
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.2)",
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color="white" />
          </TouchableOpacity>

          {/* Collapsed Info - Avatar + Name */}
          <Animated.View
            style={[
              {
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginHorizontal: 12,
              },
              collapsedInfoAnimatedStyle,
            ]}
          >
            <Image
              source={{ uri: avatarUrl || "https://i.pravatar.cc/300?img=12" }}
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                borderWidth: 1.5,
                borderColor: "rgba(255,255,255,0.6)",
                marginRight: 10,
              }}
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "white",
                maxWidth: 160,
              }}
              numberOfLines={1}
            >
              {displayName}
            </Text>
          </Animated.View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={onLogout}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(220, 38, 38, 0.2)",
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color="#FCA5A5" />
          </TouchableOpacity>
        </Animated.View>

        {/* Full Profile Info - Fades out on scroll */}
        <Animated.View
          style={[
            {
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              zIndex: 5,
              marginTop: 10,
            },
            fullInfoAnimatedStyle,
          ]}
        >
          {/* Avatar Area */}
          <View style={{ marginBottom: 16 }}>
            <View
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 15,
                elevation: 10,
              }}
            >
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  padding: 4,
                  borderWidth: 1,
                  borderColor: colors.avatarBorder,
                }}
              >
                <Image
                  source={{
                    uri: avatarUrl || "https://i.pravatar.cc/300?img=12",
                  }}
                  style={{ width: "100%", height: "100%", borderRadius: 46 }}
                />
              </View>
            </View>

            {/* Camera Button directly on Avatar */}
            <TouchableOpacity
              onPress={onPickAvatar}
              activeOpacity={0.8}
              style={{
                position: "absolute",
                bottom: 2,
                right: 2,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "#22C55E",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 3,
                borderColor: colors.gradientStart,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
              }}
            >
              <Ionicons name="camera" size={14} color="white" />
            </TouchableOpacity>
          </View>

          {/* Name and Role */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ fontSize: 22, fontWeight: "800", color: "white", letterSpacing: 0.5 }}>
              {displayName}
            </Text>
            {role?.includes("ADMIN") && (
              <View style={{ backgroundColor: "#F59E0B", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ fontSize: 10, fontWeight: "800", color: "white" }}>ADMIN</Text>
              </View>
            )}
          </View>

          {/* Email */}
          <Text style={{ fontSize: 13, fontWeight: "500", color: "rgba(255,255,255,0.7)", marginTop: 6 }}>
            {email || "Chưa cập nhật email"}
          </Text>

          {/* Stats Row */}
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 16, gap: 10 }}>
            {/* Joined Date Badge */}
            {formattedDate && (
              <View style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.15)",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}>
                <Ionicons name="calendar-outline" size={12} color="rgba(255,255,255,0.9)" />
                <Text style={{ fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.9)", marginLeft: 6 }}>
                  {formattedDate}
                </Text>
              </View>
            )}

            {/* Online Status Badge */}
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: status === "ACTIVE" ? "rgba(34, 197, 94, 0.2)" : "rgba(255,255,255,0.1)",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: status === "ACTIVE" ? "rgba(34, 197, 94, 0.3)" : "rgba(255,255,255,0.1)",
              }}>
              <View style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: status === "ACTIVE" ? "#4ADE80" : "#9CA3AF",
                  marginRight: 6,
                  shadowColor: status === "ACTIVE" ? "#4ADE80" : "transparent",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 4,
                }} />
              <Text style={{ fontSize: 11, fontWeight: "600", color: status === "ACTIVE" ? "#86EFAC" : "rgba(255,255,255,0.7)" }}>
                {status === "ACTIVE" ? "Online" : "Offline"}
              </Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
};

export default ProfileHeader;
