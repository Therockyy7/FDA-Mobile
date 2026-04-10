import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Dimensions, Image, View } from "react-native";

import { Text } from "~/components/ui/text";
import type { OnboardingSlide as Slide } from "~/features/onboarding/constants/onboardingSlides";

const { height: WINDOW_HEIGHT } = Dimensions.get("window");

type Props = {
  slide: Slide;
  height: number;
  topInset?: number;
};

export function OnboardingSlide({ slide, height, topInset = 0 }: Props) {
  /* Reserve just enough for the bottom overlay (title + desc + dots + buttons ~200px) */
  const BOTTOM_PANEL_RESERVED = WINDOW_HEIGHT * 0.22;

  return (
    <View style={{ flex: 1, height }}>
      {/* Gradient background – extends past bottom for edge-to-edge */}
      <LinearGradient
        colors={slide.backgroundGradient}
        start={{ x: 0.15, y: 0.0 }}
        end={{ x: 0.85, y: 1.0 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: -80 }}
      />

      {/* Content: Top Title + Mascot */}
      <View
        style={{
          flex: 1,
          paddingTop: topInset + 12,
          paddingBottom: BOTTOM_PANEL_RESERVED,
        }}
      >
        {/* ── TOP TITLE ── */}
        <View style={{ paddingHorizontal: 24, marginTop: 10 }}>
          <Text
            style={{
              color: "rgba(255,255,255,0.98)",
              fontSize: 34,
              fontWeight: "900",
              letterSpacing: 0.8,
              lineHeight: 42,
              textTransform: "uppercase",
            }}
          >
            {slide.topTitle}
          </Text>
        </View>

        {/* ── MASCOT IMAGE (hero size – fill all remaining space) ── */}
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: -8,
          }}
        >
          <Image
            source={slide.mascotImage}
            resizeMode="contain"
            style={{
              width: "110%",
              height: "110%",
            }}
          />
        </View>
      </View>
    </View>
  );
}
