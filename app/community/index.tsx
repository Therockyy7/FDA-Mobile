import React, { useState } from "react";
import { FlatList, RefreshControl, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { Post } from "~/features/community/types/post-types";
import { PostCard } from "~/features/community/components/PostCard";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock data – sau cắm Supabase
const INITIAL_POSTS: Post[] = [
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

export default function CommunityScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [refreshing, setRefreshing] = useState(false);

  const handleToggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLikedByMe: !p.isLikedByMe,
              likesCount: p.likesCount + (p.isLikedByMe ? -1 : 1),
            }
          : p,
      ),
    );
  };

  const handleOpenComments = (postId: string) => {
    router.push({
      pathname: "/community/post-detail",
      params: { postId },
    } as any);
  };

  const handleShare = (postId: string) => {
    // TODO: implement share
    console.log("share", postId);
  };

  const handleReport = (postId: string) => {
    // TODO: open bottom sheet report
    console.log("report", postId);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: gọi API Supabase fetch posts
    setTimeout(() => setRefreshing(false), 800);
  };

  const renderHeader = () => (
    <View className="px-4 pt-4 pb-3 bg-slate-50 dark:bg-slate-900">
      {/* Top bar */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() =>
              router.push("/community/profile" as any)
            }
            activeOpacity={0.7}
          >
            <View className="w-9 h-9 rounded-full bg-slate-300 dark:bg-slate-700" />
          </TouchableOpacity>
          <View>
            <Text className="text-slate-900 dark:text-white font-semibold text-sm">
              Cộng đồng Flood Monitor
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-xs">
              Chia sẻ tình hình mưa lũ quanh bạn
            </Text>
          </View>
        </View>

        <Ionicons
          name="notifications-outline"
          size={22}
          color="#0F172A"
        />
      </View>

      {/* Create post bar */}
      <TouchableOpacity
        onPress={() =>
          router.push("/community/create-post" as any)
        }
        className="rounded-2xl bg-white dark:bg-slate-800 px-4 py-3 flex-row items-center gap-3 shadow-sm shadow-slate-200 dark:shadow-black/40"
        activeOpacity={0.8}
      >
        <View className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
        <Text className="flex-1 text-slate-500 dark:text-slate-400 text-sm">
          Chia sẻ hình ảnh, video, tình trạng nước tại khu vực của bạn...
        </Text>
        <Ionicons name="image-outline" size={20} color="#0EA5E9" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-100 dark:bg-slate-950">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onToggleLike={handleToggleLike}
            onPressComments={handleOpenComments}
            onPressShare={handleShare}
            onPressReport={handleReport}
          />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0EA5E9"
          />
        }
      />
    </SafeAreaView>
  );
}
