// features/map/components/common/MapBottomSheet.tsx
import React from "react";
import { StyleSheet, View, Modal, Pressable, KeyboardAvoidingView, Platform, Dimensions, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SHADOW } from "~/lib/design-tokens";

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
  const insets = useSafeAreaInsets();
  const { height: SCREEN_HEIGHT } = Dimensions.get("window");

  // Parse snapPoints (e.g. "45%", "85%") to determine max height.
  // Defaults to 60% of screen height if not provided.
  const sheetMaxHeight = React.useMemo(() => {
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
      testID="map-bottom-sheet"
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
              maxHeight: sheetMaxHeight + insets.bottom + 12,
              minHeight: enableDynamicSizing ? undefined : SCREEN_HEIGHT * 0.3,
              paddingBottom: insets.bottom + 12,
            },
          ]}
          className="bg-card"
        >
          {/* Handle Indicator */}
          <View style={styles.handleIndicatorContainer}>
            <View style={styles.handleIndicator} className="bg-border" />
          </View>

          {/* Content */}
          {enableScroll ? (
            <ScrollView
              contentContainerStyle={styles.contentScroll}
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
    ...SHADOW.lg,
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
  contentScroll: {
    flexGrow: 1,
  },
  contentContainer: {
    paddingBottom: 4,
  },
});
