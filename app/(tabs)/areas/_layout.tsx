// app/(tabs)/notifications/_layout.tsx
import { Stack } from "expo-router";

export default function AreasLayout() {
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
          title: "Khu vực",
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
