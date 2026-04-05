import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { useUser } from "~/features/auth/hooks/useAuth";

import { PostCard } from "~/features/community/components/PostCard";
import { CommunityService } from "~/features/community/services/community.service";
import {
  Post,
  transformFloodReportToPost,
} from "~/features/community/types/post-types";


export default function CommunityScreen() {
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();
  const [posts, setPosts] = useState<Post[]>();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const currentUser = useUser();
  const myUserId = currentUser?.id ?? null;

  // Animated header scroll
  const scrollY = useRef(new Animated.Value(0)).current;

  // CTA shimmer
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [shimmerAnim]);


  const fetchCommunityReports = useCallback(async (filter?: string) => {
    try {
      setLoading(true);
      const params: any = {
        pageNumber: 1,
        pageSize: 20,
      };

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
    { id: "all", label: "Tất cả", icon: "apps-outline" as const, color: "#6366F1" },
    {
      id: "danger",
      label: "Khẩn cấp",
      icon: "flame-outline" as const,
      color: "#EF4444",
      apiSeverity: "high",
    },
    {
      id: "warning",
      label: "Cảnh báo",
      icon: "warning-outline" as const,
      color: "#F59E0B",
      apiSeverity: "medium",
    },
    {
      id: "safe",
      label: "An toàn",
      icon: "shield-checkmark-outline" as const,
      color: "#10B981",
      apiSeverity: "low",
    },
  ];

  const filteredPosts =
    activeFilter === "all"
      ? posts
      : posts?.filter((p) => p.waterLevelStatus === activeFilter);

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    fetchCommunityReports(filterId);
  };

  useFocusEffect(
    useCallback(() => {
      fetchCommunityReports();
    }, [fetchCommunityReports]),
  );

  // Animated header opacity
  const headerBgOpacity = scrollY.interpolate({
    inputRange: [0, 180],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const colors = {
    bg: isDarkColorScheme ? "#0F172A" : "#F8FAFC",
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    text: isDarkColorScheme ? "#F1F5F9" : "#0F172A",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    softBg: isDarkColorScheme ? "#1E293B" : "#F1F5F9",
  };

  const renderHeader = () => (
    <View>
      {/* ═══ Hero Section ═══ */}
      <LinearGradient
        colors={
          isDarkColorScheme
            ? ["#1E1B4B", "#312E81", "#3730A3"]
            : ["#6366F1", "#4F46E5", "#4338CA"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop:
            Platform.OS === "android"
              ? (StatusBar.currentHeight || 0) + 12
              : 56,
          paddingBottom: 28,
        }}
      >
        {/* Decorative circles */}
        <View
          style={{
            position: "absolute",
            top: -40,
            right: -60,
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: "rgba(255,255,255,0.05)",
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: -30,
            left: -40,
            width: 150,
            height: 150,
            borderRadius: 75,
            backgroundColor: "rgba(255,255,255,0.04)",
          }}
        />

        {/* ── Top Bar ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            marginBottom: 20,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              backgroundColor: "rgba(255,255,255,0.12)",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                backgroundColor: "rgba(255,255,255,0.12)",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="search" size={18} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/community/profile",
                  params: { userId: myUserId || "" },
                } as any)
              }
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                backgroundColor: "rgba(255,255,255,0.12)",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="person-outline" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Title + Subtitle ── */}
        <View style={{ paddingHorizontal: 20 }}>
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 500 }}
          >
            <Text
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 1.5,
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Mạng lưới cộng đồng
            </Text>
            <Text
              style={{
                color: "white",
                fontSize: 26,
                fontWeight: "900",
                letterSpacing: -0.5,
                lineHeight: 32,
              }}
            >
              Flood Monitor
            </Text>
          </MotiView>

          {/* ── Stats Row ── */}
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 500, delay: 150 }}
            style={{
              flexDirection: "row",
              marginTop: 16,
              gap: 10,
            }}
          >
            {[
              {
                value: totalCount || 0,
                label: "Báo cáo",
                icon: "document-text" as const,
                valueColor: "#FCD34D",
              },
              {
                value: "2.3K",
                label: "Thành viên",
                icon: "people" as const,
                valueColor: "#A5F3FC",
              },
              {
                value: "12",
                label: "Đang online",
                icon: "radio" as const,
                valueColor: "#86EFAC",
              },
            ].map((stat, idx) => (
              <View
                key={idx}
                style={{
                  flex: 1,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  borderRadius: 16,
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.06)",
                }}
              >
                <Ionicons
                  name={stat.icon}
                  size={16}
                  color="rgba(255,255,255,0.5)"
                  style={{ marginBottom: 4 }}
                />
                <Text
                  style={{
                    color: stat.valueColor,
                    fontSize: 18,
                    fontWeight: "900",
                    letterSpacing: -0.5,
                  }}
                >
                  {stat.value}
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 9,
                    fontWeight: "600",
                    marginTop: 2,
                  }}
                >
                  {stat.label}
                </Text>
              </View>
            ))}
          </MotiView>
        </View>
      </LinearGradient>

      {/* ═══ Create Post CTA ═══ */}
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "timing", duration: 400, delay: 200 }}
        style={{ paddingHorizontal: 16, marginTop: -16 }}
      >
        <TouchableOpacity
          onPress={() => router.push("/community/create-post" as any)}
          activeOpacity={0.92}
        >
          <View
            style={{
              borderRadius: 20,
              overflow: "hidden",
              shadowColor: "#6366F1",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.15,
              shadowRadius: 14,
              elevation: 6,
            }}
          >
            <LinearGradient
              colors={
                isDarkColorScheme
                  ? ["#1E293B", "#1E293B"]
                  : ["#FFFFFF", "#FEFEFE"]
              }
              style={{
                padding: 16,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: isDarkColorScheme ? "#334155" : "#E2E8F0",
              }}
            >
              {/* Top: Avatar + Input hint */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <LinearGradient
                  colors={["#6366F1", "#8B5CF6"]}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="person" size={20} color="white" />
                </LinearGradient>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: isDarkColorScheme
                      ? "rgba(99, 102, 241, 0.08)"
                      : "#F5F3FF",
                    borderRadius: 14,
                    paddingVertical: 11,
                    paddingHorizontal: 14,
                    borderWidth: 1,
                    borderColor: isDarkColorScheme
                      ? "rgba(99, 102, 241, 0.15)"
                      : "#EDE9FE",
                  }}
                >
                  <Text
                    style={{
                      color: isDarkColorScheme ? "#94A3B8" : "#A1A1AA",
                      fontSize: 13,
                      fontWeight: "500",
                    }}
                  >
                    Báo cáo tình trạng ngập lụt...
                  </Text>
                </View>
              </View>

              {/* Bottom: Quick action chips */}
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  paddingTop: 12,
                  borderTopWidth: 1,
                  borderTopColor: isDarkColorScheme ? "#334155" : "#F1F5F9",
                }}
              >
                {[
                  {
                    icon: "camera" as const,
                    label: "Ảnh/Video",
                    bg: isDarkColorScheme
                      ? "rgba(16,185,129,0.1)"
                      : "#ECFDF5",
                    color: "#10B981",
                    borderColor: isDarkColorScheme
                      ? "rgba(16,185,129,0.2)"
                      : "#A7F3D0",
                  },
                  {
                    icon: "location" as const,
                    label: "Vị trí",
                    bg: isDarkColorScheme
                      ? "rgba(249,115,22,0.1)"
                      : "#FFF7ED",
                    color: "#F97316",
                    borderColor: isDarkColorScheme
                      ? "rgba(249,115,22,0.2)"
                      : "#FDBA74",
                  },
                  {
                    icon: "alert-circle" as const,
                    label: "Mức độ",
                    bg: isDarkColorScheme
                      ? "rgba(239,68,68,0.1)"
                      : "#FEF2F2",
                    color: "#EF4444",
                    borderColor: isDarkColorScheme
                      ? "rgba(239,68,68,0.2)"
                      : "#FCA5A5",
                  },
                ].map((chip, idx) => (
                  <View
                    key={idx}
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                      paddingVertical: 8,
                      borderRadius: 12,
                      backgroundColor: chip.bg,
                      borderWidth: 1,
                      borderColor: chip.borderColor,
                    }}
                  >
                    <Ionicons name={chip.icon} size={14} color={chip.color} />
                    <Text
                      style={{
                        color: chip.color,
                        fontSize: 11,
                        fontWeight: "700",
                      }}
                    >
                      {chip.label}
                    </Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </MotiView>

      {/* ═══ Filter Section ═══ */}
      <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 6 }}>
        {/* Section title */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                width: 4,
                height: 18,
                borderRadius: 2,
                backgroundColor: "#6366F1",
              }}
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "800",
                color: colors.text,
                letterSpacing: -0.3,
              }}
            >
              Bài đăng gần đây
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: isDarkColorScheme
                ? "rgba(99,102,241,0.1)"
                : "#EEF2FF",
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 10,
            }}
          >
            <Ionicons name="time-outline" size={12} color="#6366F1" />
            <Text
              style={{
                color: "#6366F1",
                fontSize: 11,
                fontWeight: "600",
              }}
            >
              Mới nhất
            </Text>
          </View>
        </View>

        {/* Filter chips */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          {filters.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <TouchableOpacity
                key={filter.id}
                onPress={() => handleFilterChange(filter.id)}
                activeOpacity={0.8}
                style={{ flex: 1 }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                    paddingVertical: 9,
                    borderRadius: 14,
                    backgroundColor: isActive
                      ? filter.color
                      : isDarkColorScheme
                        ? "#1E293B"
                        : "#FFFFFF",
                    borderWidth: isActive ? 0 : 1,
                    borderColor: isActive
                      ? "transparent"
                      : colors.border,
                    shadowColor: isActive ? filter.color : "transparent",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: isActive ? 0.3 : 0,
                    shadowRadius: 6,
                    elevation: isActive ? 4 : 0,
                  }}
                >
                  <Ionicons
                    name={filter.icon}
                    size={14}
                    color={isActive ? "white" : filter.color}
                  />
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      color: isActive ? "white" : colors.subtext,
                    }}
                  >
                    {filter.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "timing", duration: 500 }}
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
        paddingHorizontal: 40,
      }}
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 28,
          backgroundColor: isDarkColorScheme
            ? "rgba(99,102,241,0.1)"
            : "#EEF2FF",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <MaterialCommunityIcons
          name="water-off"
          size={36}
          color="#6366F1"
        />
      </View>
      <Text
        style={{
          color: colors.text,
          fontSize: 16,
          fontWeight: "700",
          marginBottom: 6,
        }}
      >
        Chưa có báo cáo nào
      </Text>
      <Text
        style={{
          color: colors.subtext,
          fontSize: 13,
          textAlign: "center",
          lineHeight: 20,
        }}
      >
        Hãy là người đầu tiên chia sẻ tình hình mưa lũ tại khu vực của bạn
      </Text>

      <TouchableOpacity
        onPress={() => router.push("/community/create-post" as any)}
        activeOpacity={0.85}
        style={{ marginTop: 20 }}
      >
        <LinearGradient
          colors={["#6366F1", "#8B5CF6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Ionicons name="add-circle" size={18} color="white" />
          <Text
            style={{
              color: "white",
              fontSize: 14,
              fontWeight: "700",
            }}
          >
            Tạo báo cáo
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </MotiView>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Sticky mini header (shows on scroll) */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          opacity: headerBgOpacity,
        }}
      >
        <LinearGradient
          colors={
            isDarkColorScheme
              ? ["#1E1B4B", "#1E1B4BEE"]
              : ["#6366F1", "#6366F1EE"]
          }
          style={{
            paddingTop:
              Platform.OS === "android"
                ? (StatusBar.currentHeight || 0) + 8
                : 52,
            paddingBottom: 10,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={8}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <Text
            style={{
              color: "white",
              fontSize: 16,
              fontWeight: "800",
              letterSpacing: -0.3,
            }}
          >
            Cộng đồng
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/community/create-post" as any)}
            hitSlop={8}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle" size={24} color="white" />
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>

      <Animated.FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: "timing",
              duration: 350,
              delay: Math.min(index * 60, 300),
            }}
          >
            <View style={{ paddingHorizontal: 0 }}>
              <PostCard post={item} onPressReport={handleReport} />
            </View>
          </MotiView>
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366F1"
            colors={["#6366F1"]}
            progressViewOffset={
              Platform.OS === "android"
                ? (StatusBar.currentHeight || 0) + 10
                : 0
            }
          />
        }
      />

      {/* ═══ Floating Create Button ═══ */}
      <TouchableOpacity
        onPress={() => router.push("/community/create-post" as any)}
        activeOpacity={0.9}
        style={{
          position: "absolute",
          bottom: 24,
          right: 20,
          zIndex: 50,
        }}
      >
        <LinearGradient
          colors={["#6366F1", "#7C3AED"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#6366F1",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          <Ionicons name="add" size={28} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}
