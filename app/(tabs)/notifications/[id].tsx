// app/(tabs)/notifications/[id].tsx
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { Text } from "~/components/ui/text";
import { getPriorityConfig } from "~/features/notifications/lib/notifications-utils";
import { NotificationItem } from "~/features/notifications/types/notifications-types";
import { useColorScheme } from "~/lib/useColorScheme";

export default function NotificationDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();
  const queryClient = useQueryClient();

  const notification = useMemo(() => {
    // Search within React Query cache since we don't have a single GET /id endpoint
    const queries = queryClient.getQueriesData({
      queryKey: ["notifications", "history"],
    });
    for (const [, queryData] of queries) {
      if (!queryData) continue;
      const pages = (queryData as any).pages;
      if (pages) {
        const found = pages
          .flatMap((p: any) => p.notifications || [])
          .find((n: NotificationItem) => n.notificationId === id);
        if (found) return found as NotificationItem;
      }
    }
    return null;
  }, [id, queryClient]);

  const config = getPriorityConfig(notification?.severity || "info");

  // Theme colors
  const colors = {
    background: isDarkColorScheme ? "#0B1A33" : "#F8FAFC",
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    text: isDarkColorScheme ? "#F1F5F9" : "#111827",
    subtext: isDarkColorScheme ? "#94A3B8" : "#6B7280",
    muted: isDarkColorScheme ? "#64748B" : "#9CA3AF",
    border: isDarkColorScheme ? "#334155" : "#E5E7EB",
    headerBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    buttonBg: isDarkColorScheme ? "#1E293B" : "#F3F4F6",
  };

  if (!notification) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 40,
          backgroundColor: colors.background,
        }}
      >
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: "#FEF3C7",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <Ionicons name="alert-circle-outline" size={50} color="#F59E0B" />
        </View>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "800",
            color: colors.text,
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          Không tìm thấy
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.subtext,
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Thông báo này không tồn tại hoặc đã bị xóa
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            paddingHorizontal: 32,
            paddingVertical: 14,
            backgroundColor: "#007AFF",
            borderRadius: 12,
          }}
        >
          <Text style={{ color: "white", fontSize: 15, fontWeight: "700" }}>
            Quay lại
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getRiskColor = (level: number) => {
    if (level >= 40) return "#DC2626";
    if (level >= 20 && level < 40) return "#F59E0B";
    if (level >= 10 && level < 20) return "#D97706";
    return "#10B981";
  };

  const timeAgo = (() => {
    try {
      const date = new Date(notification.sentAt || notification.createdAt);
      return formatDistanceToNow(date, { addSuffix: true, locale: vi });
    } catch {
      return "Vừa xong";
    }
  })();

  const descContent = notification.content || notification.alertMessage;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 45 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            backgroundColor: colors.headerBg,
            paddingTop: 43,
            paddingBottom: 20,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <View
            style={{ flexDirection: "row", alignItems: "flex-start", gap: 16 }}
          >
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                backgroundColor: isDarkColorScheme
                  ? "rgba(148,163,184,0.15)"
                  : "rgba(15,23,42,0.06)",
                justifyContent: "center",
                alignItems: "center",
                marginTop: -4,
              }}
            >
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </TouchableOpacity>

            <View style={{ flex: 1, marginTop: -2 }}>
              {/* Priority Badge */}
              <View
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: config.color + "15",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                  marginBottom: 6,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "800",
                    color: config.color,
                    textTransform: "uppercase",
                  }}
                >
                  {config.label}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: colors.text,
                  lineHeight: 26,
                  marginBottom: 8,
                }}
              >
                {notification.title}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 4,
                }}
              >
                <Ionicons name="location" size={14} color={colors.subtext} />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.subtext,
                  }}
                >
                  {notification.stationName}
                </Text>
              </View>

              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Ionicons name="time-outline" size={14} color={colors.muted} />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color: colors.muted,
                  }}
                >
                  {timeAgo}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Water Level Card */}
        {notification.waterLevel !== undefined &&
          notification.waterLevel !== null && (
            <View
              style={{
                marginHorizontal: 20,
                marginTop: 20,
                marginBottom: 20,
                backgroundColor: colors.cardBg,
                borderRadius: 20,
                padding: 20,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDarkColorScheme ? 0 : 0.03,
                shadowRadius: 12,
                elevation: 2,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <Ionicons name="water" size={16} color="#0EA5E9" />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.subtext,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Mực nước hiện tại
                </Text>
              </View>

              {/* Main Reading Section */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "baseline",
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 40,
                    fontWeight: "800",
                    color: colors.text,
                    lineHeight: 48,
                    letterSpacing: -1,
                  }}
                >
                  {notification.waterLevel}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: colors.subtext,
                    marginLeft: 6,
                  }}
                >
                  cm
                </Text>
              </View>

              {/* Subtle Level Indicator */}
              <View
                style={{
                  height: 4,
                  backgroundColor: isDarkColorScheme
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.04)",
                  borderRadius: 2,
                  marginBottom: 16,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    width: `${Math.min((notification.waterLevel || 0) * 2, 100)}%`,
                    height: "100%",
                    backgroundColor: getRiskColor(notification.waterLevel || 0),
                    borderRadius: 2,
                  }}
                />
              </View>

              {/* Supporting Stats Row */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderTopWidth: 1,
                  borderTopColor: isDarkColorScheme
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.04)",
                  paddingTop: 12,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "500",
                      color: colors.subtext,
                      marginBottom: 4,
                    }}
                  >
                    Hiện tại
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: colors.text,
                    }}
                  >
                    {notification.waterLevel} cm
                  </Text>
                </View>

                {/* Divider */}
                <View
                  style={{
                    width: 1,
                    height: 24,
                    backgroundColor: isDarkColorScheme
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.04)",
                    marginHorizontal: 16,
                  }}
                />

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "500",
                      color: colors.subtext,
                      marginBottom: 4,
                    }}
                  >
                    Mã trạm
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: colors.text,
                    }}
                  >
                    {notification.stationCode}
                  </Text>
                </View>
              </View>
            </View>
          )}

        {/* Map Preview */}
        {notification.stationId && (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/map",
                params: { stationId: notification.stationId },
              } as any)
            }
            activeOpacity={0.8}
            style={{
              marginHorizontal: 20,
              height: 160,
              backgroundColor: colors.cardBg,
              borderRadius: 24,
              overflow: "hidden",
              marginBottom: 20,
              borderWidth: isDarkColorScheme ? 1 : 0,
              borderColor: colors.border,
              position: "relative",
            }}
          >
            {/* Map Background */}
            <View
              pointerEvents="none"
              style={{ position: "absolute", width: "100%", height: "100%" }}
            >
              <MapView
                provider={PROVIDER_GOOGLE}
                style={{
                  width: "100%",
                  height: "100%",
                  opacity: isDarkColorScheme ? 0.6 : 0.4,
                }}
                initialRegion={{
                  latitude: 16.0544,
                  longitude: 108.2022,
                  latitudeDelta: 0.1,
                  longitudeDelta: 0.1,
                }}
                cacheEnabled
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
              />
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: isDarkColorScheme
                    ? "rgba(11,26,51,0.4)"
                    : "rgba(241,245,249,0.3)",
                }}
              />
            </View>

            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 16,
              }}
            >
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 20,
                  backgroundColor: isDarkColorScheme
                    ? "rgba(30,41,59,0.9)"
                    : "rgba(255,255,255,0.9)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                <Ionicons name="map" size={28} color="#007AFF" />
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "800",
                  color: colors.text,
                  textShadowColor: isDarkColorScheme
                    ? "rgba(0,0,0,0.5)"
                    : "rgba(255,255,255,0.8)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 3,
                }}
              >
                Xem trên bản đồ
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: colors.subtext,
                  marginTop: 4,
                  textShadowColor: isDarkColorScheme
                    ? "rgba(0,0,0,0.5)"
                    : "rgba(255,255,255,0.8)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 3,
                }}
              >
                {notification.stationName}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Timeline */}
        <View
          style={{
            marginHorizontal: 20,
            backgroundColor: colors.cardBg,
            borderRadius: 24,
            padding: 20,
            marginBottom: 20,
            borderWidth: isDarkColorScheme ? 1 : 0,
            borderColor: colors.border,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 20,
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                backgroundColor: "#8B5CF620",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="git-branch-outline" size={18} color="#8B5CF6" />
            </View>
            <Text
              style={{ fontSize: 16, fontWeight: "700", color: colors.text }}
            >
              Diễn biến
            </Text>
          </View>

          <View style={{ gap: 16 }}>
            {[
              {
                icon: "time-outline",
                color: config.color,
                title: "Phát hiện ban đầu",
                desc: `${timeAgo} ${notification.waterLevel ? `- ${notification.waterLevel}cm` : ""}`,
              },
              {
                icon: "shield-checkmark-outline",
                color: "#10B981",
                title: "Hệ thống cảnh báo",
                desc: `Cấp độ ${config.label}`,
              },
              {
                icon: "megaphone-outline",
                color: "#F59E0B",
                title: "Thông báo cộng đồng",
                desc: `Đã gửi cảnh báo`,
              },
            ].map((item, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    backgroundColor: item.color + "20",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={18}
                    color={item.color}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: colors.text,
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.subtext,
                      marginTop: 2,
                    }}
                  >
                    {item.desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Description */}
        {descContent && (
          <View
            style={{
              marginHorizontal: 20,
              backgroundColor: colors.cardBg,
              borderRadius: 24,
              padding: 20,
              marginBottom: 20,
              borderWidth: isDarkColorScheme ? 1 : 0,
              borderColor: colors.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: "#06B6D420",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color="#06B6D4"
                />
              </View>
              <Text
                style={{ fontSize: 16, fontWeight: "700", color: colors.text }}
              >
                Chi tiết
              </Text>
            </View>
            <Text
              style={{ fontSize: 15, color: colors.subtext, lineHeight: 24 }}
            >
              {descContent}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={{ marginHorizontal: 20, gap: 12 }}>
          {notification.stationId && (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/map",
                  params: { stationId: notification.stationId },
                } as any)
              }
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                paddingVertical: 16,
                borderRadius: 16,
                backgroundColor: "#007AFF",
              }}
            >
              <Ionicons name="map" size={20} color="white" />
              <Text style={{ fontSize: 16, fontWeight: "700", color: "white" }}>
                Xem bản đồ
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
