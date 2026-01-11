// features/profile/components/ProfileHeader.tsx
import { Ionicons } from "@expo/vector-icons";
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

const HEADER_MAX_HEIGHT = 260;
const HEADER_MIN_HEIGHT = 90; // Increased for proper icon visibility
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

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

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

  // Header height animation
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const height = scrollY
      ? interpolate(
          scrollY.value,
          [0, HEADER_SCROLL_DISTANCE],
          [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
          Extrapolation.CLAMP
        )
      : HEADER_MAX_HEIGHT;
    return { height };
  });

  // Full info fades out
  const fullInfoAnimatedStyle = useAnimatedStyle(() => {
    const opacity = scrollY
      ? interpolate(
          scrollY.value,
          [0, HEADER_SCROLL_DISTANCE * 0.5],
          [1, 0],
          Extrapolation.CLAMP
        )
      : 1;
    const scale = scrollY
      ? interpolate(
          scrollY.value,
          [0, HEADER_SCROLL_DISTANCE * 0.5],
          [1, 0.8],
          Extrapolation.CLAMP
        )
      : 1;
    return { 
      opacity,
      transform: [{ scale }],
    } as ViewStyle;
  });

  // Collapsed info fades in
  const collapsedInfoAnimatedStyle = useAnimatedStyle(() => {
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
    gradientStart: isDarkColorScheme ? "#1E3A5F" : "#3B82F6",
    gradientEnd: isDarkColorScheme ? "#0F172A" : "#1D4ED8",
  };

  const statusBarHeight = Platform.OS === "android" ? (StatusBar.currentHeight || 0) : 0;

  return (
    <Animated.View style={[{ overflow: "hidden" }, headerAnimatedStyle]}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flex: 1,
          paddingTop: statusBarHeight + 10,
          paddingHorizontal: 16,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Background Lottie Animation */}
        <LottieView
          source={require("../../../assets/animations/profile-waves.json")}
          autoPlay
          loop
          speed={0.5}
          style={{
            position: "absolute",
            width: "150%",
            height: "100%",
            left: "-25%",
            bottom: 0,
            opacity: 0.25,
            zIndex: 0,
          }}
        />

        {/* Top Navigation Bar - Always visible */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 10,
            bottom: 20,
            

          }}
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              backgroundColor: "rgba(255,255,255,0.15)",
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
                width: 32,
                height: 32,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: "rgba(255,255,255,0.3)",
                marginRight: 10,
              }}
            />
            <Text
              style={{ fontSize: 16, fontWeight: "700", color: "white", maxWidth: 150 }}
              numberOfLines={1}
            >
              {displayName}
            </Text>
            {role?.includes("ADMIN") && (
              <View
                style={{
                  backgroundColor: "#F59E0B",
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 5,
                  marginLeft: 8,
                }}
              >
                <Text style={{ fontSize: 8, fontWeight: "800", color: "white" }}>
                  ADMIN
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={onLogout}
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              backgroundColor: "rgba(239, 68, 68, 0.2)",
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color="#FCA5A5" />
          </TouchableOpacity>
        </View>

        {/* Full Profile Info - Fades out on scroll */}
        <Animated.View
          style={[
            { 
              flex: 1, 
              alignItems: "center", 
              justifyContent: "center",
              zIndex: 5,
              bottom: 22,
            },
            fullInfoAnimatedStyle,
          ]}
        >
          {/* Avatar with Camera Button */}
          <View
            style={{
              shadowColor: "#3B82F6",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.4,
              shadowRadius: 15,
              elevation: 8,
              
            }}
          >
            <View style={{ position: "relative" }}>
              <View
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 28,
                  backgroundColor: "white",
                  padding: 3,
                  borderWidth: 2,
                  borderColor: "rgba(255,255,255,0.4)",
                }}
              >
                <Image
                  source={{ uri: avatarUrl || "https://i.pravatar.cc/300?img=12" }}
                  style={{ width: "100%", height: "100%", borderRadius: 24 }}
                />
              </View>

              {/* Camera Button */}
              <TouchableOpacity
                onPress={onPickAvatar}
                activeOpacity={0.8}
                style={{
                  position: "absolute",
                  bottom: -4,
                  right: -4,
                  width: 30,
                  height: 30,
                  borderRadius: 10,
                  backgroundColor: "#22C55E",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                  borderColor: colors.gradientStart,
                }}
              >
                <Ionicons name="camera" size={14} color="white" />
              </TouchableOpacity>

              {/* Online Status */}
              {status === "ACTIVE" && (
                <View
                  style={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: "#22C55E",
                    borderWidth: 2,
                    borderColor: colors.gradientStart,
                  }}
                />
              )}
            </View>
          </View>

          {/* Name and Role */}
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10, gap: 6 }}>
            <Text style={{ fontSize: 20, fontWeight: "800", color: "white" }}>
              {displayName}
            </Text>
            {role?.includes("ADMIN") && (
              <View
                style={{
                  backgroundColor: "#F59E0B",
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                }}
              >
                <Text style={{ fontSize: 9, fontWeight: "800", color: "white" }}>
                  ADMIN
                </Text>
              </View>
            )}
          </View>

          {/* Email */}
          <Text style={{ fontSize: 12, fontWeight: "500", color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
            {email || "Chưa cập nhật email"}
          </Text>

          {/* Stats Row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 8,
              gap: 8,
            }}
          >
            {formattedDate && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "rgba(255,255,255,0.12)",
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 14,
                }}
              >
                <Ionicons name="calendar-outline" size={10} color="rgba(255,255,255,0.7)" />
                <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", marginLeft: 4 }}>
                  {formattedDate}
                </Text>
              </View>
            )}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: status === "ACTIVE" ? "rgba(34, 197, 94, 0.15)" : "rgba(255,255,255,0.12)",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 14,
              }}
            >
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: status === "ACTIVE" ? "#22C55E" : "#9CA3AF",
                  marginRight: 4,
                }}
              />
              <Text style={{ fontSize: 10, color: status === "ACTIVE" ? "#86EFAC" : "rgba(255,255,255,0.7)" }}>
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
