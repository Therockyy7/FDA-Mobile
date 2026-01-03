import React, { useMemo } from "react";
import { ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "~/components/ui/text";
import { Post } from "~/features/community/types/post-types";
import { PostCard } from "~/features/community/components/PostCard";

// Tạm dùng cùng mock data như feed – sau này bạn fetch từ Supabase theo id
const POSTS: Post[] = [
  {
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
  },
  {
    id: "2",
    authorId: "u2",
    authorName: "Trần Thị B",
    createdAt: "30 phút trước",
    content:
      "Khu vực Hòa Khánh hiện trời tạnh, nước đã rút bớt, vẫn nên theo dõi thêm.",
    locationName: "Hòa Khánh, Liên Chiểu",
    waterLevelStatus: "safe",
    likesCount: 8,
    commentsCount: 2,
    sharesCount: 1,
    isLikedByMe: true,
  },
];

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const post = useMemo(
    () => POSTS.find((p) => p.id === String(id)),
    [id],
  );

  if (!post) {
    return (
      <SafeAreaView className="flex-1 bg-slate-100 dark:bg-slate-950 items-center justify-center">
        <Text className="text-slate-500 dark:text-slate-400 text-sm">
          Không tìm thấy bài đăng.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-100 dark:bg-slate-950">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-2 pb-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <Ionicons
          name="chevron-back"
          size={22}
          color="#0F172A"
          onPress={() => router.back()}
        />
        <Text className="flex-1 text-center text-slate-900 dark:text-white font-semibold text-sm">
          Bài đăng cộng đồng
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1">
        {/* Dùng lại PostCard cho phần nội dung chính */}
        <PostCard
          post={post}
          onToggleLike={() => {}}
          onPressComments={() => {}}
          onPressShare={() => {}}
          onPressReport={() => {}}
        />

        {/* Khu vực bình luận (placeholder) */}
        <View className="px-4 pb-8">
          <Text className="text-xs text-slate-400 dark:text-slate-500 mb-2">
            Bình luận (sẽ cắm sau)
          </Text>
          {/* TODO: comment list + input */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
