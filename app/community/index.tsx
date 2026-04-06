import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useCallback, useState } from "react";

import {
  Image,
  Platform,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { useUser } from "~/features/auth/hooks/useAuth";
import { useColorScheme } from "~/lib/useColorScheme";

import { PostCard } from "~/features/community/components/PostCard";
import { CommunityService } from "~/features/community/services/community.service";
import {
  Post,
  transformFloodReportToPost,
} from "~/features/community/types/post-types";

// ── Constants ──────────────────────────────────────────────────
const HERO_FULL_HEIGHT = 170;
const HERO_MIN_HEIGHT = 0; // slides fully away
const SCROLL_DISTANCE = HERO_FULL_HEIGHT - HERO_MIN_HEIGHT;

export default function CommunityScreen() {
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const statusBarH =
    Platform.OS === "android"
      ? StatusBar.currentHeight || insets.top
      : insets.top;

  const [posts, setPosts] = useState<Post[]>();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const currentUser = useUser();
  const myUserId = currentUser?.id ?? null;

  // Reanimated shared value for scroll position
  const scrollY = useSharedValue(0);

  // Scroll handler (Reanimated)
  const scrollHandler = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

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
    {
      id: "all",
      label: "Tất cả",
      icon: "apps-outline" as const,
      color: "#6366F1",
    },
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

  // Dynamic metrics derived from actual posts response
  const dangerCount =
    posts?.filter((p) => p.waterLevelStatus === "danger").length || 0;
  const uniqueReporters = Array.from(
    new Set(posts?.map((p) => p.authorId) || []),
  ).slice(0, 3);

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    fetchCommunityReports(filterId);
  };

  useFocusEffect(
    useCallback(() => {
      fetchCommunityReports();
    }, [fetchCommunityReports]),
  );

  // ── Animated styles (Reanimated) ──────────────────────────
  const heroAnimStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE],
      [0, -SCROLL_DISTANCE],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE * 0.6],
      [1, 0],
      Extrapolation.CLAMP,
    );
    return { transform: [{ translateY }], opacity };
  });

  // Sticky compact bar fades in
  const stickyBarStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [SCROLL_DISTANCE * 0.5, SCROLL_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  const stickyAnimatedProps = useAnimatedProps(() => {
    return {
      pointerEvents: scrollY.value > SCROLL_DISTANCE * 0.5 ? "auto" : "none",
    } as any;
  });

  const colors = {
    bg: isDarkColorScheme ? "#0F172A" : "#F8FAFC",
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    text: isDarkColorScheme ? "#F1F5F9" : "#0F172A",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
  };

  const renderHeader = () => (
    <View>
      {/* Spacer so content starts below the hero */}
      <View style={{ height: HERO_FULL_HEIGHT }} />

      {/* ═══ Create Post CTA ═══ */}
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "timing", duration: 400, delay: 100 }}
        style={{ paddingHorizontal: 16, marginTop: 12 }}
      >
        <TouchableOpacity
          onPress={() => router.push("/community/create-post" as any)}
          activeOpacity={0.92}
        >
          <View
            style={{
              borderRadius: 18,
              overflow: "hidden",
              shadowColor: "#6366F1",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 10,
              elevation: 5,
            }}
          >
            <LinearGradient
              colors={
                isDarkColorScheme
                  ? ["#1E293B", "#1E293B"]
                  : ["#FFFFFF", "#FEFEFE"]
              }
              style={{
                padding: 14,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: isDarkColorScheme ? "#334155" : "#E2E8F0",
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <LinearGradient
                  colors={["#6366F1", "#8B5CF6"]}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="person" size={18} color="white" />
                </LinearGradient>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: isDarkColorScheme
                      ? "rgba(99, 102, 241, 0.08)"
                      : "#F5F3FF",
                    borderRadius: 12,
                    paddingVertical: 10,
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
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </MotiView>

      {/* ═══ Filter Section ═══ */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                width: 4,
                height: 16,
                borderRadius: 2,
                backgroundColor: "#6366F1",
              }}
            />
            <Text
              style={{
                fontSize: 15,
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
            <Text style={{ color: "#6366F1", fontSize: 11, fontWeight: "600" }}>
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
                    borderRadius: 12,
                    backgroundColor: isActive
                      ? filter.color
                      : isDarkColorScheme
                        ? "#1E293B"
                        : "#FFFFFF",
                    borderWidth: isActive ? 0 : 1,
                    borderColor: isActive ? "transparent" : colors.border,
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
        <MaterialCommunityIcons name="water-off" size={36} color="#6366F1" />
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

      {/* ═══ Animated Collapsible Hero ═══ */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: HERO_FULL_HEIGHT,
            zIndex: 100,
            overflow: "hidden",
          },
          heroAnimStyle,
        ]}
      >
        <LinearGradient
          colors={
            isDarkColorScheme
              ? ["#1E1B4B", "#312E81", "#3730A3"]
              : ["#6366F1", "#4F46E5", "#4338CA"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, paddingTop: statusBarH + 8, paddingBottom: 18 }}
        >
          {/* Decorative blobs */}
          <View
            style={{
              position: "absolute",
              top: -30,
              right: -50,
              width: 180,
              height: 180,
              borderRadius: 90,
              backgroundColor: "rgba(255,255,255,0.06)",
            }}
          />
          <View
            style={{
              position: "absolute",
              bottom: -20,
              left: -30,
              width: 130,
              height: 130,
              borderRadius: 65,
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
              marginBottom: 14,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                backgroundColor: "rgba(255,255,255,0.15)",
                alignItems: "center",
                justifyContent: "center",
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>

            {/* Title centred */}
            <Animated.View
              style={[
                { alignItems: "center" },
                // hide title text when hero fully visible (it appears in body)
              ]}
            >
              <Text
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 10,
                  fontWeight: "700",
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Mạng lưới cộng đồng
              </Text>
              <Text
                style={{
                  color: "white",
                  fontSize: 20,
                  fontWeight: "900",
                  letterSpacing: -0.5,
                }}
              >
                Flood Monitor
              </Text>
            </Animated.View>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/community/profile",
                    params: { userId: myUserId || "" },
                  } as any)
                }
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="person-outline" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Community Pulse Row ── */}
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "timing", duration: 500, delay: 100 }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              marginTop: 6,
            }}
          >
            {/* Active Members / Overview Pill */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isDarkColorScheme
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(255,255,255,0.15)",
                padding: 6,
                paddingRight: 16,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
              }}
            >
              <View style={{ flexDirection: "row", marginRight: 10 }}>
                {uniqueReporters.length > 0
                  ? uniqueReporters.map((id, index) => (
                      <Image
                        key={id}
                        source={{ uri: `https://i.pravatar.cc/100?u=${id}` }}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 15,
                          borderWidth: 1.5,
                          borderColor: isDarkColorScheme
                            ? "#312E81"
                            : "#4F46E5",
                          marginLeft: index > 0 ? -12 : 0,
                          zIndex: 3 - index,
                        }}
                      />
                    ))
                  : [1, 2, 3].map((num, i) => (
                      <View
                        key={num}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 15,
                          backgroundColor: "rgba(255,255,255,0.2)",
                          borderWidth: 1.5,
                          borderColor: isDarkColorScheme
                            ? "#312E81"
                            : "#4F46E5",
                          marginLeft: i > 0 ? -12 : 0,
                          zIndex: 3 - i,
                        }}
                      />
                    ))}
              </View>
              <View>
                <Text
                  style={{
                    color: "white",
                    fontSize: 13,
                    fontWeight: "900",
                    letterSpacing: -0.3,
                  }}
                >
                  {totalCount > 0
                    ? `${totalCount} báo cáo`
                    : "Đang cập nhật..."}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    marginTop: 2,
                  }}
                >
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: "#4ADE80",
                      shadowColor: "#4ADE80",
                      shadowOpacity: 0.8,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  />
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.8)",
                      fontSize: 10,
                      fontWeight: "600",
                    }}
                  >
                    Cập nhật liên tục
                  </Text>
                </View>
              </View>
            </View>

            {/* Danger Alerts Badge */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                backgroundColor: isDarkColorScheme
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(255,255,255,0.15)",
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
              }}
            >
              <LinearGradient
                colors={["#EF4444", "#F87171"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="flame" size={16} color="white" />
              </LinearGradient>
              <View style={{ paddingRight: 4 }}>
                <Text
                  style={{
                    color: "white",
                    fontSize: 16,
                    fontWeight: "900",
                    letterSpacing: -0.5,
                  }}
                >
                  {dangerCount}
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 10,
                    fontWeight: "700",
                  }}
                >
                  Nguy hiểm
                </Text>
              </View>
            </View>
          </MotiView>
        </LinearGradient>
      </Animated.View>

      {/* ═══ Sticky compact bar (fades in when hero scrolls away) ═══ */}
      <Animated.View
        animatedProps={stickyAnimatedProps}
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 101,
          },
          stickyBarStyle,
        ]}
      >
        <LinearGradient
          colors={
            isDarkColorScheme
              ? ["#1E1B4BF0", "#1E1B4BEE"]
              : ["#6366F1F0", "#4F46E5EE"]
          }
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingTop: statusBarH + 10,
            paddingBottom: 14,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: "rgba(255,255,255,0.15)",
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>

          <View style={{ alignItems: "center", gap: 2 }}>
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <Ionicons name="document-text-outline" size={10} color="white" />
              <Text style={{ color: "white", fontSize: 10, fontWeight: "700" }}>
                {totalCount} báo cáo
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/community/profile",
                params: { userId: myUserId || "" },
              } as any)
            }
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: "rgba(255,255,255,0.15)",
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="person-outline" size={18} color="white" />
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>

      {/* ═══ Content List ═══ */}
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
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366F1"
            colors={["#6366F1"]}
            progressViewOffset={
              Platform.OS === "android"
                ? (StatusBar.currentHeight || 0) + HERO_FULL_HEIGHT
                : HERO_FULL_HEIGHT
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
