import React, { useEffect } from "react";
import { StyleSheet, TouchableOpacity, View, Dimensions } from "react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  interpolateColor
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

type BillingCycle = "monthly" | "yearly";

type Props = {
  value: BillingCycle;
  onChange: (v: BillingCycle) => void;
};

const BillingToggle: React.FC<Props> = ({ value, onChange }) => {
  const { isDarkColorScheme } = useColorScheme();
  const isDark = isDarkColorScheme;

  const translateX = useSharedValue(value === "monthly" ? 0 : 1);

  useEffect(() => {
    translateX.value = withSpring(value === "monthly" ? 0 : 1, {
      damping: 20,
      stiffness: 150,
    });
  }, [value]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value * 110 }], // Adjusted based on button width
  }));

  const handleToggle = (v: BillingCycle) => {
    if (v !== value) {
      onChange(v);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const colors = {
    bg: isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9",
    indicator: isDark ? "#3B82F6" : "#1E293B",
    activeText: "#FFFFFF",
    inactiveText: isDark ? "#64748B" : "#94A3B8",
    badgeBg: "rgba(16, 185, 129, 0.1)",
    badgeText: "#10B981",
  };

  return (
    <View style={styles.outerContainer}>
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <Animated.View style={[styles.indicator, indicatorStyle, { backgroundColor: colors.indicator }]} />
        
        <TouchableOpacity
          style={styles.tab}
          onPress={() => handleToggle("monthly")}
          activeOpacity={1}
        >
          <Text style={[
            styles.tabText, 
            { color: value === "monthly" ? colors.activeText : colors.inactiveText }
          ]}>
            Tháng
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => handleToggle("yearly")}
          activeOpacity={1}
        >
          <Text style={[
            styles.tabText, 
            { color: value === "yearly" ? colors.activeText : colors.inactiveText }
          ]}>
            Năm
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.badge, { backgroundColor: colors.badgeBg }]}>
        <Text style={[styles.badgeText, { color: colors.badgeText }]}>
          🔥 Tiết kiệm 20% khi chọn Năm
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: "center",
    gap: 16,
  },
  container: {
    flexDirection: "row",
    padding: 6,
    borderRadius: 24,
    width: 232, // Fixed width for consistent sliding
    height: 56,
    position: "relative",
  },
  indicator: {
    position: "absolute",
    top: 6,
    left: 6,
    width: 110,
    bottom: 6,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "800",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
});

export default BillingToggle;
