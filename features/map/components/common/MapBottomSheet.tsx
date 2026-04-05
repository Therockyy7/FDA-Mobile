// features/map/components/common/MapBottomSheet.tsx
import React, { useMemo, useEffect, useState } from "react";
import { StyleSheet, View, Modal, Pressable, KeyboardAvoidingView, Platform, Dimensions, ScrollView } from "react-native";
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
  const { height: SCREEN_HEIGHT } = Dimensions.get("window");

  const colors = useMemo(
    () => ({
      background: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
      handle: isDarkColorScheme ? "#475569" : "#E2E8F0",
    }),
    [isDarkColorScheme],
  );

  // Parse snapPoints (e.g. "45%", "85%") to determine max height.
  // Defaults to 60% of screen height if not provided.
  const sheetMaxHeight = useMemo(() => {
    if (!customSnapPoints || customSnapPoints.length === 0) return SCREEN_HEIGHT * 0.6;
    const highestSnap = customSnapPoints[customSnapPoints.length - 1];
    if (highestSnap.includes("%")) {
      const percentage = parseInt(highestSnap.replace("%", ""), 10);
      return (SCREEN_HEIGHT * percentage) / 100;
    }
    return SCREEN_HEIGHT * 0.6;
  }, [customSnapPoints, SCREEN_HEIGHT]);

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalContainer}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <View style={styles.backdrop} />
        </Pressable>

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              maxHeight: sheetMaxHeight,
              minHeight: enableDynamicSizing ? undefined : SCREEN_HEIGHT * 0.3,
            },
          ]}
        >
          {/* Handle Indicator */}
          <View style={styles.handleIndicatorContainer}>
            <View style={[styles.handleIndicator, { backgroundColor: colors.handle }]} />
          </View>

          {/* Content */}
          {enableScroll ? (
            <ScrollView
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
          ) : (
            <View style={styles.contentContainer}>
              {children}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 16,
    paddingTop: 12,
  },
  handleIndicatorContainer: {
    alignItems: "center",
    paddingBottom: 16,
  },
  handleIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  contentContainer: {
    paddingBottom: 24,
  },
});
