// features/map/components/common/MapBottomSheet.tsx
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { StyleSheet } from "react-native";
import { useColorScheme } from "~/lib/useColorScheme";

interface MapBottomSheetProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  snapPoints?: string[];
  enableDynamicSizing?: boolean;
  enableScroll?: boolean;
}

export function MapBottomSheet({
  children,
  isOpen,
  onClose,
  snapPoints: customSnapPoints,
  enableDynamicSizing = false,
  enableScroll = true,
}: MapBottomSheetProps) {
  const { isDarkColorScheme } = useColorScheme();
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Default snap points
  const snapPoints = useMemo(
    () => customSnapPoints || ["45%", "85%"],
    [customSnapPoints],
  );

  // Open/close sheet based on isOpen prop
  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isOpen]);

  // Handle sheet changes
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose],
  );

  // Render backdrop
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    [],
  );

  const colors = {
    background: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    handle: isDarkColorScheme ? "#475569" : "#E2E8F0",
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={enableDynamicSizing ? undefined : snapPoints}
      enableDynamicSizing={enableDynamicSizing}
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: colors.background,
      }}
      handleIndicatorStyle={{
        backgroundColor: colors.handle,
        width: 40,
        height: 4,
      }}
      style={styles.sheet}
    >
      {enableScroll && isOpen ? (
        <BottomSheetScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </BottomSheetScrollView>
      ) : (
        children
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 16,
  },
  contentContainer: {
    paddingBottom: 24,
  },
});
