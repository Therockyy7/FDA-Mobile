import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Text } from "~/components/ui/text";
import { PostCard } from "~/features/community/components/PostCard";
import { Post, transformFloodReportToPost } from "~/features/community/types/post-types";
import { CommunityService, UserInfo } from "~/features/community/services/community.service";

export default function ProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId?: string }>();
  const router = useRouter();

  const [user, setUser] = useState<UserInfo | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [myUserId, setMyUserId] = useState<string | null>(null);

  // Lấy userId của mình từ AsyncStorage
  useEffect(() => {
    async function getMyUserId() {
      try {
        const userData = await AsyncStorage.getItem("user_data");
        if (userData) {
          const parsed = JSON.parse(userData);
          setMyUserId(parsed.id);
        }
      } catch (error) {
        console.error("Lỗi khi lấy user data:", error);
      }
    }
    getMyUserId();
  }, []);

  // Fetch user info và posts
  useEffect(() => {
    async function fetchData() {
      if (!userId) return;

      setLoading(true);
      try {
        // Fetch user info
        const userResponse = await CommunityService.getUserInfo(userId);
        if (userResponse.success && userResponse.user) {
          setUser(userResponse.user);
        }

        // Fetch user's posts
        const postsResponse = await CommunityService.getUserReports(userId);
        if (postsResponse.success && postsResponse.items) {
          const transformedPosts = postsResponse.items.map(transformFloodReportToPost);
          setPosts(transformedPosts);
        }
      } catch (error) {
        console.error("Lỗi khi fetch profile:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/community" as any);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-100 dark:bg-slate-950 items-center justify-center">
        <ActivityIndicator size="large" color="#0EA5E9" />
      </SafeAreaView>
    );
  }

  const isMyProfile = myUserId === userId;

  return (
    <SafeAreaView className="flex-1 bg-slate-100 dark:bg-slate-950">
      <View className="flex-1 bg-slate-100 dark:bg-slate-950">
        {/* Header */}
        <View className="px-4 pt-4 pb-3 bg-slate-50 dark:bg-slate-900">
          <View className="flex-row items-center justify-between mb-3">
            <TouchableOpacity
              onPress={handleBack}
              hitSlop={8}
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color="#0F172A"
              />
            </TouchableOpacity>
            <Text className="text-slate-900 dark:text-white font-semibold text-sm">
              {isMyProfile ? "Trang cá nhân" : "Trang cá nhân"}
            </Text>
            <View className="w-6" />
          </View>

          {/* User Info */}
          <View className="flex-row items-center gap-3">
            <View className="w-14 h-14 rounded-full bg-slate-300 dark:bg-slate-700 overflow-hidden border border-slate-200 dark:border-slate-700">
              {user?.avatarUrl ? (
                <Image
                  source={{ uri: user.avatarUrl }}
                  className="w-full h-full"
                />
              ) : (
                <View className="flex-1 items-center justify-center">
                  <Ionicons name="person" size={28} color="#94A3B8" />
                </View>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 dark:text-white font-semibold text-base">
                {user?.displayName || "Người dùng"}
              </Text>
              <Text className="text-xs text-slate-400 dark:text-slate-500">
                {posts.length} bài đăng
              </Text>
            </View>
          </View>
        </View>

        {/* Posts List */}
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onToggleLike={() => {}}
              onPressReport={() => {}}
            />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <Ionicons name="document-text-outline" size={48} color="#CBD5E1" />
              <Text className="text-slate-400 text-base mt-4">
                {isMyProfile ? "Bạn chưa có bài đăng nào" : "Chưa có bài đăng nào"}
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </View>
    </SafeAreaView>
  );
}
