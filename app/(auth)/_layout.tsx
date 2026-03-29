import { Stack, useRouter, useSegments } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuthLoading, useUser } from "~/features/auth/stores/hooks";

export default function AuthRoutesLayout() {
  const user = useUser();
  const loading = useAuthLoading();
  const router = useRouter();
  const segments = useSegments(); // ví dụ: ["(auth)", "phone-otp"]

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const current = segments[1]; // tên screen sau "(auth)"

  //  console.log("AUTH layout segments:", segments, "user?", !!user);
  // Chỉ redirect nếu đã login và đang ở các màn auth gốc
  const authEntryScreens = ["sign-in", "sign-up", "identifier"]; // chỉnh theo project
  if (user && authEntryScreens.includes(current ?? "")) {
    router.replace("/(tabs)/map");
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
