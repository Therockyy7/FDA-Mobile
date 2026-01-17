import React from "react";
import { View, FlatList, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "~/components/ui/text";

import { Ionicons } from "@expo/vector-icons";
import { PostCard } from "~/features/community/components/PostCard";
import { Post } from "~/features/community/types/post-types";
import { SafeAreaView } from "react-native-safe-area-context";

const MOCK_MY_POSTS: Post[] = [
  {
    id: "p1",
    authorId: "u1",
    authorName: "Nguyễn Văn A",
    createdAt: "Hôm qua",
    content: "Khu vực biển Mỹ Khê sóng lớn, mưa to.",
    imageUrl:
      "https://images.pexels.com/photos/460621/pexels-photo-460621.jpeg?auto=compress&cs=tinysrgb&w=800",
    locationName: "Biển Mỹ Khê",
    waterLevelStatus: "warning",
    likesCount: 23,
    commentsCount: 6,
    sharesCount: 4,
    isLikedByMe: true,
  },
];

export default function ProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-slate-100 dark:bg-slate-950">
    <View className="flex-1 bg-slate-100 dark:bg-slate-950">
      {/* Header */}
      <View className="px-4 pt-4 pb-3 bg-slate-50 dark:bg-slate-900">
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={8}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color="#0F172A"
            />
          </TouchableOpacity>
          <Text className="text-slate-900 dark:text-white font-semibold text-sm">
            Trang cá nhân
          </Text>
          <View className="w-6" />
        </View>

        <View className="flex-row items-center gap-3">
          <View className="w-14 h-14 rounded-full bg-slate-300 dark:bg-slate-700" />
          <View className="flex-1">
            <Text className="text-slate-900 dark:text-white font-semibold">
              Nguyễn Văn A
            </Text>
            <Text className="text-xs text-slate-400 dark:text-slate-500">
              {MOCK_MY_POSTS.length} bài đăng · Đà Nẵng
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={MOCK_MY_POSTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onToggleLike={() => {}}
            onPressComments={() => {}}
            onPressShare={() => {}}
            onPressReport={() => {}}
          />
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
    </SafeAreaView>
  );
}
