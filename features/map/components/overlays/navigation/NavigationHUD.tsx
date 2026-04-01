// features/map/components/overlays/navigation/NavigationHUD.tsx
import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TopInstructionCard } from "./TopInstructionCard";
import { ETABar } from "./ETABar";
import { RecenterButton } from "./RecenterButton";

interface NavigationHUDProps {
  instruction: any;
  nextInstruction: any;
  distanceToNextTurn: number;
  remainingDistance: number;
  remainingTime: number;
  isOffRoute: boolean;
  isFollowingUser: boolean;
  onExit: () => void;
  onRecenter: () => void;
}

export function NavigationHUD({
  instruction,
  nextInstruction,
  distanceToNextTurn,
  remainingDistance,
  remainingTime,
  isOffRoute,
  isFollowingUser,
  onExit,
  onRecenter,
}: NavigationHUDProps) {
  const insets = useSafeAreaInsets();

  return (
    <>
      <TopInstructionCard
        instruction={instruction}
        nextInstruction={nextInstruction}
        distanceToNextTurn={distanceToNextTurn}
        isOffRoute={isOffRoute}
        insetsTop={insets.top}
      />

      {/* Re-center button */}
      {!isFollowingUser && (
        <View style={recenterStyle.container}>
          <RecenterButton onPress={onRecenter} />
        </View>
      )}

      <ETABar
        remainingDistance={remainingDistance}
        remainingTime={remainingTime}
        insetsBottom={insets.bottom}
        onExit={onExit}
      />
    </>
  );
}

const recenterStyle = {
  container: {
    position: "absolute" as const,
    right: 16,
    bottom: 140,
    zIndex: 100,
  },
};
