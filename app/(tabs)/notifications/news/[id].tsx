import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import RenderHtml from "react-native-render-html";
import { Text } from "~/components/ui/text";
import { useMarkNewsRead } from "~/features/news/hooks/useMarkNewsRead";
import { useNewsDetail } from "~/features/news/hooks/useNewsDetail";
import { NewsPriority } from "~/features/news/types/news-types";
import { useColorScheme } from "~/lib/useColorScheme";

const getPriorityConfig = (priority: NewsPriority) => {
  switch (priority) {
    case "low":
      return { color: "#9CA3AF", label: "LOW" };
    case "high":
      return { color: "#F97316", label: "HIGH" };
    case "urgent":
      return { color: "#EF4444", label: "URGENT" };
    case "normal":
    default:
      return { color: "#3B82F6", label: "NORMAL" };
  }
};

export default function NewsDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();
  const { width } = useWindowDimensions();

  const newsId = typeof id === "string" ? id : id?.[0] || "";

  const { data, isLoading } = useNewsDetail(newsId);
  const markReadMutation = useMarkNewsRead();

  // Mark as read when entering the page if it's not read yet
  const [hasMarkedRead, setHasMarkedRead] = useState(false);

  useEffect(() => {
    if (data?.data && data.data.isRead === false && !hasMarkedRead) {
      markReadMutation.mutate(newsId);
      setHasMarkedRead(true);
    }
  }, [data, hasMarkedRead, markReadMutation, newsId]);

  const colors = {
    background: isDarkColorScheme ? "#0F172A" : "#F8FAFC",
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    text: isDarkColorScheme ? "#F1F5F9" : "#111827",
    subtext: isDarkColorScheme ? "#94A3B8" : "#6B7280",
    muted: isDarkColorScheme ? "#64748B" : "#9CA3AF",
    border: isDarkColorScheme ? "#334155" : "#E5E7EB",
    headerBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    buttonBg: isDarkColorScheme ? "#1E293B" : "#F3F4F6",
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 12, color: colors.subtext }}>Đang tải tin tức...</Text>
      </View>
    );
  }

  const article = data?.data;

  if (!article) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 40, backgroundColor: colors.background }}>
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
        <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text, marginBottom: 8, textAlign: "center" }}>
          Không tìm thấy bài viết
        </Text>
        <Text style={{ fontSize: 14, color: colors.subtext, textAlign: "center", marginBottom: 24 }}>
          Tin tức này không tồn tại hoặc đã bị xóa
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
          <Text style={{ color: "white", fontSize: 15, fontWeight: "700" }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const priorityConfig = getPriorityConfig(article.priority);

  // Parsing attachments if it's a JSON string
  let attachmentsList: string[] = [];
  try {
    if (article.attachments) {
      attachmentsList = JSON.parse(article.attachments);
    }
  } catch {
    // ignore
  }

  const publishedDate = (() => {
    try {
      return format(new Date(article.publishedAt), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi });
    } catch {
      return "Không xác định";
    }
  })();

  const htmlTagsStyles = {
    body: {
      color: colors.text,
      fontSize: 16,
      lineHeight: 24,
    },
    p: {
      marginBottom: 16,
    },
    a: {
      color: "#007AFF",
    },
    h1: { fontSize: 24, fontWeight: "700" as any, marginTop: 16, marginBottom: 8 },
    h2: { fontSize: 20, fontWeight: "700" as any, marginTop: 16, marginBottom: 8 },
    h3: { fontSize: 18, fontWeight: "600" as any, marginTop: 16, marginBottom: 8 },
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            backgroundColor: colors.headerBg,
            paddingTop: 60,
            paddingBottom: 20,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: colors.buttonBg,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {}} // share or options
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: colors.buttonBg,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="ellipsis-horizontal" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Priority Badge */}
          <View
            style={{
              alignSelf: "flex-start",
              backgroundColor: priorityConfig.color + "20",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "800",
                color: priorityConfig.color,
                textTransform: "uppercase",
              }}
            >
              {priorityConfig.label} PRIORITY
            </Text>
          </View>

          <Text style={{ fontSize: 24, fontWeight: "800", color: colors.text, lineHeight: 32, marginBottom: 12 }}>
            {article.title}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="calendar-outline" size={14} color={colors.subtext} />
              <Text style={{ fontSize: 14, fontWeight: "500", color: colors.subtext }}>
                {publishedDate}
              </Text>
            </View>
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="person-outline" size={14} color={colors.subtext} />
              <Text style={{ fontSize: 14, fontWeight: "500", color: colors.subtext }}>
                {article.authorName || "Quản trị viên"}
              </Text>
            </View>
          </View>
        </View>

        {/* Feature Image */}
        {!!article.imageUrl && (
          <Image
            source={article.imageUrl}
            style={{ width: "100%", height: width * 0.55 }}
            contentFit="cover"
            transition={200}
          />
        )}

        {/* Content Body */}
        <View style={{ padding: 20 }}>
          <RenderHtml
            contentWidth={width - 40}
            source={{ html: article.content || "" }}
            tagsStyles={htmlTagsStyles}
          />
        </View>

        {/* Attachments */}
        {attachmentsList.length > 0 && (
          <View style={{
            marginHorizontal: 20,
            marginBottom: 20,
            padding: 16,
            backgroundColor: colors.cardBg,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 12 }}>
              <Ionicons name="attach" size={18} /> File đính kèm:
            </Text>
            {attachmentsList.map((url, index) => {
              const filename = url.split("/").pop() || `File ${index + 1}`;
              return (
                <TouchableOpacity
                  key={index}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    paddingVertical: 8,
                  }}
                  onPress={() => Alert.alert("Mở File", url)}
                >
                  <Ionicons name="document-text-outline" size={20} color="#007AFF" />
                  <Text style={{ fontSize: 15, color: "#007AFF", textDecorationLine: "underline" }}>
                    {filename}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Footer Stats */}
        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 20, marginTop: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="eye-outline" size={16} color={colors.subtext} />
            <Text style={{ fontSize: 14, color: colors.subtext }}>
              {article.viewCount} lượt xem
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="book-outline" size={16} color={colors.subtext} />
            <Text style={{ fontSize: 14, color: colors.subtext }}>
              {article.readCount} lượt đọc
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
