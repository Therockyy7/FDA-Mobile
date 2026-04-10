import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, View } from "react-native";

import { Text } from "~/components/ui/text";
import type { OnboardingSlide as Slide } from "~/features/onboarding/constants/onboardingSlides";

type Props = {
  slide: Slide;
  height: number;
  topInset: number;
};

export function OnboardingSlide({ slide, height, topInset }: Props) {
  return (
    <View style={{ flex: 1, height }}>
      <LinearGradient
        colors={slide.gradient}
        start={{ x: 0.15, y: 0.0 }}
        end={{ x: 0.85, y: 1.0 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* subtle vignette to match design depth */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.12)",
        }}
      />

      {/* Headline like design (top) */}
      <View
        style={{
          paddingTop: Math.max(28, topInset + 14),
          paddingHorizontal: 18,
        }}
      >
        <Text
          style={{
            textAlign: "center",
            color: "rgba(255,255,255,0.98)",
            fontSize: 34,
            fontWeight: "900",
            letterSpacing: 0.8,
            lineHeight: 38,
            textTransform: "uppercase",
          }}
        >
          {slide.headline}
        </Text>
      </View>

      {/* Mascot illustration — keep full, no frame */}
      <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 12 }}>
        <Image
          source={slide.image}
          resizeMode="contain"
          style={{
            width: "100%",
            height: "62%",
            marginTop: 6,
          }}
        />
      </View>
    </View>
  );
}

