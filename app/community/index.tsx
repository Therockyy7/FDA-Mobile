import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text } from "~/components/ui/text";

import { PostCard } from "~/features/community/components/PostCard";
import { CommunityService } from "~/features/community/services/community.service";
import {
  Post,
  transformFloodReportToPost,
} from "~/features/community/types/post-types";

export default function CommunityScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
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

  const fetchCommunityReports = useCallback(async (filter?: string) => {
    try {
      setLoading(true);
      const params: any = {
        pageNumber: 1,
        pageSize: 20,
      };

      // Apply severity filter
      if (filter && filter !== "all") {
        params.severity = filter === "danger" ? "high" : filter;
      }

      const response = await CommunityService.getCommunityReports(params);

      if (response.success && response.items) {
        const transformedPosts = response.items.map(transformFloodReportToPost);
        setPosts(transformedPosts);
        setTotalCount(response.totalCount);
      }
    } catch (error) {
      console.error("Error fetching community reports:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleReport = (postId: string) => {
    console.log("report", postId);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCommunityReports(activeFilter);
    setRefreshing(false);
  };

  const filters = [
    { id: "all", label: "Tất cả", icon: "grid-outline" },
    {
      id: "danger",
      label: "Khẩn cấp",
      icon: "warning-outline",
      apiSeverity: "high",
    },
    {
      id: "warning",
      label: "Cảnh báo",
      icon: "alert-circle-outline",
      apiSeverity: "medium",
    },
    {
      id: "safe",
      label: "An toàn",
      icon: "checkmark-circle-outline",
      apiSeverity: "low",
    },
  ];

  const filteredPosts =
    activeFilter === "all"
      ? posts
      : posts.filter((p) => p.waterLevelStatus === activeFilter);

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    fetchCommunityReports(filterId);
  };

  // Reload posts when screen comes into focus (e.g., after edit/create)
  useFocusEffect(
    useCallback(() => {
      fetchCommunityReports();
    }, [fetchCommunityReports])
  );

  const renderHeader = () => (
    <View>
      {/* Hero Header */}
      <LinearGradient
        colors={["#0EA5E9", "#0284C7", "#0369A1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop:
            Platform.OS === "android"
              ? (StatusBar.currentHeight || 0) + 16
              : 60,
          paddingBottom: 20,
          paddingHorizontal: 16,
        }}
      >
        {/* Top Bar */}
        <View className="flex-row items-center justify-between mb-5">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>

          <View className="flex-row items-center gap-2">
            <TouchableOpacity className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
              <Ionicons name="search" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push({
                pathname: "/community/profile",
                params: { userId: myUserId || "" },
              } as any)}
              className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
            >
              <Ionicons name="person-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Title Area */}
        <View className="items-center mb-4">
          <View className="w-16 h-16 rounded-2xl bg-white/20 items-center justify-center mb-3">
            <Ionicons name="people" size={32} color="white" />
          </View>
          <Text className="text-white text-2xl font-bold text-center">
            Cộng đồng Flood Monitor
          </Text>
          <Text className="text-white/80 text-sm text-center mt-1">
            Cùng nhau chia sẻ, cảnh báo tình hình mưa lũ
          </Text>
        </View>

        {/* Stats Row */}
        <View className="flex-row items-center justify-center gap-6">
          <View className="items-center">
            <Text className="text-white text-xl font-bold">
              {totalCount || 156}
            </Text>
            <Text className="text-white/70 text-xs">Bài đăng</Text>
          </View>
          <View className="w-px h-8 bg-white/30" />
          <View className="items-center">
            <Text className="text-white text-xl font-bold">2.3K</Text>
            <Text className="text-white/70 text-xs">Thành viên</Text>
          </View>
          <View className="w-px h-8 bg-white/30" />
          <View className="items-center">
            <Text className="text-white text-xl font-bold">12</Text>
            <Text className="text-white/70 text-xs">Đang hoạt động</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Create Post Card */}
      <View className="px-4 -mt-4">
        <TouchableOpacity
          onPress={() => router.push("/community/create-post" as any)}
          activeOpacity={0.9}
        >
          <View className="rounded-2xl bg-white dark:bg-slate-800 p-4 shadow-lg shadow-slate-200 dark:shadow-black/40 border border-slate-100 dark:border-slate-700">
            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-11 h-11 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 items-center justify-center">
                <Ionicons name="person" size={22} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-400 dark:text-slate-500 text-sm">
                  Bạn muốn chia sẻ điều gì?
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
              <TouchableOpacity className="flex-row items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
                <Ionicons name="camera" size={18} color="#10B981" />
                <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  Ảnh/Video
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center gap-2 px-3 py-2 rounded-xl bg-orange-50 dark:bg-orange-900/30">
                <Ionicons name="location" size={18} color="#F97316" />
                <Text className="text-orange-600 dark:text-orange-400 text-xs font-semibold">
                  Vị trí
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center gap-2 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-900/30">
                <Ionicons name="alert-circle" size={18} color="#F43F5E" />
                <Text className="text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  Khẩn cấp
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <View className="px-4 py-4">
        <View className="flex-row gap-2">
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              onPress={() => handleFilterChange(filter.id)}
              activeOpacity={0.8}
            >
              <View
                className={`flex-row items-center gap-1.5 px-3 py-2 rounded-full ${
                  activeFilter === filter.id
                    ? "bg-sky-500"
                    : "bg-slate-100 dark:bg-slate-800"
                }`}
              >
                <Ionicons
                  name={filter.icon as any}
                  size={14}
                  color={activeFilter === filter.id ? "white" : "#64748B"}
                />
                <Text
                  className={`text-xs font-semibold ${
                    activeFilter === filter.id
                      ? "text-white"
                      : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {filter.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Section Title */}
      <View className="px-4 pb-3 flex-row items-center justify-between">
        <Text className="text-slate-900 dark:text-white text-base font-bold">
          Bài đăng gần đây
        </Text>
        <View className="flex-row items-center gap-1">
          <Ionicons name="time-outline" size={14} color="#64748B" />
          <Text className="text-slate-500 text-xs">Mới nhất</Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <Ionicons name="water-outline" size={64} color="#CBD5E1" />
      <Text className="text-slate-400 text-base mt-4">Chưa có báo cáo nào</Text>
      <Text className="text-slate-400 text-sm mt-1">
        Hãy là người đầu tiên chia sẻ
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-100 dark:bg-slate-950">
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="px-4">
            <PostCard
              post={item}
              onPressReport={handleReport}
            />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0EA5E9"
          />
        }
      />
    </View>
  );
}
