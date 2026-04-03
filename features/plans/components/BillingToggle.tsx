import React, { useEffect } from "react";
import { StyleSheet, TouchableOpacity, View, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

type BillingCycle = "monthly" | "yearly";

type Props = {
  value: BillingCycle;
  onChange: (v: BillingCycle) => void;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const INDICATOR_WIDTH = 80;
const CONTAINER_WIDTH = INDICATOR_WIDTH * 2 + 8;
const BRAND = "#007AFF";

const BillingToggle: React.FC<Props> = ({ value, onChange }) => {
  const { isDarkColorScheme } = useColorScheme();
  const isDark = isDarkColorScheme;

  const indicatorLeft = useSharedValue(value === "monthly" ? 0 : 1);

  useEffect(() => {
    indicatorLeft.value = withSpring(value === "monthly" ? 0 : 1, {
      damping: 20,
      stiffness: 150,
    });
  }, [value]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorLeft.value * INDICATOR_WIDTH }],
  }));

  const handleToggle = (v: BillingCycle) => {
    if (v !== value) {
      onChange(v);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? "rgba(255,255,255,0.05)"
              : "#F1F5F9",
            width: CONTAINER_WIDTH,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.indicator,
            indicatorStyle,
            { backgroundColor: BRAND },
          ]}
        />

        <TouchableOpacity
          style={styles.tab}
          onPress={() => handleToggle("monthly")}
          activeOpacity={1}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  value === "monthly"
                    ? "#FFFFFF"
                    : isDark
                      ? "#94A3B8"
                      : "#64748B",
              },
            ]}
          >
            Tháng
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => handleToggle("yearly")}
          activeOpacity={1}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  value === "yearly"
                    ? "#FFFFFF"
                    : isDark
                      ? "#94A3B8"
                      : "#64748B",
              },
            ]}
          >
            Năm
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
  },
  container: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 20,
    height: 48,
    position: "relative",
  },
  indicator: {
    position: "absolute",
    top: 4,
    left: 4,
    bottom: 4,
    width: INDICATOR_WIDTH,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    width: INDICATOR_WIDTH,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
});

export default BillingToggle;
