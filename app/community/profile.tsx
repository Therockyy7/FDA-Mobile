import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "~/components/ui/text";
import { PostCard } from "~/features/community/components/PostCard";
import {
  CommunityService,
  UserInfo,
} from "~/features/community/services/community.service";
import {
  Post,
  transformFloodReportToPost,
} from "~/features/community/types/post-types";

export default function ProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId?: string }>();
  const router = useRouter();

  const [user, setUser] = useState<UserInfo | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  const fetchData = async () => {
    if (!userId) return;

    try {
      // Fetch user info
      const userResponse = await CommunityService.getUserInfo(userId);
      if (userResponse.success && userResponse.user) {
        setUser(userResponse.user);
      }

      // Fetch user's posts
      const postsResponse = await CommunityService.getUserReports(userId);
      if (postsResponse.success && postsResponse.items) {
        const transformedPosts = postsResponse.items.map(
          transformFloodReportToPost,
        );
        setPosts(transformedPosts);
      }
    } catch (error) {
      console.error("Lỗi khi fetch profile:", error);
    }
  };

  // Fetch user info và posts
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await fetchData();
      setLoading(false);
    }
    loadData();
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/community" as any);
    }
  };

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const isMyProfile = myUserId === userId;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-100 dark:bg-slate-950 items-center justify-center">
        <ActivityIndicator size="large" color="#0EA5E9" />
      </SafeAreaView>
    );
  }

  const renderHeader = () => {
    const totalTrustScore = posts.reduce(
      (sum, p) => sum + (p.trustScore || p.score || 0),
      0,
    );
    const trustLevel =
      totalTrustScore > 100
        ? "Uy tín cao"
        : totalTrustScore > 50
          ? "Đáng tin cậy"
          : "Thành viên mới";
    const trustColor =
      totalTrustScore > 100
        ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
        : totalTrustScore > 50
          ? "text-[#007AFF] bg-blue-50 dark:bg-blue-950/30"
          : "text-slate-500 bg-slate-100 dark:bg-slate-800";
    const trustIcon =
      totalTrustScore > 100
        ? "shield-checkmark"
        : totalTrustScore > 50
          ? "shield-half"
          : "person";

    return (
      <View>
        {/* Cover & Avatar */}
        <View className="relative z-10">
          {/* Cover */}
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            }}
            className="h-44 w-full"
            resizeMode="cover"
          />
          {/* Dark overlay for cover */}
          <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/30" />

          {/* Avatar Area */}
          <View className="absolute -bottom-14 left-5 flex-row items-end">
            <View className="relative">
              <View className="w-28 h-28 rounded-full border-[5px] border-white dark:border-slate-900 bg-white dark:bg-slate-800 shadow-md">
                {user?.avatarUrl ? (
                  <Image
                    source={{ uri: user.avatarUrl }}
                    className="w-full h-full rounded-full"
                  />
                ) : (
                  <View className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center">
                    <Ionicons name="person" size={48} color="#94A3B8" />
                  </View>
                )}
              </View>
              {/* Active Badge Overlay */}
              <View className="absolute bottom-2 right-2 w-7 h-7 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full items-center justify-center shadow-sm">
                <Ionicons name="checkmark-sharp" size={14} color="white" />
              </View>
            </View>
          </View>

          {/* Action Buttons Float */}
          {/* <View className="absolute -bottom-6 right-5">
             {isMyProfile ? (
                 <TouchableOpacity
                  className="px-5 py-2.5 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 flex-row items-center gap-2"
                  onPress={() => {}}
                >
                  <Ionicons name="pencil" size={16} color="#0B1A33" className="dark:color-white" style={{ color: '#64748B' }} />
                  <Text className="text-sm font-bold text-slate-800 dark:text-white">Sửa hồ sơ</Text>
                </TouchableOpacity>
             ): (
                 <View className={`px-4 py-2 rounded-full flex-row items-center gap-1.5 shadow-sm border border-slate-100 dark:border-slate-800 ${trustColor}`}>
                   <Ionicons name={trustIcon as any} size={16} color={totalTrustScore > 100 ? "#10B981" : totalTrustScore > 50 ? "#007AFF" : "#64748B"} />
                   <Text className="text-xs font-bold">{trustLevel}</Text>
                 </View>
             )}
          </View> */}
        </View>

        {/* User Info Content */}
        <View className="px-5 pt-20 pb-6 bg-white dark:bg-slate-900 rounded-b-3xl shadow-sm border-b border-slate-100 dark:border-slate-800">
          <View>
            <Text className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {user?.displayName || "Người dùng"}
            </Text>
            <View className="flex-row items-center gap-2 mt-2">
              <View className="flex-row items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 rounded-full">
                <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <Text className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {user?.status === "ACTIVE" ? "Đang hoạt động" : user?.status}
                </Text>
              </View>
              <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Thành viên cộng đồng
              </Text>
            </View>
          </View>

          {/* Stats Cards Dashboard */}
          <View className="flex-row gap-4 mt-8">
            <View className="flex-1 bg-slate-50 dark:bg-slate-800/80 p-4 rounded-3xl border border-slate-100 dark:border-slate-700/50 items-start relative overflow-hidden">
              <View className="absolute -right-4 -top-4 opacity-10">
                <Ionicons name="document-text" size={80} color="#0EA5E9" />
              </View>
              <View className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 shadow-sm items-center justify-center mb-3">
                <Ionicons name="documents" size={20} color="#0EA5E9" />
              </View>
              <Text className="text-3xl font-black text-slate-900 dark:text-white">
                {posts.length}
              </Text>
              <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
                Lượt báo cáo
              </Text>
            </View>

            <View className="flex-1 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-3xl border border-blue-100 dark:border-blue-800/30 items-start relative overflow-hidden">
              <View className="absolute -right-4 -bottom-4 opacity-10">
                <Ionicons name="shield-checkmark" size={100} color="#007AFF" />
              </View>
              <View className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 shadow-sm items-center justify-center mb-3">
                <Ionicons name="star" size={20} color="#007AFF" />
              </View>
              <Text className="text-3xl font-black text-blue-900 dark:text-blue-100">
                {totalTrustScore}
              </Text>
              <Text className="text-sm font-semibold text-[#0055B3] dark:text-blue-300 mt-1">
                Điểm tin cậy
              </Text>
            </View>
          </View>

          {/* Quick Actions */}
          {isMyProfile && (
            <TouchableOpacity
              className="mt-6 bg-slate-900 dark:bg-white rounded-2xl py-4 flex-row items-center justify-center gap-2 shadow-lg"
              onPress={() => router.push("/community/create-post" as any)}
            >
              <Ionicons
                name="add-circle"
                size={22}
                color="white"
                className="dark:color-slate-900"
                style={/* @ts-ignore */ { color: "white" }}
              />
              <Text className="text-white dark:text-slate-900 font-bold text-base">
                Tạo báo cáo ngập lụt
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Posts Section Title */}
        <View className="px-6 pt-8 pb-3 bg-slate-100 dark:bg-slate-950 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Ionicons name="list" size={20} color="#64748B" />
            <Text className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
              Lịch sử các báo cáo
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-24 px-6">
      <View className="relative mb-6">
        {/* Decorative background glows */}
        <View className="absolute top-1/2 left-1/2 -mt-16 -ml-16 w-32 h-32 bg-sky-100 dark:bg-sky-900/20 rounded-full blur-xl" />
        {/* Main Icon container */}
        <View className="w-24 h-24 rounded-full bg-white dark:bg-slate-800 items-center justify-center shadow-lg border border-slate-50 dark:border-slate-700 z-10">
          <Ionicons name="rainy" size={50} color="#0EA5E9" />
        </View>
        {/* Small decorative icon */}
        <View className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-slate-900 dark:bg-slate-100 items-center justify-center shadow-md border-2 border-slate-50 dark:border-slate-800 z-20">
          <Ionicons
            name="map-outline"
            size={20}
            color="white"
            style={/* @ts-ignore */ { color: "white" }}
            className="dark:color-slate-900"
          />
        </View>
      </View>

      <Text className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">
        {isMyProfile ? "Khu vực của bạn an toàn chứ?" : "Chưa có báo cáo nào"}
      </Text>
      <Text className="text-base text-slate-500 dark:text-slate-400 text-center leading-relaxed">
        {isMyProfile
          ? "Hãy gửi báo cáo ngập lụt đầu tiên để giúp đỡ cộng đồng an toàn hơn khi di chuyển nhé."
          : "Người dùng này chưa có bất kỳ báo cáo cảnh báo ngập lụt nào."}
      </Text>

      {isMyProfile && (
        <TouchableOpacity
          className="mt-8 bg-sky-50 dark:bg-sky-900/30 px-6 py-3.5 rounded-2xl border border-sky-100 dark:border-sky-800/50 flex-row items-center gap-2"
          onPress={() => router.push("/community/create-post" as any)}
        >
          <Ionicons name="add" size={20} color="#0EA5E9" />
          <Text className="text-sky-600 dark:text-sky-400 font-bold text-base">
            Thêm báo cáo mới
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-100 dark:bg-slate-950">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 z-10">
        <TouchableOpacity
          onPress={handleBack}
          hitSlop={8}
          className="w-10 h-10 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800"
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color="#0B1A33"
            className="dark:color-white"
            style={/* @ts-ignore */ { color: "#0B1A33" }}
          />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-900 dark:text-white">
          {isMyProfile ? "Trang cá nhân" : "Hồ sơ cộng đồng"}
        </Text>
        <TouchableOpacity
          hitSlop={8}
          className="w-10 h-10 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800"
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={22}
            color="#0B1A33"
            className="dark:color-white"
            style={/* @ts-ignore */ { color: "#0B1A33" }}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            isOwner={isMyProfile}
            onPressReport={() => {}}
            onDeletePost={handleDeletePost}
          />
        )}
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
