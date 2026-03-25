// features/home/components/CommunityBanner.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import LottieView from "lottie-react-native";

export function CommunityBanner() {
  const router = useRouter();

  return (
    <View className="px-4 py-2 mt-2">
      {/* ── Section Header ── */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/40 items-center justify-center">
            <Ionicons name="people" size={18} color="#8B5CF6" />
          </View>
          <Text className="text-slate-900 dark:text-white text-lg font-bold">
            Cộng đồng
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/community" as any)}
          activeOpacity={0.7}
          className="flex-row items-center justify-center px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800"
        >
          <Text className="text-slate-700 dark:text-slate-300 text-xs font-bold mr-1">
            Khám phá
          </Text>
          <Ionicons name="arrow-forward" size={12} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* ═══════════ MAIN HERO CARD ═══════════ */}
      <TouchableOpacity
        onPress={() => router.push("/community" as any)}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={["#8B5CF6", "#6D28D9"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 24,
            padding: 20,
            overflow: "hidden",
            marginBottom: 12,
            shadowColor: "#8B5CF6",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          {/* Subtle network animation background */}
          <LottieView
            source={require("../../../assets/animations/pulse.json")}
            autoPlay
            loop
            speed={0.5}
            style={{
              position: "absolute",
              width: "150%",
              height: "150%",
              top: "-25%",
              left: "-25%",
              opacity: 0.15,
            }}
          />

          <View className="flex-row items-center gap-4 mb-5">
            <View className="w-14 h-14 rounded-2xl bg-white/20 items-center justify-center border border-white/10">
              <Ionicons name="share-social" size={28} color="white" />
            </View>
            <View className="flex-1">
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: "600", marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Mạng lưới cộng đồng
              </Text>
              <Text className="text-white text-base font-extrabold leading-5">
                Chung tay bảo vệ{"\n"}Đà Nẵng
              </Text>
            </View>
          </View>

          {/* Stats Bar Component */}
          <View className="flex-row items-center bg-black/15 rounded-xl p-3 border border-white/10 gap-3">
            <View className="flex-1 items-center border-r border-white/10">
              <Text className="text-white text-lg font-black tracking-tighter">
                42
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: "500" }}>Bài đăng mới</Text>
            </View>
            <View className="flex-1 items-center border-r border-white/10">
              <Text className="text-amber-300 text-lg font-black tracking-tighter">
                3
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: "500" }}>Cảnh báo khẩn</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-emerald-300 text-lg font-black tracking-tighter">
                12
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: "500" }}>Đã an toàn</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* ═══════════ QUICK ACTIONS ROW ═══════════ */}
      <View className="flex-row gap-3">
        {/* Create Post */}
        <TouchableOpacity
          onPress={() => router.push("/community/create-post" as any)}
          activeOpacity={0.8}
          className="flex-1"
        >
          <View className="rounded-2xl bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 flex-row items-center gap-3 shadow-sm">
            <View className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 items-center justify-center">
              <Ionicons name="camera" size={18} color="#0EA5E9" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 dark:text-white text-sm font-bold">
                Báo cáo ngập
              </Text>
              <Text className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5">
                Chia sẻ hình ảnh
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* View Map Shortcut */}
        <TouchableOpacity
          onPress={() => router.push("/map" as any)}
          activeOpacity={0.8}
          className="flex-1"
        >
          <View className="rounded-2xl bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 flex-row items-center gap-3 shadow-sm">
            <View className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 items-center justify-center">
              <Ionicons name="map" size={18} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 dark:text-white text-sm font-bold">
                Bản đồ lũ
              </Text>
              <Text className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5">
                Xem trực tiếp
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
