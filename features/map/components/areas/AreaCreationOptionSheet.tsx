// features/map/components/areas/AreaCreationOptionSheet.tsx
// Bottom sheet with 2 options for area creation: GPS location or address search
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
    Dimensions,
    Modal,
    Pressable,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export type CreationOption = "gps" | "search";

interface AreaCreationOptionSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectOption: (option: CreationOption) => void;
}

interface OptionCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  gradientColors: readonly [string, string, ...string[]];
  onPress: () => void;
  delay: number;
  colors: {
    cardBg: string;
    text: string;
    subtext: string;
    border: string;
  };
}

function OptionCard({
  icon,
  title,
  description,
  gradientColors,
  onPress,
  delay,
  colors,
}: OptionCardProps) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(300)}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={[styles.optionCard, { borderColor: colors.border }]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.optionIconContainer}
        >
          <Ionicons name={icon} size={28} color="white" />
        </LinearGradient>

        <View style={styles.optionContent}>
          <Text style={[styles.optionTitle, { color: colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.optionDescription, { color: colors.subtext }]}>
            {description}
          </Text>
        </View>

        <View
          style={[
            styles.optionArrow,
            { backgroundColor: `${colors.border}50` },
          ]}
        >
          <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function AreaCreationOptionSheet({
  visible,
  onClose,
  onSelectOption,
}: AreaCreationOptionSheetProps) {
  const { isDarkColorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  const colors = {
    background: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    cardBg: isDarkColorScheme ? "#334155" : "#F8FAFC",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#475569" : "#E2E8F0",
    overlay: "rgba(0, 0, 0, 0.5)",
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
        onPress={onClose}
      />

      {/* Sheet Content */}
      <Animated.View
        entering={FadeIn.duration(200)}
        style={[
          styles.sheet,
          {
            backgroundColor: colors.background,
            paddingBottom: insets.bottom + 16,
          },
        ]}
      >
        {/* Handle Bar */}
        <View style={styles.handleContainer}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
        </View>

        {/* Header */}
        <LinearGradient
          colors={["#10B981", "#059669"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="add-circle" size={28} color="white" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Tạo vùng theo dõi</Text>
              <Text style={styles.headerSubtitle}>
                Chọn cách xác định vị trí
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={20} color="white" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Options */}
        <View style={styles.optionsContainer}>
          <OptionCard
            icon="navigate"
            title="Vị trí hiện tại"
            description="Sử dụng GPS của bạn làm tâm vùng theo dõi"
            gradientColors={["#3B82F6", "#2563EB"]}
            onPress={() => onSelectOption("gps")}
            delay={100}
            colors={colors}
          />

          <OptionCard
            icon="search"
            title="Tìm kiếm địa chỉ"
            description="Nhập địa chỉ để tạo vùng theo dõi"
            gradientColors={["#F97316", "#EA580C"]}
            onPress={() => onSelectOption("search")}
            delay={200}
            colors={colors}
          />
        </View>

        {/* Info Note */}
        <View style={styles.infoNote}>
          <Ionicons
            name="information-circle"
            size={16}
            color={colors.subtext}
          />
          <Text style={[styles.infoText, { color: colors.subtext }]}>
            Sau khi chọn vị trí, bạn có thể điều chỉnh bán kính và nhấn lên bản
            đồ để thay đổi vị trí.
          </Text>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.55,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    margin: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  optionsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  optionArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  infoNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 16,
    marginHorizontal: 16,
    paddingHorizontal: 12,
  },
  infoText: {
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },
});

export default AreaCreationOptionSheet;
