import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Text } from "~/components/ui/text";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";

import { CustomCamera, CapturedMedia } from "~/components/CustomCamera";
import { useQueryClient } from "@tanstack/react-query";
import { CommunityService } from "~/features/community/services/community.service";
import { COMMUNITY_REPORTS_QUERY_KEY } from "~/features/map/hooks/queries/useCommunityReportsQuery";
import { AreaService } from "~/features/areas/services/area.service";
import { useAuthStatus, useAuthLoading } from "~/features/auth/hooks/useAuth";
import { useTranslation } from "~/features/i18n";

type Severity = "low" | "medium" | "high";

// Map API status → comparable "tier": Safe=0, Warning=1, Critical=2
const STATUS_TIER: Record<string, number> = {
  Safe: 0,
  Warning: 1,
  Critical: 2,
};
// Map user severity → tier
const SEVERITY_TIER: Record<Severity, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

const SEVERITY_LABEL: Record<Severity, string> = {
  low: "Thấp",
  medium: "Trung bình",
  high: "Cao",
};

const API_STATUS_LABEL: Record<string, string> = {
  Safe: "An toàn",
  Warning: "Cảnh báo",
  Critical: "Nguy hiểm",
};

interface AreaStatus {
  status: "Safe" | "Warning" | "Critical";
  areaName: string;
  summary: string;
}

export default function CreatePostScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { openCamera } = useLocalSearchParams<{ openCamera?: string }>();
  const [content, setContent] = useState("");
  const [severity, setSeverity] = useState<Severity>("medium");
  const [showCamera, setShowCamera] = useState(openCamera === "true");
  const [mediaList, setMediaList] = useState<CapturedMedia[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(-1);

  // Ward ID resolved from GPS
  const [currentAreaId, setCurrentAreaId] = useState<string | null>(null);
  const [currentAreaName, setCurrentAreaName] = useState<string | null>(null);
  const [areaStatus, setAreaStatus] = useState<AreaStatus | null>(null);
  const [fetchingAreaStatus, setFetchingAreaStatus] = useState(false);

  // Mismatch confirmation dialog
  const [mismatchDialogVisible, setMismatchDialogVisible] = useState(false);
  const [pendingSeverity, setPendingSeverity] = useState<Severity | null>(null);

  // ── Auth guard ──
  const authStatus = useAuthStatus();
  const authLoading = useAuthLoading();

  // ── Redirect unauthenticated users ──
  useEffect(() => {
    if (!authLoading && authStatus === "unauthenticated") {
      Alert.alert(
        t("auth.loginRequired.title"),
        t("auth.loginRequired.createPostDesc"),
        [
          { text: t("common.cancel"), style: "cancel", onPress: () => router.back() },
          {
            text: t("auth.signIn"),
            onPress: () => router.replace("/(auth)/sign-in" as any),
          },
        ]
      );
    }
  }, [authLoading, authStatus, router]);

  // GPS + ward resolution on mount
  useEffect(() => {
    (async () => {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(t("community.post.locationRequiredTitle"), t("community.post.locationRequiredDesc"));
        setLocationLoading(false);
        return;
      }
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setCurrentLocation(location);

        // Reverse geocode for display address
        try {
          const [result] = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          if (result) {
            const parts = [
              result.streetNumber ? `${result.streetNumber}` : null,
              result.street ? `${result.street}` : null,
              result.subregion ? `${result.subregion}` : null,
              result.city ? `${result.city}` : null,
              result.region ? `${result.region}` : null,
            ].filter(Boolean);
            setLocationAddress(parts.join(", "));

            // Resolve ward ID from geocoded names
            await resolveAreaId(result);
          }
        } catch (geoError) {
          console.error("Lỗi reverse geocode:", geoError);
          setLocationAddress(
            `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`
          );
        }
      } catch (error) {
        console.error("Lỗi lấy vị trí:", error);
        Alert.alert(t("common.error"), t("community.post.locationFetchError"));
      } finally {
        setLocationLoading(false);
      }
    })();
  }, []);

  /** Find the ward ID that best matches the user's current GPS geocoded location */
  const resolveAreaId = useCallback(async (geo: Location.LocationGeocodedAddress) => {
    const candidates: string[] = [];
    if (geo.district) candidates.push(geo.district);
    if (geo.name && geo.name !== geo.district) candidates.push(geo.name);
    if (geo.city) candidates.push(geo.city);
    if (geo.subregion) candidates.push(geo.subregion);

    // Normalize Vietnamese for fuzzy name matching
    const normalizeVi = (s: string) =>
      s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\u0111/g, "d").replace(/[^a-z0-9\s]/g, "").trim();

    const scoreMatch = (areaName: string, term: string): number => {
      const a = normalizeVi(areaName);
      const t = normalizeVi(term);
      if (!a || !t) return 0;
      if (a === t) return 100;
      if (a.startsWith(t)) return 80;
      if (t.startsWith(a)) return 60;
      if (a.includes(t)) return 40;
      if (t.includes(a)) return 20;
      return 0;
    };

    const pickBest = (areas: { id: string; name: string }[], term: string) => {
      let best: { id: string; name: string } | null = null;
      let bestScore = 0;
      for (const area of areas) {
        const s = scoreMatch(area.name, term);
        if (s > bestScore) { bestScore = s; best = area; }
      }
      return bestScore > 0 ? best : null;
    };

    let foundId: string | null = null;
    let foundName: string | null = null;

    for (const term of candidates) {
      if (foundId) break;
      try {
        const res = await AreaService.getAdminAreas({ searchTerm: term, pageNumber: 1, pageSize: 20 });
        if (res.administrativeAreas.length > 0) {
          const best = pickBest(res.administrativeAreas, term);
          if (best) {
            foundId = best.id;
            foundName = best.name;
            console.log(`✅ [CreatePost] Best match: "${foundName}" (${foundId}) for term "${term}"`);
          } else {
            console.log(`⚠️ [CreatePost] No scored match in results for "${term}"`);
          }
        }
      } catch {
        console.warn(`⚠️ [CreatePost] Admin area search failed for: "${term}"`);
      }
    }

    // Fallback: load all and score against all candidate terms
    if (!foundId) {
      try {
        const allRes = await AreaService.getAdminAreas({ pageNumber: 1, pageSize: 100 });
        if (allRes.administrativeAreas.length > 0) {
          let topScore = 0;
          let topArea: { id: string; name: string } | null = null;
          for (const area of allRes.administrativeAreas) {
            for (const term of candidates) {
              const s = scoreMatch(area.name, term);
              if (s > topScore) { topScore = s; topArea = area; }
            }
          }
          const chosen = topArea ?? allRes.administrativeAreas[0];
          foundId = chosen.id;
          foundName = chosen.name;
          console.log(`⚠️ [CreatePost] Fallback chose "${foundName}" (score=${topScore})`);
        }
      } catch {
        console.warn("⚠️ [CreatePost] Could not fetch fallback admin areas");
      }
    }

    setCurrentAreaId(foundId);
    setCurrentAreaName(foundName);
  }, []);
  /** Fetch + store area status (without comparing severity) */
  const fetchAreaStatus = useCallback(
    async (areaId: string): Promise<AreaStatus | null> => {
      setFetchingAreaStatus(true);
      try {
        const statusData = await AreaService.getAdministrativeAreaStatus(areaId);
        const status: AreaStatus = {
          status: statusData.status,
          areaName: statusData.administrativeArea?.name ?? currentAreaName ?? "Khu vực của bạn",
          summary: statusData.summary,
        };
        setAreaStatus(status);
        return status;
      } catch (err) {
        console.warn("⚠️ [CreatePost] Could not fetch area status:", err);
        return null;
      } finally {
        setFetchingAreaStatus(false);
      }
    },
    [currentAreaName]
  );

  // Auto-fetch area status as soon as the area is resolved from GPS
  useEffect(() => {
    if (currentAreaId) {
      fetchAreaStatus(currentAreaId);
    }
  }, [currentAreaId]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Called when user taps a severity button */
  const handleSeverityChange = useCallback(
    async (newSeverity: Severity) => {
      if (!currentAreaId) {
        // No area resolved yet — just apply directly
        setSeverity(newSeverity);
        return;
      }

      // Use already-fetched status if available, otherwise fetch now
      let status = areaStatus;
      if (!status) {
        status = await fetchAreaStatus(currentAreaId);
      }

      if (!status) {
        // Can't compare → just apply
        setSeverity(newSeverity);
        return;
      }

      const officialTier = STATUS_TIER[status.status] ?? 0;
      const userTier = SEVERITY_TIER[newSeverity];

      if (userTier !== officialTier) {
        // Mismatch → show confirmation dialog
        setPendingSeverity(newSeverity);
        setMismatchDialogVisible(true);
      } else {
        // Match → apply immediately
        setSeverity(newSeverity);
      }
    },
    [currentAreaId, areaStatus, fetchAreaStatus]
  );

  /** User confirms mismatch and keeps their selected severity */
  const confirmMismatch = useCallback(() => {
    if (pendingSeverity) {
      setSeverity(pendingSeverity);
    }
    setMismatchDialogVisible(false);
    setPendingSeverity(null);
  }, [pendingSeverity]);

  /** User cancels — revert to previous severity */
  const cancelMismatch = useCallback(() => {
    setMismatchDialogVisible(false);
    setPendingSeverity(null);
  }, []);

  const handleMediaDone = (newMedia: CapturedMedia[]) => {
    setMediaList([...mediaList, ...newMedia]);
    setShowCamera(false);
  };

  const removeMedia = (index: number) => {
    setMediaList(mediaList.filter((_, i) => i !== index));
  };

  const canSubmit = content.trim() || mediaList.length > 0;

  const handleSubmit = async () => {
    if (!currentLocation) {
      Alert.alert(t("common.error"), t("community.post.noLocationError"));
      return;
    }
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const photos = mediaList
        .filter((m) => m.type === "image")
        .map((m) => ({
          uri: m.uri,
          type: "image/jpeg",
          name: m.uri.split("/").pop() || "photo.jpg",
        }));

      const videos = mediaList
        .filter((m) => m.type === "video")
        .map((m) => ({
          uri: m.uri,
          type: "video/mp4",
          name: m.uri.split("/").pop() || "video.mp4",
        }));

      const response = await CommunityService.createFloodReport(
        {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          address: locationAddress || undefined,
          description: content.trim(),
          severity,
          photos: photos.length > 0 ? photos : undefined,
          videos: videos.length > 0 ? videos : undefined,
        },
        (progressEvent) => {
          if (progressEvent.total && progressEvent.total > 0) {
            const percent = Math.min(
              100,
              Math.max(0, Math.round((progressEvent.loaded * 100) / progressEvent.total))
            );
            setUploadProgress(percent);
          }
        }
      );

      if (response.success) {
        queryClient.invalidateQueries({ queryKey: [COMMUNITY_REPORTS_QUERY_KEY] });
        Alert.alert(
          t("common.success"),
          response.status === "hidden"
            ? t("community.post.successHidden")
            : t("community.post.successVisible"),
          [{ text: t("common.ok"), onPress: () => router.replace("/community" as any) }]
        );
      } else {
        Alert.alert(t("common.error"), response.message);
      }
    } catch (error: any) {
      console.error("Lỗi submit:", error);
      if (error.response?.status === 413) {
        Alert.alert(
          t("community.post.fileTooLargeTitle"),
          t("community.post.fileTooLargeDesc")
        );
      } else if (error.response?.status === 429) {
        const retryAfter = error.response?.data?.retryAfterSeconds || 3;
        Alert.alert(
          t("community.post.tooFastTitle"),
          `${t("community.post.tooFastDesc")} ${Math.ceil(retryAfter / 60)} ${t("common.minute")}.`
        );
      } else {
        Alert.alert(t("common.error"), t("community.post.createError"));
      }
    } finally {
      setSubmitting(false);
      setUploadProgress(-1);
    }
  };

  // ── Loading state while checking auth ──
  if (authLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900 items-center justify-center">
        <ActivityIndicator size="large" color="#0EA5E9" />
        <Text className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          {t("auth.checking")}
        </Text>
      </SafeAreaView>
    );
  }

  if (showCamera) {
    return <CustomCamera onClose={() => setShowCamera(false)} onDone={handleMediaDone} />;
  }

  // ── Determine mismatch dialog content ──
  const mismatchInfo = (() => {
    if (!areaStatus || !pendingSeverity) return null;
    const officialTier = STATUS_TIER[areaStatus.status] ?? 0;
    const userTier = SEVERITY_TIER[pendingSeverity];
    const isHigher = userTier > officialTier;
    return {
      isHigher,
      icon: isHigher ? "warning" : "information-circle",
      iconColor: isHigher ? "#F59E0B" : "#0EA5E9",
      badgeBg: isHigher ? "#FEF3C7" : "#E0F2FE",
      officialLabel: t(`areas.status.${areaStatus.status.toLowerCase()}` as any) ?? areaStatus.status,
      userLabel: t(`alerts.severity.${pendingSeverity}` as any),
      areaName: areaStatus.areaName,
      message: isHigher
        ? t("community.post.mismatchHigher").replace("{area}", areaStatus.areaName).replace("{official}", t(`areas.status.${areaStatus.status.toLowerCase()}` as any)).replace("{user}", t(`alerts.severity.${pendingSeverity}` as any))
        : t("community.post.mismatchLower").replace("{area}", areaStatus.areaName).replace("{official}", t(`areas.status.${areaStatus.status.toLowerCase()}` as any)).replace("{user}", t(`alerts.severity.${pendingSeverity}` as any)),
    };
  })();

  return (
    <SafeAreaView className="flex-1 bg-slate-100 dark:bg-slate-950">
      <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900">
        <View className="px-4 pt-4 pb-6">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
              <Ionicons name="close" size={22} color="#0B1A33" />
            </TouchableOpacity>
            <Text className="text-slate-900 dark:text-white font-semibold text-base">
              {t("community.post.createTitle")}
            </Text>
            <TouchableOpacity
              onPress={handleSubmit}
              className={`px-3 py-1.5 rounded-full ${
                canSubmit && !submitting ? "bg-sky-600" : "bg-slate-300"
              }`}
              disabled={!canSubmit || submitting}
            >
              {submitting ? (
                <View className="flex-row items-center gap-1.5">
                  <ActivityIndicator size="small" color="white" />
                  {uploadProgress > -1 && (
                    <Text className="text-white text-xs font-bold">{uploadProgress}%</Text>
                  )}
                </View>
              ) : (
                <Text className="text-xs font-semibold text-white">{t("community.post.submit")}</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Location indicator */}
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons
              name="location"
              size={14}
              color={currentLocation ? "#22C55E" : "#94A3B8"}
            />
            <Text className="text-xs text-slate-500 dark:text-slate-400 flex-1" numberOfLines={1}>
              {locationLoading
                ? t("community.post.fetchingLocation")
                : locationAddress
                ? locationAddress
                : currentLocation
                ? `${currentLocation.coords.latitude.toFixed(6)}, ${currentLocation.coords.longitude.toFixed(6)}`
                : t("community.post.noLocationError")}
            </Text>
            {currentAreaName && !locationLoading && (
              <View className="bg-sky-100 dark:bg-sky-900/30 px-2 py-0.5 rounded-full">
                <Text className="text-[10px] text-sky-700 dark:text-sky-300 font-semibold">
                  {currentAreaName}
                </Text>
              </View>
            )}
          </View>

          {/* User row */}
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-9 h-9 rounded-full bg-slate-300 dark:bg-slate-700" />
            <View>
              <Text className="text-slate-900 dark:text-white text-sm font-semibold">{t("community.post.you")}</Text>
              <Text className="text-xs text-slate-400 dark:text-slate-500">{t("community.post.floodReport")}</Text>
            </View>
          </View>

          {/* Severity selector */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm text-slate-700 dark:text-slate-300">
                {t("community.post.level")}
              </Text>
              {fetchingAreaStatus && (
                <View className="flex-row items-center gap-1.5">
                  <ActivityIndicator size="small" color="#0EA5E9" />
                  <Text className="text-[10px] text-slate-400 dark:text-slate-500">
                    {t("community.post.checkingArea")}
                  </Text>
                </View>
              )}
            </View>
            <View className="flex-row gap-2">
              {(["low", "medium", "high"] as Severity[]).map((level) => (
                <TouchableOpacity
                  key={level}
                  onPress={() => handleSeverityChange(level)}
                  disabled={fetchingAreaStatus}
                  className={`flex-1 py-2 px-3 rounded-lg border ${
                    severity === level
                      ? level === "low"
                        ? "bg-green-100 border-green-500 dark:bg-green-900/30 dark:border-green-500"
                        : level === "medium"
                        ? "bg-yellow-100 border-yellow-500 dark:bg-yellow-900/30 dark:border-yellow-500"
                        : "bg-red-100 border-red-500 dark:bg-red-900/30 dark:border-red-500"
                      : "bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                  }`}
                >
                  <Text
                    className={`text-center text-sm font-medium ${
                      severity === level
                        ? level === "low"
                          ? "text-green-700 dark:text-green-400"
                          : level === "medium"
                          ? "text-yellow-700 dark:text-yellow-400"
                          : "text-red-700 dark:text-red-400"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {level === "low" ? t("alerts.severity.low") : level === "medium" ? t("alerts.severity.medium") : t("alerts.severity.high")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Area status badge (shown after first comparison) */}
            {areaStatus && !fetchingAreaStatus && (
              <View className="mt-2 flex-row items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <Ionicons
                  name={
                    areaStatus.status === "Safe"
                      ? "checkmark-circle"
                      : areaStatus.status === "Warning"
                      ? "warning"
                      : "alert-circle"
                  }
                  size={14}
                  color={
                    areaStatus.status === "Safe"
                      ? "#22C55E"
                      : areaStatus.status === "Warning"
                      ? "#F59E0B"
                      : "#EF4444"
                  }
                />
                <Text className="text-[11px] text-slate-600 dark:text-slate-400 flex-1">
                  <Text className="font-semibold">{areaStatus.areaName}</Text> — {t("community.post.systemLabel")}{" "}
                  <Text
                    className={
                      areaStatus.status === "Safe"
                        ? "text-green-600 dark:text-green-400 font-bold"
                        : areaStatus.status === "Warning"
                        ? "text-yellow-600 dark:text-yellow-400 font-bold"
                        : "text-red-600 dark:text-red-400 font-bold"
                    }
                  >
                    {t(`areas.status.${areaStatus.status.toLowerCase()}` as any)}
                  </Text>
                </Text>
              </View>
            )}
          </View>

          {/* Content input */}
          <TextInput
            placeholder={t("community.post.descriptionPlaceholder")}
            placeholderTextColor="#94A3B8"
            multiline
            value={content}
            onChangeText={setContent}
            className="min-h-[120px] text-sm text-slate-900 dark:text-slate-100 text-start"
            textAlignVertical="top"
          />

          {/* Media preview */}
          {mediaList.length > 0 && (
            <View className="mt-3 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {mediaList.map((media, index) => (
                  <View key={index} className="relative mr-2">
                    <Image
                      source={{ uri: media.uri }}
                      className="w-32 h-32 rounded-lg"
                      resizeMode="cover"
                    />
                    {media.type === "video" && (
                      <View className="absolute inset-0 items-center justify-center">
                        <View className="w-10 h-10 bg-black/50 rounded-full items-center justify-center">
                          <Ionicons name="play" size={20} color="white" />
                        </View>
                      </View>
                    )}
                    <TouchableOpacity
                      className="absolute top-1 right-1 bg-black/50 rounded-full p-1"
                      onPress={() => removeMedia(index)}
                    >
                      <Ionicons name="close" size={14} color="white" />
                    </TouchableOpacity>
                    {index === 0 && (
                      <View className="absolute bottom-1 left-1 bg-black/50 px-2 py-0.5 rounded">
                        <Text className="text-white text-[10px]">{t("community.post.cover")}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Tools */}
          <View className="mt-5 rounded-2xl bg-white dark:bg-slate-800 px-4 py-3">
            <Text className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              {t("community.post.addToReport")}
            </Text>
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                className="flex-row items-center gap-2"
                onPress={() => setShowCamera(true)}
              >
                <Ionicons name="camera" size={20} color="#22C55E" />
                <Text className="text-xs text-slate-700 dark:text-slate-200">
                  {t("community.post.takePhoto")}
                </Text>
              </TouchableOpacity>
              <View className="flex-row items-center gap-2">
                <Ionicons name="location" size={20} color="#0EA5E9" />
                <Text className="text-xs text-slate-700 dark:text-slate-200">
                  {currentLocation ? t("community.post.hasLocation") : t("community.post.noLocation")}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── Mismatch Confirmation Dialog ── */}
      <Modal
        visible={mismatchDialogVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelMismatch}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              padding: 24,
              width: "100%",
              maxWidth: 360,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 24,
              elevation: 12,
            }}
          >
            {/* Icon */}
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: mismatchInfo?.isHigher ? "#FEF3C7" : "#E0F2FE",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name={mismatchInfo?.isHigher ? "warning" : "information-circle"}
                  size={30}
                  color={mismatchInfo?.isHigher ? "#D97706" : "#0284C7"}
                />
              </View>
            </View>

            {/* Title */}
            <Text
              style={{
                fontSize: 17,
                fontWeight: "800",
                color: "#0F172A",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              {t("community.post.mismatchTitle")}
            </Text>

            {/* Comparison row */}
            {mismatchInfo && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <View
                  style={{
                    backgroundColor: "#F1F5F9",
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 9, color: "#94A3B8", fontWeight: "600", marginBottom: 2 }}>
                    {t("community.post.systemUpper")}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "800",
                      color:
                        areaStatus?.status === "Safe"
                          ? "#16A34A"
                          : areaStatus?.status === "Warning"
                          ? "#D97706"
                          : "#DC2626",
                    }}
                  >
                    {mismatchInfo.officialLabel}
                  </Text>
                </View>
                <Ionicons name="swap-horizontal" size={18} color="#CBD5E1" />
                <View
                  style={{
                    backgroundColor:
                      pendingSeverity === "low"
                        ? "#F0FDF4"
                        : pendingSeverity === "medium"
                        ? "#FFFBEB"
                        : "#FEF2F2",
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 9, color: "#94A3B8", fontWeight: "600", marginBottom: 2 }}>
                    {t("community.post.youSelected")}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "800",
                      color:
                        pendingSeverity === "low"
                          ? "#16A34A"
                          : pendingSeverity === "medium"
                          ? "#D97706"
                          : "#DC2626",
                    }}
                  >
                    {mismatchInfo.userLabel}
                  </Text>
                </View>
              </View>
            )}

            {/* Message */}
            <Text
              style={{
                fontSize: 13,
                color: "#475569",
                textAlign: "center",
                lineHeight: 19,
                marginBottom: 20,
              }}
            >
              {mismatchInfo?.message}
            </Text>

            {/* Buttons */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={cancelMismatch}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#64748B" }}>
                  {t("community.post.changeSelection")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmMismatch}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: mismatchInfo?.isHigher ? "#F59E0B" : "#0EA5E9",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "700", color: "white" }}>
                  {t("community.post.keepSelection")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
