// app/(tabs)/notifications/_layout.tsx
import { Stack } from "expo-router";

export default function NotificationsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Thông báo" }} />
      <Stack.Screen name="[id]" options={{ title: "Chi tiết thông báo" }} />
      <Stack.Screen name="news/[id]" options={{ title: "Chi tiết tin tức" }} />
    </Stack>
  );
}
