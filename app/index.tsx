import { Redirect, type Href } from "expo-router";
import React from "react";
import { View } from "react-native";

import { getOnboardingSeen } from "~/features/onboarding/lib/onboardingStorage";

export default function RootIndex() {
  const [target, setTarget] = React.useState<Href | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      const seen = await getOnboardingSeen();
      if (cancelled) return;
      setTarget((seen ? "/(tabs)/map" : "/(onboarding)") as Href);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!target) {
    return <View style={{ flex: 1, backgroundColor: "#0B1A33" }} />;
  }

  return <Redirect href={target} />;
}
