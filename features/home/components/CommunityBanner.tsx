// features/home/components/CommunityBanner.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";

export function CommunityBanner() {
  const router = useRouter();

  return (
    <View className="px-4 py-4">
      {/* Section Title */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 items-center justify-center">
            <Ionicons name="people" size={18} color="#F59E0B" />
          </View>
          <Text className="text-slate-900 dark:text-white text-lg font-bold">
            Cộng đồng
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/community" as any)}
          activeOpacity={0.7}
        >
          <Text className="text-sky-600 dark:text-sky-400 text-sm font-medium">
            Xem tất cả →
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Banner Card */}
      <TouchableOpacity
        onPress={() => router.push("/community" as any)}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={["#0EA5E9", "#0284C7"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 20,
            padding: 16,
            overflow: "hidden",
          }}
        >
          {/* Decorative circles */}
          <View
            style={{
              position: "absolute",
              top: -30,
              right: -30,
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: "rgba(255,255,255,0.1)",
            }}
          />
          <View
            style={{
              position: "absolute",
              bottom: -20,
              left: -20,
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: "rgba(255,255,255,0.08)",
            }}
          />

          <View className="flex-row items-center gap-4">
            {/* Icon Area */}
            <View className="w-14 h-14 rounded-2xl bg-white/20 items-center justify-center">
              <Ionicons name="megaphone" size={28} color="white" />
            </View>

            {/* Content */}
            <View className="flex-1">
              <Text className="text-white text-base font-bold mb-1">
                Chia sẻ tình hình lũ lụt
              </Text>
              <Text className="text-white/80 text-xs leading-4">
                Đăng ảnh, video, cập nhật mức nước để cảnh báo cộng đồng
              </Text>
            </View>

            {/* Arrow */}
            <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
              <Ionicons name="arrow-forward" size={20} color="white" />
            </View>
          </View>

          {/* Quick Stats */}
          <View className="flex-row items-center gap-4 mt-4 pt-4 border-t border-white/20">
            <View className="flex-row items-center gap-2">
              <Ionicons name="document-text-outline" size={16} color="rgba(255,255,255,0.9)" />
              <Text className="text-white/90 text-xs font-medium">
                12 bài đăng mới
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Ionicons name="alert-circle-outline" size={16} color="#FCD34D" />
              <Text className="text-white/90 text-xs font-medium">
                3 cảnh báo khẩn
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Quick Create Post */}
      <TouchableOpacity
        onPress={() => router.push("/community/create-post" as any)}
        activeOpacity={0.8}
        className="mt-3"
      >
        <View className="rounded-2xl bg-white dark:bg-slate-800 px-4 py-3 flex-row items-center justify-between border border-slate-200 dark:border-slate-700">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-sky-200 dark:from-sky-900 dark:to-sky-800 items-center justify-center">
              <Ionicons name="person" size={20} color="#0EA5E9" />
            </View>
            <Text className="text-slate-500 dark:text-slate-400 text-sm">
              Bạn muốn chia sẻ điều gì?
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <View className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 items-center justify-center">
              <Ionicons name="camera" size={16} color="#10B981" />
            </View>
            <View className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/30 items-center justify-center">
              <Ionicons name="location" size={16} color="#F97316" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}
