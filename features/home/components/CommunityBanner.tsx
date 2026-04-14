// features/home/components/CommunityBanner.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { SHADOW } from "~/lib/design-tokens";

export function CommunityBanner() {
  const router = useRouter();

  const shimmerAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
    // Note: shimmerAnim is a stable ref, no need in dependency array
  }, []);

  // Memoize interpolation to avoid recalculating on every render
  const shimmerOpacity = useMemo(
    () =>
      shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.6, 1],
      }),
    [shimmerAnim],
  );

  return (
    <View testID="home-community-container" className="px-4 py-1">
      <View
        className="bg-white dark:bg-[#1E293B] border border-border-light dark:border-border-dark overflow-hidden"
        style={{
          borderRadius: 20,
          ...SHADOW.sm,
          shadowColor: "#8B5CF6",
          shadowOpacity: 0.08,
        }}
      >
        {/* Top: Gradient Hero Strip */}
        <TouchableOpacity
          testID="home-community-nav-btn"
          onPress={() => router.push("/community" as any)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={["#7C3AED", "#6D28D9", "#5B21B6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingVertical: 14, paddingHorizontal: 16 }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2.5 flex-1">
                <View
                  className="items-center justify-center"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    backgroundColor: "rgba(255,255,255,0.18)",
                  }}
                >
                  <Ionicons name="people" size={20} color="white" />
                </View>
                <View className="flex-1">
                  <Text
                    testID="home-community-title"
                    className="text-white font-extrabold"
                    style={{ fontSize: 15, letterSpacing: -0.3 }}
                  >
                    Cộng đồng Đà Nẵng
                  </Text>
                  <Text
                    testID="home-community-subtitle"
                    className="text-white/70 font-medium mt-0.5 text-caption"
                  >
                    Báo cáo & theo dõi ngập lụt thời gian thực
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-2">
                <View
                  testID="home-community-alert-count"
                  className="items-center px-2 py-1 rounded-[10px]"
                  style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                >
                  <Text
                    className="font-black"
                    style={{ color: "#FCD34D", fontSize: 14 }}
                  >
                    3
                  </Text>
                  <Text className="text-white/60 font-semibold text-caption">
                    Cảnh báo
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="rgba(255,255,255,0.5)"
                />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Bottom: Quick Actions Row */}
        <View className="flex-row py-2.5 px-3 gap-2">
          <Animated.View style={{ flex: 1, opacity: shimmerOpacity }}>
            <TouchableOpacity
              testID="home-community-report-btn"
              onPress={() =>
                router.push("/community/create-post?openCamera=true" as any)
              }
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#0EA5E9", "#0284C7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 14,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <Ionicons name="camera" size={16} color="white" />
                <Text className="text-white font-bold" style={{ fontSize: 12 }}>
                  Báo cáo ngập
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            testID="home-community-map-btn"
            onPress={() => router.push("/map" as any)}
            activeOpacity={0.8}
            style={{ flex: 1 }}
          >
            <View className="rounded-[14px] py-2.5 px-3 flex-row items-center justify-center gap-1.5 bg-[#ECFDF5] dark:bg-[#10B98120] border border-[#A7F3D0] dark:border-[#10B98140]">
              <MaterialCommunityIcons
                name="map-marker-radius"
                size={16}
                color="#10B981"
              />
              <Text className="font-bold" style={{ color: "#10B981", fontSize: 12 }}>
                Bản đồ ngập
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Smart Tip Strip */}
        <View
          testID="home-community-tip-strip"
          className="flex-row items-center py-2 px-[14px] gap-2 bg-[#FAF5FF] dark:bg-[#8B5CF614] border-t border-[#EDE9FE] dark:border-[#8B5CF626]"
        >
          <View
            className="items-center justify-center bg-[#EDE9FE] dark:bg-[#8B5CF633]"
            style={{ width: 20, height: 20, borderRadius: 10 }}
          >
            <Ionicons name="bulb" size={11} color="#8B5CF6" />
          </View>
          <Text
            className="flex-1 font-semibold text-[#7C3AED] dark:text-[#A78BFA] text-caption"
            style={{ lineHeight: 14 }}
            numberOfLines={2}
          >
            Thấy điểm ngập? Chụp ảnh & chia sẻ trên Cộng đồng để cảnh báo
            mọi người!
          </Text>
          <Ionicons
            name="arrow-forward-circle"
            size={16}
            color="#8B5CF6"
            style={{ opacity: 0.6 }}
          />
        </View>
      </View>
    </View>
  );
}
