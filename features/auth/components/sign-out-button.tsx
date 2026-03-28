import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useSignOut } from "../stores/hooks";


export const SignOutButton = () => {
  const signOut = useSignOut();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      // router.replace('/(auth)/sign-in');
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };
  return (
    <Button
      variant="destructive"
      onPress={handleSignOut}
      className="w-full flex-row"
    >
      <Feather name="log-out" size={18} color="white" />
      <Text className="ml-2">Sign Out</Text>
    </Button>
  );
};
