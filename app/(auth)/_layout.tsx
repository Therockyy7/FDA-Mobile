// app/(auth)/_layout.tsx
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuthLoading, useUser } from "~/features/auth/stores/hooks";


export default function AuthRoutesLayout() {
  const user = useUser();
  const loading = useAuthLoading();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
