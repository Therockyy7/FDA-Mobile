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

type TabType = "alerts" | "news";

type Props = {
  activeTab: TabType;
  onChange: (tab: TabType) => void;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TOGGLE_WIDTH = SCREEN_WIDTH - 32; // Matches common padding
const INDICATOR_WIDTH = (TOGGLE_WIDTH - 8) / 2;

const NotificationTabToggle: React.FC<Props> = ({ activeTab, onChange }) => {
  const { isDarkColorScheme } = useColorScheme();
  const isDark = isDarkColorScheme;

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

  const colors = {
    containerBg: isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9",
    indicator: "#007AFF", // Keep the primary blue as requested
    activeText: "#FFFFFF",
    inactiveText: isDark ? "#94A3B8" : "#64748B",
  };

  return (
    <View style={styles.outerContainer}>
      <View style={[styles.container, { backgroundColor: colors.containerBg, width: TOGGLE_WIDTH }]}>
        <Animated.View 
            style={[
                styles.indicator, 
                indicatorStyle, 
                { backgroundColor: colors.indicator, width: INDICATOR_WIDTH }
            ]} 
        />
        
        <TouchableOpacity
          style={styles.tab}
          onPress={() => handleToggle("alerts")}
          activeOpacity={1}
        >
          <Text style={[
            styles.tabText, 
            { color: activeTab === "alerts" ? colors.activeText : colors.inactiveText }
          ]}>
            Lịch sử cảnh báo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => handleToggle("news")}
          activeOpacity={1}
        >
          <Text style={[
            styles.tabText, 
            { color: activeTab === "news" ? colors.activeText : colors.inactiveText }
          ]}>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
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

export default NotificationTabToggle;
