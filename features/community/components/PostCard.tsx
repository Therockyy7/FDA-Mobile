import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { Post } from "../types/post-types";

interface PostCardProps {
  post: Post;
  onToggleLike?: (postId: string) => void;
  onPressComments?: (postId: string) => void;
  onPressShare?: (postId: string) => void;
  onPressReport?: (postId: string) => void;
}

export function PostCard({
  post,
  onToggleLike,
  onPressComments,
  onPressShare,
  onPressReport,
}: PostCardProps) {
  const router = useRouter();

  const handleOpenProfile = () => {
    router.push({
      pathname: "/community/profile",
      params: { userId: post.authorId },
    } as any);
  };

  const handleOpenDetails = () => {
    // route động /community/[id]
    router.push({
      pathname: "/community/[id]",
      params: { id: post.id },
    } as any);
  };

  const statusLabel =
    post.waterLevelStatus === "safe"
      ? "An toàn"
      : post.waterLevelStatus === "warning"
      ? "Cảnh báo"
      : post.waterLevelStatus === "danger"
      ? "Nguy hiểm"
      : undefined;

  const statusColor =
    post.waterLevelStatus === "safe"
      ? "bg-emerald-100 text-emerald-700"
      : post.waterLevelStatus === "warning"
      ? "bg-amber-100 text-amber-700"
      : post.waterLevelStatus === "danger"
      ? "bg-rose-100 text-rose-700"
      : undefined;

  return (
    <View className="mb-3 rounded-2xl bg-white dark:bg-slate-900 px-4 pt-3 pb-2 shadow-sm shadow-slate-200 dark:shadow-black/40">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-2">
        <TouchableOpacity
          onPress={handleOpenProfile}
          className="flex-row items-center gap-2 flex-1"
          activeOpacity={0.7}
        >
          <View className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            {post.authorAvatarUrl ? (
              <Image
                source={{ uri: post.authorAvatarUrl }}
                className="w-full h-full"
              />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Ionicons
                  name="person-circle-outline"
                  size={26}
                  color="#0EA5E9"
                />
              </View>
            )}
          </View>
          <View className="flex-1">
            <Text className="text-slate-900 dark:text-white text-sm font-semibold">
              {post.authorName}
            </Text>
            <Text className="text-slate-400 dark:text-slate-500 text-xs">
              {post.createdAt}
              {post.locationName ? ` · ${post.locationName}` : ""}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onPressReport?.(post.id)}
          hitSlop={8}
          activeOpacity={0.7}
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={18}
            color="#64748B"
          />
        </TouchableOpacity>
      </View>

      {/* Body – tappable để mở chi tiết */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleOpenDetails}
      >
        {statusLabel && (
          <View className="mb-1">
            <View
              className={`self-start rounded-full px-2 py-0.5 ${statusColor}`}
            >
              <Text className="text-[10px] font-semibold">
                {statusLabel}
              </Text>
            </View>
          </View>
        )}

        {post.content?.length > 0 && (
          <Text className="text-sm text-slate-800 dark:text-slate-100 mb-2">
            {post.content}
          </Text>
        )}

        {post.imageUrl && (
          <View className="rounded-xl overflow-hidden mb-2 bg-slate-100 dark:bg-slate-800">
            <Image
              source={{ uri: post.imageUrl }}
              className="w-full h-56"
              resizeMode="cover"
            />
          </View>
        )}

        {/* Counters */}
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center gap-1">
            <Ionicons name="water-outline" size={14} color="#0EA5E9" />
            <Text className="text-[11px] text-slate-500 dark:text-slate-400">
              {post.likesCount} lượt ủng hộ
            </Text>
          </View>
          <Text className="text-[11px] text-slate-400 dark:text-slate-500">
            {post.commentsCount} bình luận · {post.sharesCount} chia sẻ
          </Text>
        </View>
      </TouchableOpacity>

      <View className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

      {/* Actions */}
      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => onToggleLike?.(post.id)}
          className="flex-1 flex-row items-center justify-center py-2 gap-1"
          activeOpacity={0.7}
        >
          <Ionicons
            name={post.isLikedByMe ? "heart" : "heart-outline"}
            size={18}
            color={post.isLikedByMe ? "#FB7185" : "#64748B"}
          />
          <Text
            className={`text-xs font-medium ${
              post.isLikedByMe
                ? "text-rose-500"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            Thích
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onPressComments?.(post.id)}
          className="flex-1 flex-row items-center justify-center py-2 gap-1"
          activeOpacity={0.7}
        >
          <Ionicons
            name="chatbubble-outline"
            size={17}
            color="#64748B"
          />
          <Text className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Bình luận
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onPressShare?.(post.id)}
          className="flex-1 flex-row items-center justify-center py-2 gap-1"
          activeOpacity={0.7}
        >
          <Ionicons
            name="share-social-outline"
            size={17}
            color="#64748B"
          />
          <Text className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Chia sẻ
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
