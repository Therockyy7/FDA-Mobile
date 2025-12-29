// app/(tabs)/notifications/_layout.tsx
import { Stack } from "expo-router";

export default function NotificationsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#F9FAFB",
        },
        headerShadowVisible: false,
        headerLargeTitle: true,
        headerLargeTitleStyle: {
          fontWeight: "800",
          fontSize: 32,
        },
        headerLargeStyle: {
          backgroundColor: "#F9FAFB",
        },
      }}
    >
      {/* Danh sách notifications */}
      <Stack.Screen
        name="index"
        options={{
          title: "Thông báo",
          headerRight: () => null,
          headerShown: false,
        }}
      />
      
      {/* Detail notification */}
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false, // Detail dùng custom header
        }}
      />
    </Stack>
  );
}
