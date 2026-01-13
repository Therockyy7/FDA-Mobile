// app/(tabs)/map/area/[areaId].tsx
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
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import type { RootState } from "~/app/store";
import { Text } from "~/components/ui/text";
import {
    AREA_STATUS_COLORS,
    AREA_STATUS_ICONS,
    AREA_STATUS_LABELS,
} from "~/features/map/types/map-layers.types";
import { useColorScheme } from "~/lib/useColorScheme";

export default function AreaDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkColorScheme } = useColorScheme();
  const { areaId } = useLocalSearchParams<{ areaId: string }>();

  const areas = useSelector((state: RootState) => state.map?.areas || []);
  const area = areas.find((a) => a.id === areaId);

  const colors = {
    background: isDarkColorScheme ? "#0F172A" : "#F1F5F9",
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
  };

  if (!area) {
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
            Không tìm thấy thông tin vùng
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

  const statusColor = AREA_STATUS_COLORS[area.status] || AREA_STATUS_COLORS.Unknown;
  const statusLabel = AREA_STATUS_LABELS[area.status] || AREA_STATUS_LABELS.Unknown;
  const statusIcon = AREA_STATUS_ICONS[area.status] || AREA_STATUS_ICONS.Unknown;

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "Chưa cập nhật";
    const date = new Date(dateStr);
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "#EF4444";
      case "warning":
        return "#F97316";
      case "caution":
        return "#FBBF24";
      default:
        return "#10B981";
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <Animated.View entering={FadeIn.duration(400)}>
        <LinearGradient
          colors={[statusColor, `${statusColor}CC`, `${statusColor}66`]}
          style={[styles.header, { paddingTop: insets.top + 8 }]}
        >
          <TouchableOpacity
            style={styles.headerBackBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.headerBadge}>
              <Ionicons name={statusIcon as any} size={14} color="white" />
              <Text style={styles.headerBadgeText}>{statusLabel}</Text>
            </View>
            <Text style={styles.headerTitle} numberOfLines={2}>
              {area.name}
            </Text>
            {area.addressText && (
              <View style={styles.addressRow}>
                <Ionicons name="location" size={14} color="rgba(255,255,255,0.9)" />
                <Text style={styles.headerSubtitle}>{area.addressText}</Text>
              </View>
            )}
          </View>

          <View style={styles.radiusBadge}>
            <MaterialCommunityIcons name="radius-outline" size={20} color="white" />
            <Text style={styles.radiusText}>
              {area.radiusMeters >= 1000
                ? `${(area.radiusMeters / 1000).toFixed(1)} km`
                : `${area.radiusMeters} m`}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Card */}
        {area.summary && (
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="information-circle" size={18} color={statusColor} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Tình trạng
                </Text>
              </View>
              <View
                style={[
                  styles.summaryBox,
                  { backgroundColor: `${statusColor}15`, borderLeftColor: statusColor },
                ]}
              >
                <Text style={[styles.summaryText, { color: colors.text }]}>
                  {area.summary}
                </Text>
              </View>
              <View style={styles.timeRow}>
                <Ionicons name="time-outline" size={14} color={colors.subtext} />
                <Text style={[styles.timeText, { color: colors.subtext }]}>
                  Đánh giá lúc: {formatTime(area.evaluatedAt)}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Location Card */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="navigate" size={18} color="#3B82F6" />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Vị trí
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="globe" size={16} color={colors.subtext} />
              <Text style={[styles.infoText, { color: colors.subtext }]}>
                {area.latitude.toFixed(6)}°N, {area.longitude.toFixed(6)}°E
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="radius-outline"
                size={16}
                color={colors.subtext}
              />
              <Text style={[styles.infoText, { color: colors.text }]}>
                Bán kính theo dõi: {area.radiusMeters}m
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Contributing Stations */}
        {area.contributingStations.length > 0 && (
          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="broadcast" size={18} color="#8B5CF6" />
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Trạm theo dõi ({area.contributingStations.length})
                </Text>
              </View>
              {area.contributingStations.map((station, index) => (
                <View
                  key={index}
                  style={[
                    styles.stationRow,
                    {
                      backgroundColor: colors.background,
                      borderLeftColor: getSeverityColor(station.severity),
                    },
                  ]}
                >
                  <View style={styles.stationInfo}>
                    <View style={styles.stationHeader}>
                      <View
                        style={[
                          styles.severityDot,
                          { backgroundColor: getSeverityColor(station.severity) },
                        ]}
                      />
                      <Text style={[styles.stationCode, { color: colors.text }]}>
                        {station.stationCode}
                      </Text>
                    </View>
                    <View style={styles.stationStats}>
                      <View style={styles.statItem}>
                        <Ionicons name="water" size={12} color={colors.subtext} />
                        <Text style={[styles.statText, { color: colors.text }]}>
                          {station.waterLevel} cm
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        <Ionicons name="locate" size={12} color={colors.subtext} />
                        <Text style={[styles.statText, { color: colors.subtext }]}>
                          {station.distance.toFixed(0)}m
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.severityBadge,
                      { backgroundColor: `${getSeverityColor(station.severity)}20` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.severityText,
                        { color: getSeverityColor(station.severity) },
                      ]}
                    >
                      {station.severity}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

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
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
    gap: 6,
  },
  headerBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "white",
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    flex: 1,
  },
  radiusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    alignSelf: "flex-start",
  },
  radiusText: {
    fontSize: 16,
    fontWeight: "700",
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
  summaryBox: {
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeText: {
    fontSize: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  stationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  stationInfo: {
    flex: 1,
  },
  stationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stationCode: {
    fontSize: 14,
    fontWeight: "700",
  },
  stationStats: {
    flexDirection: "row",
    gap: 16,
    marginLeft: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
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
