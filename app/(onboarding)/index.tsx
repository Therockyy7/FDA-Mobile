import React from "react";
import { Dimensions, Pressable, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useRouter } from "expo-router";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { OnboardingPagination } from "~/features/onboarding/components/OnboardingPagination";
import { OnboardingSlide } from "~/features/onboarding/components/OnboardingSlide";
import { ONBOARDING_SLIDES } from "~/features/onboarding/constants/onboardingSlides";
import { setOnboardingSeen } from "~/features/onboarding/lib/onboardingStorage";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function OnboardingCarouselScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const carouselRef = React.useRef<React.ElementRef<typeof Carousel>>(null);

  const isLast = activeIndex === ONBOARDING_SLIDES.length - 1;
  const bottomSafe = Math.max(18, insets.bottom + 14);
  const panelPaddingBottom = bottomSafe;

  const goNext = () => {
    if (isLast) return;
    carouselRef.current?.scrollTo({ index: activeIndex + 1, animated: true });
  };

  const skip = () => {
    carouselRef.current?.scrollTo({
      index: ONBOARDING_SLIDES.length - 1,
      animated: true,
    });
  };

  const finish = async () => {
    await setOnboardingSeen();
    router.replace("/(tabs)/map");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <Carousel
        ref={carouselRef}
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
        data={ONBOARDING_SLIDES}
        pagingEnabled
        onSnapToItem={(idx) => setActiveIndex(idx)}
        renderItem={({ item }) => (
          <OnboardingSlide slide={item} height={SCREEN_HEIGHT} topInset={insets.top} />
        )}
      />

      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 18,
          paddingBottom: panelPaddingBottom,
        }}
      >
        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              color: "rgba(255,255,255,0.98)",
              fontSize: 24,
              fontWeight: "900",
              letterSpacing: 0.4,
              textAlign: "center",
              textTransform: "uppercase",
            }}
          >
            {ONBOARDING_SLIDES[activeIndex]?.headline.replace("\n", " ")}
          </Text>

          <Text
            style={{
              marginTop: 10,
              color: "rgba(255,255,255,0.82)",
              fontSize: 14,
              fontWeight: "600",
              lineHeight: 20,
              textAlign: "center",
            }}
          >
            {ONBOARDING_SLIDES[activeIndex]?.description}
          </Text>

          <View style={{ marginTop: 14, marginBottom: isLast ? 14 : 0 }}>
            <OnboardingPagination length={ONBOARDING_SLIDES.length} activeIndex={activeIndex} />
          </View>

          {isLast ? (
            <Button
              onPress={finish}
              className="h-14 w-full"
              style={{
                backgroundColor: "#14B86B",
                borderRadius: 999,
                marginTop: 8,
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "900", letterSpacing: 0.6 }}>
                GET STARTED
              </Text>
            </Button>
          ) : (
            <View className="w-full flex-row items-center justify-between" style={{ marginTop: 18 }}>
              <Pressable onPress={skip} hitSlop={12}>
                <Text style={{ color: "rgba(255,255,255,0.7)", fontWeight: "700" }}>
                  Bỏ qua
                </Text>
              </Pressable>
              <Button
                onPress={goNext}
                className="h-12 px-8"
                style={{ backgroundColor: "rgba(253,184,19,0.95)", borderRadius: 999 }}
              >
                <Text style={{ color: "#0B1A33", fontWeight: "900", letterSpacing: 0.4 }}>
                  Tiếp
                </Text>
              </Button>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

