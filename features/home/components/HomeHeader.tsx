
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, StatusBar, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";

interface HomeHeaderProps {
  notificationCount?: number;
}

export function HomeHeader({ notificationCount = 0 }: HomeHeaderProps) {
  const router = useRouter();

  return (
    <View
      className="bg-slate-50/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800"
      style={{
        paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight! + 10,
        paddingBottom: 12,
        paddingHorizontal: 16,
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="w-12" />
        <Text className="text-slate-900 dark:text-white text-lg font-bold">
          Trang chủ
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/notifications" as any)}
          className="w-10 h-10 items-center justify-center rounded-full active:bg-slate-200 dark:active:bg-slate-800"
          activeOpacity={0.7}
        >
          <View className="relative">
            <Ionicons name="notifications-outline" size={24} color="#64748B" />
            {notificationCount > 0 && (
              <View className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full items-center justify-center">
                <Text className="text-white text-[10px] font-bold">
                  {notificationCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
