import React from "react";
import { View } from "react-native";

type Props = {
  length: number;
  activeIndex: number;
};

export function OnboardingPagination({ length, activeIndex }: Props) {
  return (
    <View className="flex-row items-center justify-center gap-2">
      {Array.from({ length }).map((_, idx) => {
        const isActive = idx === activeIndex;
        return (
          <View
            // eslint-disable-next-line react/no-array-index-key
            key={idx}
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              backgroundColor: isActive ? "#FDB813" : "rgba(255,255,255,0.35)",
              opacity: isActive ? 1 : 0.9,
            }}
          />
        );
      })}
    </View>
  );
}

