import { Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNetworkStore } from "~/lib/stores/useNetworkStore";

export function OfflineBanner() {
  const isOnline = useNetworkStore((s) => s.isOnline);
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(isOnline ? -150 : 0);

  translateY.value = withSpring(isOnline ? -150 : 0, { damping: 15, stiffness: 120 });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: insets.top,
          left: 0,
          right: 0,
          zIndex: 9999,
        },
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      <View className="mx-4 mt-2 flex-row items-center justify-center gap-2 rounded-xl bg-gray-800 px-4 py-2.5 shadow-lg">
        <View className="h-2 w-2 rounded-full bg-red-400" />
        <Text className="text-sm font-medium text-white">
          Không có kết nối mạng — đang hiển thị dữ liệu đã lưu
        </Text>
      </View>
    </Animated.View>
  );
}
