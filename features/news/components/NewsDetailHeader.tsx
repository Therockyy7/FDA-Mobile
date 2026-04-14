// features/news/components/NewsDetailHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { MAP_COLORS } from "~/lib/design-tokens";
import { useColorScheme } from "~/lib/useColorScheme";
import type { NewsPriority } from "~/features/news/types/news-types";

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

interface NewsDetailHeaderProps {
  title: string;
  priority: NewsPriority;
  publishedDate: string;
  authorName?: string;
}

export function NewsDetailHeader({
  title,
  priority,
  publishedDate,
  authorName,
}: NewsDetailHeaderProps) {
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();
  const c = isDarkColorScheme ? MAP_COLORS.dark : MAP_COLORS.light;
  const priorityConfig = getPriorityConfig(priority);

  return (
    <View
      testID="news-detail-header"
      style={{ paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, borderBottomWidth: 1 }}
      className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <TouchableOpacity
          testID="news-detail-back-button"
          onPress={() => router.back()}
          style={{ width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center" }}
          className="bg-slate-100 dark:bg-slate-700"
        >
          <Ionicons name="arrow-back" size={22} color={c.text} />
        </TouchableOpacity>

        <TouchableOpacity
          testID="news-detail-options-button"
          onPress={() => {}}
          style={{ width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center" }}
          className="bg-slate-100 dark:bg-slate-700"
        >
          <Ionicons name="ellipsis-horizontal" size={22} color={c.text} />
        </TouchableOpacity>
      </View>

      <View
        testID="news-detail-priority-badge"
        style={{
          alignSelf: "flex-start",
          backgroundColor: priorityConfig.color + "20",
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 8,
          marginBottom: 12,
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: "800", color: priorityConfig.color, textTransform: "uppercase" }}>
          {priorityConfig.label} PRIORITY
        </Text>
      </View>

      <Text
        testID="news-detail-title"
        style={{ fontSize: 24, fontWeight: "800", lineHeight: 32, marginBottom: 12 }}
        className="text-slate-900 dark:text-slate-100"
      >
        {title}
      </Text>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Ionicons name="calendar-outline" size={14} color={c.subtext} />
          <Text
            testID="news-detail-published-date"
            style={{ fontSize: 14, fontWeight: "500" }}
            className="text-slate-500 dark:text-slate-400"
          >
            {publishedDate}
          </Text>
        </View>
        <View style={{ width: 4, height: 4, borderRadius: 2 }} className="bg-slate-300 dark:bg-slate-600" />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Ionicons name="person-outline" size={14} color={c.subtext} />
          <Text
            testID="news-detail-author"
            style={{ fontSize: 14, fontWeight: "500" }}
            className="text-slate-500 dark:text-slate-400"
          >
            {authorName || "Quản trị viên"}
          </Text>
        </View>
      </View>
    </View>
  );
}
