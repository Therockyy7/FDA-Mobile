// Redirect root to map tab
import { Redirect } from "expo-router";

export default function RootIndex() {
  return <Redirect href="/(tabs)/map" />;
}
