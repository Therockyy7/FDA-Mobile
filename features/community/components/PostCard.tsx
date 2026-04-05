import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  TouchableOpacity,
  View,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import ImageViewing from "react-native-image-viewing";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { Media, Post } from "../types/post-types";
import { CommunityService } from "../services/community.service";
import { useQueryClient } from "@tanstack/react-query";
import { COMMUNITY_REPORTS_QUERY_KEY } from "~/features/map/hooks/queries/useCommunityReportsQuery";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MEDIA_WIDTH = SCREEN_WIDTH - 24; // Account for marginHorizontal: 12
const MEDIA_HEIGHT = MEDIA_WIDTH * 1; // 1:1 square ratio works best for contain


interface PostCardProps {
  post: Post;
  isOwner?: boolean;
  onUpvote?: (postId: string, newScore: number, userVote: number) => void;
  onDownvote?: (postId: string, newScore: number, userVote: number) => void;
  onPressReport?: (postId: string) => void;
  onDeletePost?: (postId: string) => void;
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
        contentFit="contain"
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
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
            />
          ) : (
            <View className="absolute inset-0 bg-slate-800" />
          )}
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: "rgba(255,255,255,0.95)",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 5,
              zIndex: 10,
            }}
          >
            <Ionicons
              name="play"
              size={26}
              color="#6366F1"
              style={{ marginLeft: 3 }}
            />
          </View>
        </TouchableOpacity>
      )}

      <View
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          backgroundColor: "rgba(0,0,0,0.55)",
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 8,
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          zIndex: 10,
          backdropFilter: "blur(10px)",
        }}
      >
        <Ionicons name="videocam" size={11} color="white" />
        <Text style={{ color: "white", fontSize: 10, fontWeight: "600" }}>
          Video
        </Text>
      </View>
    </View>
  );
}

export function PostCard({
  post,
  isOwner = false,
  onUpvote,
  onDownvote,
  onPressReport,
  onDeletePost,
}: PostCardProps) {
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();
  const media = getMediaFromPost(post);

  const imageUris = media
    .filter((m) => m.mediaType === "photo")
    .map((m) => ({ uri: m.mediaUrl }));

  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const [userAvatar, setUserAvatar] = useState<string | null>(
    post.authorAvatarUrl || null,
  );
  const [userName, setUserName] = useState<string>(post.authorName);
  const [showMenu, setShowMenu] = useState(false);
  const [displayScore, setDisplayScore] = useState(
    post.trustScore || post.score || 0,
  );
  const [userVote, setUserVote] = useState<number>(post.isLikedByMe ? 1 : 0);
  const [voting, setVoting] = useState(false);
  const [isImageViewVisible, setIsImageViewVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setDisplayScore(post.trustScore || post.score || 0);
    setUserVote(post.isLikedByMe ? 1 : 0);
  }, [post.trustScore, post.score, post.isLikedByMe]);

  const handleUpvote = async () => {
    if (voting) return;
    if (isOwner) {
      Alert.alert(
        "Thông báo",
        "Bạn không thể vote cho bài đăng của chính mình.",
      );
      return;
    }
    const isUnvoting = userVote === 1;
    const newVote = isUnvoting ? 0 : 1;
    const prevScore = Number(displayScore) || 0;
    const prevVote = userVote;
    let newScore = prevScore;
    if (isUnvoting) {
      newScore = prevScore - 1;
    } else {
      newScore = prevScore + (prevVote === -1 ? 2 : 1);
    }
    setDisplayScore(newScore);
    setUserVote(newVote);
    setVoting(true);
    try {
      const response = await CommunityService.voteFloodReport(
        post.id,
        newVote as any,
      );
      if (response && typeof response.newScore === "number") {
        setDisplayScore(response.newScore);
        setUserVote(response.userVote);
        onUpvote?.(post.id, response.newScore, response.userVote);
      }
    } catch {
      setDisplayScore(prevScore);
      setUserVote(prevVote);
    } finally {
      setVoting(false);
    }
  };

  const handleDownvote = async () => {
    if (voting) return;
    if (isOwner) {
      Alert.alert(
        "Thông báo",
        "Bạn không thể vote cho bài đăng của chính mình.",
      );
      return;
    }
    const isUnvoting = userVote === -1;
    const newVote = isUnvoting ? 0 : -1;
    const prevScore = Number(displayScore) || 0;
    const prevVote = userVote;
    let newScore = prevScore;
    if (isUnvoting) {
      newScore = prevScore + 1;
    } else {
      newScore = prevScore - (prevVote === 1 ? 2 : 1);
    }
    setDisplayScore(newScore);
    setUserVote(newVote);
    setVoting(true);
    try {
      const response = await CommunityService.voteFloodReport(
        post.id,
        newVote as any,
      );
      if (response && typeof response.newScore === "number") {
        setDisplayScore(response.newScore);
        setUserVote(response.userVote);
        onDownvote?.(post.id, response.newScore, response.userVote);
      }
    } catch {
      setDisplayScore(prevScore);
      setUserVote(prevVote);
    } finally {
      setVoting(false);
    }
  };

  useEffect(() => {
    if (!post.authorId) return;
    async function fetchUserInfo() {
      try {
        const response = await CommunityService.getUserInfo(post.authorId);
        if (response.success && response.user) {
          if (response.user.avatarUrl) setUserAvatar(response.user.avatarUrl);
          if (response.user.displayName) setUserName(response.user.displayName);
        }
      } catch {
        // silently fail
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
    if (post.latitude && post.longitude) {
      // Navigate to Map and show report
      router.push({
        pathname: "/map",
        params: { 
          reportId: post.id,
          reportLat: post.latitude,
          reportLng: post.longitude,
          reportSeverity: post.severity || "medium",
          reportCreatedAt: post.createdAt,
        },
      } as any);
    } else {
      router.push({
        pathname: "/community/[id]",
        params: { id: post.id },
      } as any);
    }
  };

  const handleEdit = () => {
    setShowMenu(false);
    router.push({
      pathname: "/community/edit-post",
      params: { postId: post.id },
    } as any);
  };

  const queryClient = useQueryClient();

  const handleDelete = () => {
    setShowMenu(false);
    Alert.alert("Xóa bài đăng", "Bạn có chắc muốn xóa bài đăng này không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await CommunityService.deleteFloodReport(post.id);
            // Invalidate map markers so they refresh immediately
            queryClient.invalidateQueries({ queryKey: [COMMUNITY_REPORTS_QUERY_KEY] });
            onDeletePost?.(post.id);
          } catch {
            Alert.alert("Lỗi", "Không thể xóa bài đăng");
          }
        },
      },
    ]);
  };

  // Status config
  const getStatusConfig = () => {
    switch (post.waterLevelStatus) {
      case "safe":
        return {
          label: "An toàn",
          color: "#10B981",
          bg: isDarkColorScheme ? "rgba(16,185,129,0.12)" : "#ECFDF5",
          border: isDarkColorScheme ? "rgba(16,185,129,0.25)" : "#A7F3D0",
          icon: "shield-checkmark" as const,
        };
      case "warning":
        return {
          label: "Cảnh báo",
          color: "#F59E0B",
          bg: isDarkColorScheme ? "rgba(245,158,11,0.12)" : "#FFFBEB",
          border: isDarkColorScheme ? "rgba(245,158,11,0.25)" : "#FCD34D",
          icon: "warning" as const,
        };
      case "danger":
        return {
          label: "Nguy hiểm",
          color: "#EF4444",
          bg: isDarkColorScheme ? "rgba(239,68,68,0.12)" : "#FEF2F2",
          border: isDarkColorScheme ? "rgba(239,68,68,0.25)" : "#FCA5A5",
          icon: "flame" as const,
        };
      default:
        return null;
    }
  };

  const statusConfig = getStatusConfig();

  const confidenceConfig = {
    high: { label: "Cao", color: "#10B981" },
    medium: { label: "TB", color: "#F59E0B" },
    low: { label: "Thấp", color: "#94A3B8" },
  };

  const confidence = post.confidenceLevel
    ? confidenceConfig[post.confidenceLevel]
    : null;

  const colors = {
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    border: isDarkColorScheme ? "#334155" : "#F1F5F9",
    text: isDarkColorScheme ? "#F1F5F9" : "#0F172A",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    divider: isDarkColorScheme ? "#334155" : "#F1F5F9",
  };

  const renderMedia = () => {
    if (!media || media.length === 0) return null;

    if (media.length === 1) {
      const firstMedia = media[0];
      if (firstMedia.mediaType === "video") {
        return (
          <View style={{ overflow: "hidden" }}>
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
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => {
            const photoIndex = imageUris.findIndex(
              (i) => i.uri === firstMedia.mediaUrl,
            );
            if (photoIndex >= 0) {
              setCurrentImageIndex(photoIndex);
              setIsImageViewVisible(true);
            }
          }}
        >
          <View
            style={{
              width: MEDIA_WIDTH,
              height: MEDIA_HEIGHT,
              overflow: "hidden",
              backgroundColor: isDarkColorScheme ? "#0B1120" : "#F1F5F9",
            }}
          >
            <Image
              source={{ uri: firstMedia.mediaUrl }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <View
        style={{
          position: "relative",
          width: MEDIA_WIDTH,
          height: MEDIA_HEIGHT,
          overflow: "hidden",
          backgroundColor: isDarkColorScheme ? "#0B1120" : "#F1F5F9",
        }}
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
                <View
                  style={{
                    width: MEDIA_WIDTH,
                    height: MEDIA_HEIGHT,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
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
              <TouchableOpacity
                activeOpacity={0.95}
                onPress={() => {
                  const photoIndex = imageUris.findIndex(
                    (i) => i.uri === item.mediaUrl,
                  );
                  if (photoIndex >= 0) {
                    setCurrentImageIndex(photoIndex);
                    setIsImageViewVisible(true);
                  }
                }}
                style={{
                  width: MEDIA_WIDTH,
                  height: MEDIA_HEIGHT,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  source={{ uri: item.mediaUrl }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            );
          }}
        />

        {/* Carousel dots */}
        {media.length > 1 && (
          <View
            style={{
              position: "absolute",
              bottom: 14,
              left: 0,
              right: 0,
              flexDirection: "row",
              justifyContent: "center",
              gap: 5,
            }}
          >
            {media.map((_, index) => (
              <View
                key={index}
                style={{
                  width: index === activeCarouselIndex ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor:
                    index === activeCarouselIndex
                      ? "#6366F1"
                      : "rgba(255,255,255,0.5)",
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
    return (
      <View
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          backgroundColor: "rgba(0,0,0,0.5)",
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          zIndex: 10,
        }}
      >
        <Ionicons name="images" size={11} color="white" />
        <Text style={{ color: "white", fontSize: 10, fontWeight: "700" }}>
          {activeCarouselIndex + 1}/{media.length}
        </Text>
      </View>
    );
  };

  return (
    <View
      style={{
        marginHorizontal: 12,
        marginBottom: 10,
        backgroundColor: colors.cardBg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.divider,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDarkColorScheme ? 0.15 : 0.04,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      {/* ═══ 1. Header ═══ */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          paddingHorizontal: 14,
          paddingTop: 12,
          paddingBottom: 10,
        }}
      >
        {/* Avatar */}
        <TouchableOpacity
          onPress={handleOpenProfile}
          activeOpacity={0.7}
          style={{ marginRight: 10 }}
        >
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              overflow: "hidden",
              backgroundColor: isDarkColorScheme ? "#334155" : "#E2E8F0",
            }}
          >
            {userAvatar ? (
              <Image
                source={{ uri: userAvatar }}
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <LinearGradient
                colors={["#6366F1", "#8B5CF6"]}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="person" size={16} color="white" />
              </LinearGradient>
            )}
          </View>
        </TouchableOpacity>

        {/* Name + Location + Status (middle, takes remaining space) */}
        <TouchableOpacity
          onPress={handleOpenProfile}
          activeOpacity={0.7}
          style={{ flex: 1, marginRight: 8 }}
        >
          {/* Row 1: Name + Time */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flexWrap: "nowrap",
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontSize: 13,
                fontWeight: "700",
                letterSpacing: -0.2,
                flexShrink: 1,
              }}
              numberOfLines={1}
            >
              {userName}
            </Text>
            <Text
              style={{
                color: colors.subtext,
                fontSize: 11,
                fontWeight: "400",
                marginLeft: 5,
                flexShrink: 0,
              }}
            >
              · {post.createdAt}
            </Text>
          </View>

          {/* Row 2: Location */}
          {post.locationName && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 3,
                marginTop: 2,
              }}
            >
              <Ionicons name="location-outline" size={10} color={colors.subtext} />
              <Text
                style={{
                  color: colors.subtext,
                  fontSize: 10.5,
                  fontWeight: "400",
                }}
                numberOfLines={1}
              >
                {post.locationName}
              </Text>
            </View>
          )}

          {/* Row 3: Status badge (inline, below name) */}
          {statusConfig && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor: statusConfig.bg,
                paddingHorizontal: 7,
                paddingVertical: 3,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: statusConfig.border,
                alignSelf: "flex-start",
                marginTop: 5,
              }}
            >
              <Ionicons name={statusConfig.icon} size={10} color={statusConfig.color} />
              <Text
                style={{
                  color: statusConfig.color,
                  fontSize: 10,
                  fontWeight: "700",
                }}
              >
                {statusConfig.label}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Menu button (fixed right, never overlaps) */}
        <TouchableOpacity
          onPress={() => setShowMenu(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{
            width: 30,
            height: 30,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isDarkColorScheme
              ? "rgba(148,163,184,0.08)"
              : "#F8FAFC",
            flexShrink: 0,
          }}
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={16}
            color={colors.subtext}
          />
        </TouchableOpacity>
      </View>

      {/* ═══ Action Menu Modal ═══ */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View
            style={{
              backgroundColor: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingBottom: 36,
              paddingTop: 8,
            }}
          >
            {/* Handle bar */}
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: isDarkColorScheme ? "#475569" : "#CBD5E1",
                alignSelf: "center",
                marginBottom: 16,
              }}
            />
            {isOwner ? (
              <>
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                    paddingHorizontal: 20,
                    paddingVertical: 14,
                  }}
                  onPress={handleEdit}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      backgroundColor: isDarkColorScheme
                        ? "rgba(14,165,233,0.12)"
                        : "#F0F9FF",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="create-outline" size={18} color="#0EA5E9" />
                  </View>
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 15,
                      fontWeight: "600",
                    }}
                  >
                    Chỉnh sửa bài đăng
                  </Text>
                </TouchableOpacity>
                <View
                  style={{
                    height: 1,
                    backgroundColor: colors.divider,
                    marginHorizontal: 20,
                  }}
                />
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                    paddingHorizontal: 20,
                    paddingVertical: 14,
                  }}
                  onPress={handleDelete}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      backgroundColor: isDarkColorScheme
                        ? "rgba(239,68,68,0.12)"
                        : "#FEF2F2",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </View>
                  <Text
                    style={{
                      color: "#EF4444",
                      fontSize: 15,
                      fontWeight: "600",
                    }}
                  >
                    Xóa bài đăng
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                }}
                onPress={() => {
                  setShowMenu(false);
                  onPressReport?.(post.id);
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    backgroundColor: isDarkColorScheme
                      ? "rgba(249,115,22,0.12)"
                      : "#FFF7ED",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="flag-outline" size={18} color="#F97316" />
                </View>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 15,
                    fontWeight: "600",
                  }}
                >
                  Báo cáo bài đăng
                </Text>
              </TouchableOpacity>
            )}
            <View
              style={{
                height: 1,
                backgroundColor: colors.divider,
                marginHorizontal: 20,
              }}
            />
            <TouchableOpacity
              style={{ alignItems: "center", paddingVertical: 16 }}
              onPress={() => setShowMenu(false)}
            >
              <Text
                style={{
                  color: colors.subtext,
                  fontSize: 15,
                  fontWeight: "600",
                }}
              >
                Đóng
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ═══ 2. Media ═══ */}
      {media.length > 0 && (
        <View style={{ position: "relative", borderRadius: 0, overflow: "hidden" }}>
          {renderMedia()}
          {renderMediaCount()}
        </View>
      )}

      {/* ═══ 3. Content + Actions ═══ */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleOpenDetails}
        style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 }}
      >
        {/* Caption */}
        {post.content?.length > 0 && (
          <Text
            style={{
              color: colors.text,
              fontSize: 14,
              lineHeight: 21,
              fontWeight: "400",
              marginBottom: 8,
            }}
          >
            <Text style={{ fontWeight: "700" }}>{userName} </Text>
            {post.content}
          </Text>
        )}

        {/* Meta indicators row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginBottom: 4,
          }}
        >
          {/* Confidence */}
          {confidence && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Ionicons
                name="shield-checkmark"
                size={12}
                color={confidence.color}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: confidence.color,
                }}
              >
                Tin cậy: {confidence.label}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* ═══ 4. Engagement row ═══ */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 14,
          paddingBottom: 10,
          paddingTop: 2,
          borderTopWidth: 1,
          borderTopColor: colors.divider,
          marginTop: 2,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 2,
          }}
        >
          {/* Upvote */}
          <TouchableOpacity
            onPress={handleUpvote}
            disabled={voting}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: 12,
              backgroundColor:
                userVote === 1
                  ? isDarkColorScheme
                    ? "rgba(16,185,129,0.12)"
                    : "#ECFDF5"
                  : "transparent",
            }}
          >
            <Ionicons
              name={
                userVote === 1
                  ? "arrow-up-circle"
                  : "arrow-up-circle-outline"
              }
              size={22}
              color={userVote === 1 ? "#10B981" : colors.subtext}
            />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "800",
                color:
                  userVote === 1
                    ? "#10B981"
                    : colors.text,
              }}
            >
              {displayScore}
            </Text>
          </TouchableOpacity>

          {/* Downvote */}
          <TouchableOpacity
            onPress={handleDownvote}
            disabled={voting}
            activeOpacity={0.7}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 8,
              borderRadius: 12,
              backgroundColor:
                userVote === -1
                  ? isDarkColorScheme
                    ? "rgba(239,68,68,0.12)"
                    : "#FEF2F2"
                  : "transparent",
            }}
          >
            <Ionicons
              name={
                userVote === -1
                  ? "arrow-down-circle"
                  : "arrow-down-circle-outline"
              }
              size={22}
              color={userVote === -1 ? "#EF4444" : colors.subtext}
            />
          </TouchableOpacity>
        </View>

        {/* Share + Details */}
        <TouchableOpacity
          onPress={handleOpenDetails}
          activeOpacity={0.7}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 12,
            backgroundColor: isDarkColorScheme
              ? "rgba(99,102,241,0.08)"
              : "#EEF2FF",
          }}
        >
          <Ionicons name="open-outline" size={14} color="#6366F1" />
          <Text
            style={{
              color: "#6366F1",
              fontSize: 12,
              fontWeight: "600",
            }}
          >
            Chi tiết
          </Text>
        </TouchableOpacity>
      </View>

      {/* ═══ 5. Image Viewer Modal ═══ */}
      {imageUris.length > 0 && (
        <ImageViewing
          images={imageUris}
          imageIndex={currentImageIndex}
          visible={isImageViewVisible}
          onRequestClose={() => setIsImageViewVisible(false)}
          swipeToCloseEnabled={true}
          doubleTapToZoomEnabled={true}
        />
      )}
    </View>
  );
}
