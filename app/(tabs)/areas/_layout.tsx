// app/(tabs)/areas/_layout.tsx
import { Stack } from "expo-router";
import { MAP_COLORS } from "~/lib/design-tokens";

// JS-only exception: expo-router Stack screenOptions require JS color values
const BG = MAP_COLORS.light.background;

export default function AreasLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: BG,
        },
        headerShadowVisible: false,
        headerLargeTitle: true,
        headerLargeTitleStyle: {
          fontWeight: "800",
          fontSize: 32,
        },
        headerLargeStyle: {
          backgroundColor: BG,
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
