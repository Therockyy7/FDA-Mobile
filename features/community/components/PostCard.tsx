import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useState } from "react";
import { Dimensions, Image, TouchableOpacity, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { Text } from "~/components/ui/text";
import { Media, Post } from "../types/post-types";
import { CommunityService } from "../services/community.service";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
// Trừ đi padding 2 bên (px-4 = 16px * 2)
const MEDIA_WIDTH = SCREEN_WIDTH - 32;
// Chiều cao bằng chiều rộng (tỉ lệ 1:1 hình vuông)
const MEDIA_HEIGHT = MEDIA_WIDTH;

interface PostCardProps {
  post: Post;
  onToggleLike?: (postId: string) => void;
  onPressReport?: (postId: string) => void;
}

const getMediaFromPost = (post: Post): Media[] => {
  if (post.media && post.media.length > 0) {
    return post.media;
  }
  if (post.imageUrl) {
    return [
      {
        id: "fallback",
        mediaType: "photo",
        mediaUrl: post.imageUrl,
        thumbnailUrl: null,
        createdAt: new Date().toISOString(),
      },
    ];
  }
  return [];
};

function VideoWithControls({
  mediaUrl,
  thumbnailUrl,
  width,
  height,
}: {
  mediaUrl: string;
  thumbnailUrl?: string | null;
  width: number;
  height: number;
}) {
  const [showThumbnail, setShowThumbnail] = useState(true);

  const player = useVideoPlayer(mediaUrl, (p) => {
    p.loop = true;
  });

  const handlePlay = () => {
    player.play();
    setShowThumbnail(false);
  };

  return (
    <View className="relative bg-black" style={{ width, height }}>
      <VideoView
        player={player}
        style={{ width: "100%", height: "100%" }}
        nativeControls
      />

      {showThumbnail && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handlePlay}
          className="absolute inset-0 items-center justify-center bg-black/40"
        >
          {thumbnailUrl ? (
            <Image
              source={{ uri: thumbnailUrl }}
              className="absolute inset-0 w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="absolute inset-0 bg-slate-800" />
          )}
          <View className="w-16 h-16 rounded-full bg-white/90 items-center justify-center z-10 shadow-lg">
            <Ionicons name="play" size={32} color="#0EA5E9" />
          </View>
        </TouchableOpacity>
      )}

      <View className="absolute top-3 right-3 bg-black/60 px-2 py-1 rounded-full flex-row items-center gap-1 z-10">
        <Ionicons name="videocam" size={12} color="white" />
        <Text className="text-white text-[10px] font-medium">Video</Text>
      </View>
    </View>
  );
}

export function PostCard({ post, onToggleLike, onPressReport }: PostCardProps) {
  const router = useRouter();
  const media = getMediaFromPost(post);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const [userAvatar, setUserAvatar] = useState<string | null>(post.authorAvatarUrl || null);
  const [userName, setUserName] = useState<string>(post.authorName);

  // Fetch user info từ API
  useEffect(() => {
    if (!post.authorId) return;

    async function fetchUserInfo() {
      try {
        const response = await CommunityService.getUserInfo(post.authorId);
        if (response.success && response.user) {
          if (response.user.avatarUrl) {
            setUserAvatar(response.user.avatarUrl);
          }
          if (response.user.displayName) {
            setUserName(response.user.displayName);
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin user:", error);
      }
    }

    fetchUserInfo();
  }, [post.authorId]);

  const handleOpenProfile = () => {
    router.push({
      pathname: "/community/profile",
      params: { userId: post.authorId },
    } as any);
  };

  const handleOpenDetails = () => {
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

  const renderMedia = () => {
    if (!media || media.length === 0) return null;

    if (media.length === 1) {
      const firstMedia = media[0];
      if (firstMedia.mediaType === "video") {
        return (
          <View className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 items-center justify-center">
            <VideoWithControls
              mediaUrl={firstMedia.mediaUrl}
              thumbnailUrl={firstMedia.thumbnailUrl}
              width={MEDIA_WIDTH}
              height={MEDIA_HEIGHT}
            />
          </View>
        );
      }
      return (
        <View
          className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 items-center justify-center"
          style={{ width: MEDIA_WIDTH, height: MEDIA_HEIGHT }}
        >
          <Image
            source={{ uri: firstMedia.mediaUrl }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        </View>
      );
    }

    return (
      <View
        className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800"
        style={{ width: MEDIA_WIDTH, height: MEDIA_HEIGHT }}
      >
        <Carousel
          loop={false}
          width={MEDIA_WIDTH}
          height={MEDIA_HEIGHT}
          data={media}
          scrollAnimationDuration={300}
          onSnapToItem={(index) => setActiveCarouselIndex(index)}
          renderItem={({ item }) => {
            if (item.mediaType === "video") {
              return (
                <View className="items-center justify-center" style={{ width: MEDIA_WIDTH, height: MEDIA_HEIGHT }}>
                  <VideoWithControls
                    mediaUrl={item.mediaUrl}
                    thumbnailUrl={item.thumbnailUrl}
                    width={MEDIA_WIDTH}
                    height={MEDIA_HEIGHT}
                  />
                </View>
              );
            }
            return (
              <View className="items-center justify-center" style={{ width: MEDIA_WIDTH, height: MEDIA_HEIGHT }}>
                <Image
                  source={{ uri: item.mediaUrl }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              </View>
            );
          }}
        />

        {media.length > 1 && (
          <View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-1.5">
            {media.map((_, index) => (
              <View
                key={index}
                style={{
                  width: index === activeCarouselIndex ? 16 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor:
                    index === activeCarouselIndex
                      ? "#0EA5E9"
                      : "rgba(255,255,255,0.6)",
                }}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderMediaCount = () => {
    if (media.length <= 1) return null;
    const photoCount = media.filter((m) => m.mediaType === "photo").length;
    const videoCount = media.filter((m) => m.mediaType === "video").length;

    return (
      <View className="absolute top-3 right-3 bg-black/60 px-2.5 py-1 rounded-full flex-row items-center gap-1">
        <Ionicons name="images" size={12} color="white" />
        <Text className="text-white text-[10px] font-medium">
          {activeCarouselIndex + 1}/{media.length}
        </Text>
      </View>
    );
  };

  return (
    // Bỏ padding hai bên (px-4) và bo góc (rounded-2xl) ở container tổng
    <View className="mb-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 pb-3">
      {/* 1. Header (Có px-4) */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity
          onPress={handleOpenProfile}
          className="flex-row items-center gap-2 flex-1"
          activeOpacity={0.7}
        >
          <View className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-100 dark:border-slate-800">
            {userAvatar ? (
              <Image
                source={{ uri: userAvatar }}
                className="w-full h-full"
              />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="person" size={20} color="#94A3B8" />
              </View>
            )}
          </View>
          <View className="flex-1 justify-center">
            <Text className="text-slate-900 dark:text-white text-sm font-bold">
              {userName}
            </Text>
            {post.locationName && (
              <Text className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                {post.locationName}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onPressReport?.(post.id)} hitSlop={8}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* 2. Media (Tràn viền, không padding) */}
      {media.length > 0 && (
        <View className="relative bg-slate-100 dark:bg-slate-900 items-center justify-center">
          {renderMedia()}
          {renderMediaCount()}
        </View>
      )}

      {/* 3. Actions - Upvote/Downvote (Có px-4) */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center gap-4">
          {/* Upvote */}
          <TouchableOpacity
            onPress={() => onToggleLike?.(post.id)}
            className="flex-row items-center gap-1.5"
            activeOpacity={0.7}
          >
            <Ionicons
              name={
                post.isLikedByMe ? "arrow-up-circle" : "arrow-up-circle-outline"
              }
              size={28}
              color={post.isLikedByMe ? "#10B981" : "#64748B"}
            />
            <Text
              className={`text-sm font-bold ${post.isLikedByMe ? "text-emerald-500" : "text-slate-900 dark:text-white"}`}
            >
              {post.trustScore || post.score || 0}
            </Text>
          </TouchableOpacity>

          {/* Downvote */}
          <TouchableOpacity
            onPress={() => onToggleLike?.(post.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-down-circle-outline"
              size={28}
              color="#64748B"
            />
          </TouchableOpacity>

          {/* <TouchableOpacity activeOpacity={0.7} onPress={handleOpenDetails}>
            <Ionicons
              name="chatbubble-outline"
              size={24}
              color="#64748B"
            />
          </TouchableOpacity> */}
        </View>

        {/* Bookmark/Save (Tuỳ chọn thêm cho giống IG) */}
        {/* <TouchableOpacity activeOpacity={0.7}>
          <Ionicons name="bookmark-outline" size={24} color="#64748B" />
        </TouchableOpacity> */}
      </View>

      {/* 4. Trust Score & Content (Có px-4) */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleOpenDetails}
        className="px-4"
      >
        {/* Indicators */}
        <View className="flex-row items-center gap-3 mb-2">
          {statusLabel && (
            <View className={`rounded px-1.5 py-0.5 ${statusColor}`}>
              <Text className="text-[10px] font-bold uppercase">
                {statusLabel}
              </Text>
            </View>
          )}
          <View className="flex-row items-center gap-1">
            <Ionicons name="shield-checkmark" size={12} color="#10B981" />
            <Text className="text-[11px] font-semibold text-slate-500">
              Độ tin cậy:{" "}
              {post.confidenceLevel === "high"
                ? "Cao"
                : post.confidenceLevel === "medium"
                  ? "Trung bình"
                  : "Thấp"}
            </Text>
          </View>
        </View>

        {/* Caption */}
        {post.content?.length > 0 && (
          <Text className="text-sm text-slate-900 dark:text-white leading-5">
            <Text className="font-bold">{userName} </Text>
            {post.content}
          </Text>
        )}

        <Text className="text-slate-400 dark:text-slate-500 text-[11px] mt-2">
          {post.createdAt}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
