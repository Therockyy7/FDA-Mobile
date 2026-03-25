import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "~/components/ui/text";
import { PostCard } from "~/features/community/components/PostCard";
import { CommunityService } from "~/features/community/services/community.service";
import {
  Post,
  transformFloodReportToPost,
} from "~/features/community/types/post-types";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPost() {
      if (!id) return;
      try {
        setLoading(true);
        const response = await CommunityService.getFloodReportById(id);
        if (response.success) {
          const transformedPost = transformFloodReportToPost({
            id: response.id,
            reporterUserId: response.reporterUserId,
            latitude: response.latitude,
            longitude: response.longitude,
            address: response.address,
            description: response.description,
            severity: response.severity,
            trustScore: response.trustScore,
            score: response.trustScore,
            status: response.status,
            confidenceLevel: response.confidenceLevel,
            createdAt: response.createdAt,
            media: response.media,
          });
          setPost(transformedPost);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError("Không thể tải bài đăng");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-100 dark:bg-slate-950 items-center justify-center">
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  if (error || !post) {
    return (
      <SafeAreaView className="flex-1 bg-slate-100 dark:bg-slate-950 items-center justify-center">
        <Text className="text-slate-500 dark:text-slate-400 text-sm">
          {error || "Không tìm thấy bài đăng."}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-100 dark:bg-slate-950 items-center justify-center">
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

      <ScrollView className="flex-1 ">
        {/* Dùng lại PostCard cho phần nội dung chính */}
        <PostCard
          post={post}
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
