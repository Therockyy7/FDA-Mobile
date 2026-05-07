// features/map/components/overlays/navigation/NavigationHUD.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { TopInstructionCard } from "./TopInstructionCard";
import { ETABar } from "./ETABar";
import { RecenterButton } from "./RecenterButton";
import { OFFLINE_BANNER_HEIGHT } from "~/components/OfflineBanner";
import { useNetworkStore } from "~/lib/stores/useNetworkStore";

interface NavigationHUDProps {
  instruction: any;
  nextInstruction: any;
  distanceToNextTurn: number;
  remainingDistance: number;
  remainingTime: number;
  isOffRoute: boolean;
  isFollowingUser: boolean;
  routeWarning?: string | null;
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
  routeWarning,
  onExit,
  onRecenter,
}: NavigationHUDProps) {
  const insets = useSafeAreaInsets();
  const isOnline = useNetworkStore((s) => s.isOnline);
  const offlineOffset = isOnline ? 0 : OFFLINE_BANNER_HEIGHT;
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    if (!routeWarning) return;
    setToastVisible(true);
    const timer = setTimeout(() => setToastVisible(false), 10000);
    return () => clearTimeout(timer);
  }, [routeWarning]);

  return (
    <>
      <TopInstructionCard
        instruction={instruction}
        nextInstruction={nextInstruction}
        distanceToNextTurn={distanceToNextTurn}
        isOffRoute={isOffRoute}
        insetsTop={insets.top + offlineOffset}
      />

      {toastVisible && routeWarning && (
        <View style={[warningStyle.container, { top: insets.top + offlineOffset + 124 }]}>
          <Ionicons name="warning" size={16} color="white" />
          <Text style={warningStyle.text}>{routeWarning}</Text>
          <TouchableOpacity onPress={() => setToastVisible(false)} hitSlop={8}>
            <Ionicons name="close" size={18} color="white" />
          </TouchableOpacity>
        </View>
      )}

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

const warningStyle = {
  container: {
    position: "absolute" as const,
    left: 0,
    right: 0,
    zIndex: 200,
    marginTop: 8,
    marginHorizontal: 12,
    backgroundColor: "#EA580C",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    shadowColor: "#EA580C",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  text: {
    color: "white",
    fontSize: 13,
    fontWeight: "600" as const,
    flex: 1,
  },
};
