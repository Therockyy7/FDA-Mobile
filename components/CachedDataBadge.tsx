import { Text, View } from "react-native";

interface CachedDataBadgeProps {
  dataUpdatedAt: number;
  visible: boolean;
}

function formatAge(dataUpdatedAt: number): string {
  const diffMs = Date.now() - dataUpdatedAt;
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  return "hơn 1 ngày trước";
}

export function CachedDataBadge({ dataUpdatedAt, visible }: CachedDataBadgeProps) {
  if (!visible || !dataUpdatedAt) return null;

  const time = new Date(dataUpdatedAt).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View className="self-center rounded-full bg-gray-700/80 px-3 py-1">
      <Text className="text-xs text-gray-200">
        Dữ liệu lúc {time} · {formatAge(dataUpdatedAt)}
      </Text>
    </View>
  );
}
