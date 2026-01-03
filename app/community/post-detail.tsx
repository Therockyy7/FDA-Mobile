import React from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "~/components/ui/text";

import { Ionicons } from "@expo/vector-icons";
import { PostCard } from "~/features/community/components/PostCard";
import { Post } from "~/features/community/types/post-types";
import { SafeAreaView } from "react-native-safe-area-context";

const MOCK_POST: Post = {
  id: "1",
  authorId: "u1",
  authorName: "Nguyễn Văn A",
  createdAt: "5 phút trước",
  content:
    "Nước sông Hàn dâng cao, khu vực gần cầu Rồng mưa lớn, mọi người đi lại cẩn thận.",
  imageUrl:
    "https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=800",
  locationName: "Cầu Rồng, Đà Nẵng",
  waterLevelStatus: "warning",
  likesCount: 12,
  commentsCount: 5,
  sharesCount: 3,
  isLikedByMe: false,
};

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const router = useRouter();

  const post = MOCK_POST; // TODO: fetch theo postId

  return (
    <SafeAreaView className="flex-1 bg-slate-100 dark:bg-slate-950">
    <View className="flex-1 bg-slate-100 dark:bg-slate-950">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-4 pb-2 bg-slate-50 dark:bg-slate-900">
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
        <Text className="flex-1 text-center text-slate-900 dark:text-white font-semibold text-sm">
          Bài đăng cộng đồng
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1">
        <PostCard
          post={post}
          onToggleLike={() => {}}
          onPressComments={() => {}}
          onPressShare={() => {}}
          onPressReport={() => {}}
        />

        {/* TODO: Comment list + input */}
        <View className="px-4 pb-6">
          <Text className="text-xs text-slate-400 dark:text-slate-500 mb-2">
            Bình luận (sắp làm)
          </Text>
        </View>
      </ScrollView>
    </View>
    </SafeAreaView>
  );
}
