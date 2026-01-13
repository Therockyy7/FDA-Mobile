// app/(tabs)/map/[stationId].tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInUp,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import type { RootState } from "~/app/store";
import { Text } from "~/components/ui/text";
import { WaterLevelVisualization } from "~/features/map/components/WaterLevelVisualization";
import {
    SEVERITY_COLORS,
    SEVERITY_LABELS
} from "~/features/map/types/map-layers.types";
import { useColorScheme } from "~/lib/useColorScheme";

export default function StationDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkColorScheme } = useColorScheme();
  const { stationId } = useLocalSearchParams<{ stationId: string }>();

  // Get station data from Redux store
  const floodSeverity = useSelector(
    (state: RootState) => state.map?.floodSeverity
  );

  const station = floodSeverity?.features.find(
    (f) => f.properties.stationId === stationId
  );

  const colors = {
    background: isDarkColorScheme ? "#0F172A" : "#F1F5F9",
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
  };

  if (!station) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}
      >
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.subtext} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            Không tìm thấy thông tin trạm
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.cardBg }]}
            onPress={() => router.back()}
          >
            <Text style={{ color: colors.text }}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const { properties, geometry } = station;
  const severityColor =
    properties.markerColor ||
    SEVERITY_COLORS[properties.severity] ||
    SEVERITY_COLORS.unknown;
  const severityLabel =
    SEVERITY_LABELS[properties.severity] || SEVERITY_LABELS.unknown;

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "Chưa có dữ liệu";
    const date = new Date(dateStr);
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />

      {/* Header with gradient */}
      <Animated.View entering={FadeIn.duration(400)}>
        <LinearGradient
          colors={[severityColor, `${severityColor}CC`, `${severityColor}66`]}
          style={[styles.header, { paddingTop: insets.top + 8 }]}
        >
          {/* Back button */}
          <TouchableOpacity
            style={styles.headerBackBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          {/* Station Info */}
          <View style={styles.headerContent}>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{properties.alertLevel}</Text>
            </View>
            <Text style={styles.headerTitle} numberOfLines={2}>
              {properties.stationName}
            </Text>
            <Text style={styles.headerSubtitle}>{properties.stationCode}</Text>
          </View>

          {/* Water Level Display */}
          <View style={styles.waterLevelBadge}>
            <MaterialCommunityIcons name="water" size={24} color="white" />
            <Text style={styles.waterLevelText}>
              {properties.waterLevel !== null
                ? `${properties.waterLevel} ${properties.unit}`
                : "N/A"}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Water Level Visualization */}
        <Animated.View entering={FadeInUp.delay(200).duration(500)}>
          <WaterLevelVisualization
            waterLevel={properties.waterLevel}
            unit={properties.unit}
            severity={properties.severity}
            severityColor={severityColor}
          />
        </Animated.View>

        {/* Status Card */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="pulse" size={18} color={severityColor} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Trạng thái hiện tại
              </Text>
            </View>
            <View style={styles.statusGrid}>
              <View
                style={[
                  styles.statusItem,
                  { backgroundColor: `${severityColor}15` },
                ]}
              >
                <Text style={[styles.statusLabel, { color: colors.subtext }]}>
                  Mức cảnh báo
                </Text>
                <View style={styles.statusValueRow}>
                  <View
                    style={[styles.statusDot, { backgroundColor: severityColor }]}
                  />
                  <Text style={[styles.statusValue, { color: severityColor }]}>
                    {severityLabel}
                  </Text>
                </View>
              </View>
              <View
                style={[styles.statusItem, { backgroundColor: colors.background }]}
              >
                <Text style={[styles.statusLabel, { color: colors.subtext }]}>
                  Hoạt động
                </Text>
                <View style={styles.statusValueRow}>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor:
                          properties.stationStatus === "active"
                            ? "#22C55E"
                            : "#EF4444",
                      },
                    ]}
                  />
                  <Text style={[styles.statusValue, { color: colors.text }]}>
                    {properties.stationStatus === "active"
                      ? "Đang hoạt động"
                      : "Ngừng hoạt động"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Location Card */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="location" size={18} color="#3B82F6" />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Vị trí
              </Text>
            </View>
            {properties.roadName && (
              <View style={styles.infoRow}>
                <Ionicons name="navigate" size={16} color={colors.subtext} />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  {properties.roadName}
                </Text>
              </View>
            )}
            {properties.locationDesc && (
              <View style={styles.infoRow}>
                <Ionicons name="pin" size={16} color={colors.subtext} />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  {properties.locationDesc}
                </Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Ionicons name="globe" size={16} color={colors.subtext} />
              <Text style={[styles.infoText, { color: colors.subtext }]}>
                {geometry.coordinates[1].toFixed(6)}°N,{" "}
                {geometry.coordinates[0].toFixed(6)}°E
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Sensor Info Card */}
        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
          <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="chip"
                size={18}
                color="#8B5CF6"
              />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Thông số cảm biến
              </Text>
            </View>
            <View style={styles.sensorGrid}>
              {properties.sensorHeight !== null && (
                <View
                  style={[
                    styles.sensorItem,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="arrow-expand-vertical"
                    size={20}
                    color="#8B5CF6"
                  />
                  <Text style={[styles.sensorLabel, { color: colors.subtext }]}>
                    Chiều cao cảm biến
                  </Text>
                  <Text style={[styles.sensorValue, { color: colors.text }]}>
                    {properties.sensorHeight} {properties.unit}
                  </Text>
                </View>
              )}
              {properties.distance !== null && (
                <View
                  style={[
                    styles.sensorItem,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="ruler"
                    size={20}
                    color="#8B5CF6"
                  />
                  <Text style={[styles.sensorLabel, { color: colors.subtext }]}>
                    Khoảng cách
                  </Text>
                  <Text style={[styles.sensorValue, { color: colors.text }]}>
                    {properties.distance} cm
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Timestamp Card */}
        <Animated.View entering={FadeInDown.delay(600).duration(500)}>
          <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="time" size={18} color="#F59E0B" />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Thời gian
              </Text>
            </View>
            <View style={styles.timeRow}>
              <View style={styles.timeItem}>
                <Text style={[styles.timeLabel, { color: colors.subtext }]}>
                  Đo lường lúc
                </Text>
                <Text style={[styles.timeValue, { color: colors.text }]}>
                  {formatTime(properties.measuredAt)}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Bottom Spacing */}
        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  headerContent: {
    marginBottom: 16,
  },
  headerBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  headerBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "white",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  waterLevelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  waterLevelText: {
    fontSize: 20,
    fontWeight: "800",
    color: "white",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  statusGrid: {
    flexDirection: "row",
    gap: 10,
  },
  statusItem: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
  },
  statusLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  statusValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  sensorGrid: {
    flexDirection: "row",
    gap: 10,
  },
  sensorItem: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  sensorLabel: {
    fontSize: 11,
    marginTop: 6,
    marginBottom: 2,
    textAlign: "center",
  },
  sensorValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  timeRow: {
    gap: 12,
  },
  timeItem: {
    gap: 4,
  },
  timeLabel: {
    fontSize: 12,
  },
  timeValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
});
