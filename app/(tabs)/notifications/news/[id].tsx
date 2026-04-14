import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, TouchableOpacity, View, useWindowDimensions } from "react-native";
import RenderHtml from "react-native-render-html";
import { Text } from "~/components/ui/text";
import { NewsDetailHeader } from "~/features/news/components/NewsDetailHeader";
import { useMarkNewsRead } from "~/features/news/hooks/useMarkNewsRead";
import { useNewsDetail } from "~/features/news/hooks/useNewsDetail";
import { useColorScheme } from "~/lib/useColorScheme";

export default function NewsDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();
  const { width } = useWindowDimensions();

  const newsId = typeof id === "string" ? id : id?.[0] || "";
  const { data, isLoading } = useNewsDetail(newsId);
  const markReadMutation = useMarkNewsRead();
  const [hasMarkedRead, setHasMarkedRead] = useState(false);

  useEffect(() => {
    if (data?.data && data.data.isRead === false && !hasMarkedRead) {
      markReadMutation.mutate(newsId);
      setHasMarkedRead(true);
    }
  }, [data, hasMarkedRead, markReadMutation, newsId]);

  if (isLoading) {
    return (
      <View
        testID="news-detail-loading"
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        className="bg-slate-50 dark:bg-[#0F172A]"
      >
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 12 }} className="text-slate-500 dark:text-slate-400">
          Đang tải tin tức...
        </Text>
      </View>
    );
  }

  const article = data?.data;

  if (!article) {
    return (
      <View
        testID="news-detail-not-found"
        style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 40 }}
        className="bg-slate-50 dark:bg-[#0F172A]"
      >
        <View
          style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: "#FEF3C7", alignItems: "center", justifyContent: "center", marginBottom: 24 }}
        >
          <Ionicons name="alert-circle-outline" size={50} color="#F59E0B" />
        </View>
        <Text style={{ fontSize: 20, fontWeight: "800", marginBottom: 8, textAlign: "center" }} className="text-slate-900 dark:text-slate-100">
          Không tìm thấy bài viết
        </Text>
        <Text style={{ fontSize: 14, textAlign: "center", marginBottom: 24 }} className="text-slate-500 dark:text-slate-400">
          Tin tức này không tồn tại hoặc đã bị xóa
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ paddingHorizontal: 32, paddingVertical: 14, backgroundColor: "#007AFF", borderRadius: 12 }}
        >
          <Text style={{ color: "white", fontSize: 15, fontWeight: "700" }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  let attachmentsList: string[] = [];
  try {
    if (article.attachments) attachmentsList = JSON.parse(article.attachments);
  } catch { /* ignore */ }

  const publishedDate = (() => {
    try {
      return format(new Date(article.publishedAt), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi });
    } catch {
      return "Không xác định";
    }
  })();

  const htmlTagsStyles = {
    body: { color: isDarkColorScheme ? "#F1F5F9" : "#111827", fontSize: 16, lineHeight: 24 },
    p: { marginBottom: 16 },
    a: { color: "#007AFF" },
    h1: { fontSize: 24, fontWeight: "700" as const, marginTop: 16, marginBottom: 8 },
    h2: { fontSize: 20, fontWeight: "700" as const, marginTop: 16, marginBottom: 8 },
    h3: { fontSize: 18, fontWeight: "600" as const, marginTop: 16, marginBottom: 8 },
  };

  return (
    <View testID="news-detail-container" style={{ flex: 1 }} className="bg-slate-50 dark:bg-[#0F172A]">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <NewsDetailHeader
          title={article.title}
          priority={article.priority}
          publishedDate={publishedDate}
          authorName={article.authorName}
        />

        {!!article.imageUrl && (
          <Image source={article.imageUrl} style={{ width: "100%", height: width * 0.55 }} contentFit="cover" transition={200} />
        )}

        <View style={{ padding: 20 }}>
          <RenderHtml contentWidth={width - 40} source={{ html: article.content || "" }} tagsStyles={htmlTagsStyles} />
        </View>

        {attachmentsList.length > 0 && (
          <View
            testID="news-detail-attachments"
            style={{ marginHorizontal: 20, marginBottom: 20, padding: 16, borderRadius: 16, borderWidth: 1 }}
            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          >
            <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 12 }} className="text-slate-900 dark:text-slate-100">
              <Ionicons name="attach" size={18} /> File đính kèm:
            </Text>
            {attachmentsList.map((url, index) => {
              const filename = url.split("/").pop() || `File ${index + 1}`;
              return (
                <TouchableOpacity
                  key={index}
                  style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8 }}
                  onPress={() => Alert.alert("Mở File", url)}
                >
                  <Ionicons name="document-text-outline" size={20} color="#007AFF" />
                  <Text style={{ fontSize: 15, color: "#007AFF", textDecorationLine: "underline" }}>{filename}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View
          testID="news-detail-stats"
          style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 20, marginTop: 10 }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="eye-outline" size={16} color={isDarkColorScheme ? "#94A3B8" : "#6B7280"} />
            <Text style={{ fontSize: 14 }} className="text-slate-500 dark:text-slate-400">
              {article.viewCount} lượt xem
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="book-outline" size={16} color={isDarkColorScheme ? "#94A3B8" : "#6B7280"} />
            <Text style={{ fontSize: 14 }} className="text-slate-500 dark:text-slate-400">
              {article.readCount} lượt đọc
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
