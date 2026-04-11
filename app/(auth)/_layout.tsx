import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuthLoading, useUser } from "~/features/auth/stores/hooks";

export default function AuthRoutesLayout() {
  const user = useUser();
  const loading = useAuthLoading();
  const router = useRouter();
  const segments = useSegments();

  const current = segments[1];
  const authEntryScreens = ["sign-in", "sign-up", "identifier"];
  const shouldRedirect = user && authEntryScreens.includes(current ?? "");

  useEffect(() => {
    if (!loading && shouldRedirect) {
      // Use setTimeout to ensure this pushes on the next tick, avoiding navigation race conditions
      setTimeout(() => {
        router.replace("/(tabs)/map");
      }, 0);
    }
  }, [loading, shouldRedirect, router]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (shouldRedirect) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
