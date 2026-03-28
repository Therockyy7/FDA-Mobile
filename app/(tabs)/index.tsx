// Redirect to map tab — previously this file was the map screen (index tab).
// After refactor, map moved to app/(tabs)/map/index.tsx.
import { Redirect } from "expo-router";

export default function TabIndexRedirect() {
  return <Redirect href="/(tabs)/map" />;
}
