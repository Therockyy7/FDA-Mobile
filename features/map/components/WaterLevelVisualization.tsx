// features/map/components/WaterLevelVisualization.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

interface WaterLevelVisualizationProps {
  waterLevel: number | null;
  unit: string;
  severity: "safe" | "caution" | "warning" | "critical" | "unknown";
  severityColor: string;
  maxLevel?: number; // Maximum level for scale (default: 300cm)
}

const VIS_HEIGHT = 240;
const COLUMN_WIDTH = 80;

export function WaterLevelVisualization({
  waterLevel,
  unit,
  severity,
  severityColor,
  maxLevel = 300,
}: WaterLevelVisualizationProps) {
  const { isDarkColorScheme } = useColorScheme();

  // Convert water level to cm
  const waterLevelCm =
    waterLevel !== null ? (unit === "m" ? waterLevel * 100 : waterLevel) : 0;

  // Calculate water height as percentage of max
  const waterPercent = Math.min((waterLevelCm / maxLevel) * 100, 100);
  const waterHeightPx = (waterPercent / 100) * VIS_HEIGHT;

  // Animation values
  const waveOffset1 = useSharedValue(0);
  const waveOffset2 = useSharedValue(0);
  const waterFillHeight = useSharedValue(0);

   
  useEffect(() => {
    // Wave animation 1
    waveOffset1.value = withRepeat(
      withSequence(
        withTiming(8, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        withTiming(-8, { duration: 1200, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    // Wave animation 2 (offset)
    waveOffset2.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
        withTiming(6, { duration: 1000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    // Water fill animation
    waterFillHeight.value = withTiming(waterHeightPx, {
      duration: 1500,
      easing: Easing.out(Easing.cubic),
    });
  }, [waterHeightPx]);

  const wave1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: waveOffset1.value }],
  }));

  const wave2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: waveOffset2.value }],
  }));

  const waterFillStyle = useAnimatedStyle(() => ({
    height: waterFillHeight.value,
  }));

  const colors = {
    background: isDarkColorScheme ? "#1E293B" : "#F8FAFC",
    cardBg: isDarkColorScheme ? "#334155" : "#FFFFFF",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#475569" : "#E2E8F0",
    columnBg: isDarkColorScheme ? "#0F172A" : "#E2E8F0",
  };

  // Generate scale markers
  const scaleMarkers = [0, 50, 100, 150, 200, 250, 300].filter(
    (v) => v <= maxLevel
  );

  // Get alert message based on level
  const getAlertMessage = () => {
    if (waterLevel === null) return "Không có dữ liệu";
    if (waterLevelCm <= 30) return "Mức nước thấp";
    if (waterLevelCm <= 80) return "Mức nước trung bình";
    if (waterLevelCm <= 150) return "Mức nước cao";
    return "Mức nước rất cao";
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBg }]}>
      {/* Title */}
      <View style={styles.header}>
        <Ionicons name="water" size={20} color={severityColor} />
        <Text style={[styles.title, { color: colors.text }]}>
          Biểu đồ mực nước
        </Text>
      </View>

      {/* Visualization Area */}
      <View style={styles.visualContainer}>
        {/* Scale Column (Left) */}
        <View style={styles.scaleContainer}>
          {scaleMarkers.map((level) => {
            const yPos = VIS_HEIGHT - (level / maxLevel) * VIS_HEIGHT;
            return (
              <View
                key={level}
                style={[styles.scaleMark, { top: yPos - 8 }]}
              >
                <Text style={[styles.scaleText, { color: colors.subtext }]}>
                  {level}
                </Text>
                <View
                  style={[styles.scaleLine, { backgroundColor: colors.border }]}
                />
              </View>
            );
          })}
          <Text style={[styles.unitLabel, { color: colors.subtext }]}>cm</Text>
        </View>

        {/* Water Column */}
        <View style={styles.columnContainer}>
          <View
            style={[styles.column, { backgroundColor: colors.columnBg }]}
          >
            {/* Water Fill */}
            <Animated.View
              style={[styles.waterFill, waterFillStyle]}
            >
              {/* Wave Layer 1 */}
              <Animated.View style={[styles.waveLayer, wave1Style]}>
                <Svg
                  width={COLUMN_WIDTH + 20}
                  height={20}
                  style={styles.waveSvg}
                >
                  <Defs>
                    <LinearGradient id="waveGrad1" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0" stopColor={severityColor} stopOpacity="0.9" />
                      <Stop offset="1" stopColor={severityColor} stopOpacity="0.7" />
                    </LinearGradient>
                  </Defs>
                  <Path
                    d="M-10,12 Q5,4 20,12 T50,12 T80,12 T110,12"
                    fill="none"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth={2}
                  />
                </Svg>
              </Animated.View>

              {/* Wave Layer 2 */}
              <Animated.View style={[styles.waveLayer, styles.waveLayer2, wave2Style]}>
                <Svg
                  width={COLUMN_WIDTH + 20}
                  height={16}
                  style={styles.waveSvg}
                >
                  <Path
                    d="M-10,8 Q10,2 30,8 T70,8 T110,8"
                    fill="none"
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth={2}
                  />
                </Svg>
              </Animated.View>

              {/* Water body */}
              <View style={[styles.waterBody, { backgroundColor: severityColor }]}>
                {/* Bubbles effect */}
                <View style={[styles.bubble, styles.bubble1]} />
                <View style={[styles.bubble, styles.bubble2]} />
                <View style={[styles.bubble, styles.bubble3]} />
              </View>
            </Animated.View>

            {/* Column border glow */}
            <View
              style={[
                styles.columnGlow,
                { shadowColor: severityColor },
              ]}
            />
          </View>

          {/* Current Level Indicator */}
          {waterLevel !== null && (
            <View
              style={[
                styles.levelIndicator,
                {
                  bottom: waterHeightPx - 14,
                  backgroundColor: severityColor,
                },
              ]}
            >
              <Text style={styles.levelIndicatorText}>
                {typeof waterLevel === "number"
                  ? waterLevel.toFixed(1)
                  : waterLevel}{" "}
                {unit}
              </Text>
              <View
                style={[
                  styles.indicatorArrow,
                  { borderRightColor: severityColor },
                ]}
              />
            </View>
          )}
        </View>

        {/* Empty space for balance */}
        <View style={styles.spacer} />
      </View>

      {/* Status Message */}
      <View
        style={[styles.statusContainer, { backgroundColor: `${severityColor}15` }]}
      >
        <View style={[styles.statusDot, { backgroundColor: severityColor }]} />
        <Text style={[styles.statusText, { color: colors.text }]}>
          {getAlertMessage()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  visualContainer: {
    flexDirection: "row",
    height: VIS_HEIGHT + 30,
    alignItems: "flex-end",
    marginBottom: 16,
  },
  scaleContainer: {
    width: 50,
    height: VIS_HEIGHT,
    position: "relative",
    marginRight: 8,
  },
  scaleMark: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    right: 0,
    left: 0,
  },
  scaleText: {
    fontSize: 10,
    fontWeight: "600",
    width: 28,
    textAlign: "right",
  },
  scaleLine: {
    flex: 1,
    height: 1,
    marginLeft: 4,
    opacity: 0.5,
  },
  unitLabel: {
    position: "absolute",
    bottom: -20,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "600",
  },
  columnContainer: {
    flex: 1,
    alignItems: "center",
    position: "relative",
  },
  column: {
    width: COLUMN_WIDTH,
    height: VIS_HEIGHT,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
  },
  waterFill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  waveLayer: {
    position: "absolute",
    top: -10,
    left: -10,
    right: -10,
    zIndex: 2,
  },
  waveLayer2: {
    top: -6,
  },
  waveSvg: {
    position: "absolute",
    top: 0,
  },
  waterBody: {
    flex: 1,
    marginTop: 8,
    opacity: 0.85,
  },
  bubble: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 50,
  },
  bubble1: {
    width: 6,
    height: 6,
    bottom: "20%",
    left: "30%",
  },
  bubble2: {
    width: 4,
    height: 4,
    bottom: "40%",
    left: "60%",
  },
  bubble3: {
    width: 5,
    height: 5,
    bottom: "60%",
    left: "45%",
  },
  columnGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  levelIndicator: {
    position: "absolute",
    right: -60,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  levelIndicatorText: {
    color: "white",
    fontSize: 13,
    fontWeight: "700",
  },
  indicatorArrow: {
    position: "absolute",
    left: -6,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
  },
  spacer: {
    width: 70,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
