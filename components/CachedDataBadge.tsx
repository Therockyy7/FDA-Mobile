import { Text, View } from "react-native";
import { useNetworkStatus } from "~/lib/hooks/useNetworkStatus";

function formatAge(since: number): string {
  const diffMs = Date.now() - since;
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "vừa mất mạng";
  if (mins < 60) return `mất mạng ${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `mất mạng ${hrs} giờ trước`;
  return "mất mạng hơn 1 ngày trước";
}

export function CachedDataBadge() {
  const { isOnline, offlineSince } = useNetworkStatus();

  if (isOnline || !offlineSince) return null;

  return (
    <View className="self-center rounded-full bg-gray-700/80 px-3 py-1">
      <Text className="text-xs text-gray-200">
        Dữ liệu đã lưu · {formatAge(offlineSince)}
      </Text>
    </View>
  );
}
