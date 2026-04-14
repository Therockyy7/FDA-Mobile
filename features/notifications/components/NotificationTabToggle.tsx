import React, { useEffect } from "react";
import { StyleSheet, TouchableOpacity, View, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Text } from "~/components/ui/text";
import { SHADOW } from "~/lib/design-tokens";
import { useColorScheme } from "~/lib/useColorScheme";

type TabType = "alerts" | "news";

type Props = {
  activeTab: TabType;
  onChange: (tab: TabType) => void;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TOGGLE_WIDTH = SCREEN_WIDTH - 32;
const INDICATOR_WIDTH = (TOGGLE_WIDTH - 8) / 2;
const TOGGLE_PRIMARY_COLOR = "#0077BE"; // FDA brand primary

const NotificationTabToggle: React.FC<Props> = ({ activeTab, onChange }) => {
  const { isDarkColorScheme } = useColorScheme();

  const translateX = useSharedValue(activeTab === "alerts" ? 0 : 1);

  useEffect(() => {
    translateX.value = withSpring(activeTab === "alerts" ? 0 : 1, {
      damping: 20,
      stiffness: 150,
    });
  }, [activeTab]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value * INDICATOR_WIDTH }],
  }));

  const handleToggle = (tab: TabType) => {
    if (tab !== activeTab) {
      onChange(tab);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <View
      testID="notifications-toggle-container"
      style={styles.outerContainer}
    >
      <View
        style={[
          styles.container,
          {
            width: TOGGLE_WIDTH,
            // JS-only dark mode exception: dynamic width calc prevents NativeWind use
            backgroundColor: isDarkColorScheme
              ? "rgba(255,255,255,0.05)"
              : "#F1F5F9",
          },
        ]}
      >
        <Animated.View
          testID="notifications-toggle-indicator"
          style={[
            styles.indicator,
            indicatorStyle,
            { width: INDICATOR_WIDTH },
          ]}
        />

        <TouchableOpacity
          testID="notifications-toggle-alerts"
          style={styles.tab}
          onPress={() => handleToggle("alerts")}
          activeOpacity={1}
        >
          <Text
            className={
              activeTab === "alerts"
                ? "text-sm font-extrabold text-white"
                : "text-sm font-extrabold text-slate-500 dark:text-slate-400"
            }
          >
            Lịch sử cảnh báo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          testID="notifications-toggle-news"
          style={styles.tab}
          onPress={() => handleToggle("news")}
          activeOpacity={1}
        >
          <Text
            className={
              activeTab === "news"
                ? "text-sm font-extrabold text-white"
                : "text-sm font-extrabold text-slate-500 dark:text-slate-400"
            }
          >
            Tin tức & Cập nhật
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
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
    borderRadius: 16,
    backgroundColor: TOGGLE_PRIMARY_COLOR,
    ...SHADOW.sm,
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
});

export default NotificationTabToggle;
