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

  // GPS + ward resolution on mount
  useEffect(() => {
    (async () => {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Cần quyền vị trí", "Cần quyền vị trí để báo cáo ngập lụt chính xác!");
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
        Alert.alert("Lỗi", "Không thể lấy vị trí hiện tại");
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

    let foundId: string | null = null;
    let foundName: string | null = null;

    for (const term of candidates) {
      if (foundId) break;
      try {
        const res = await AreaService.getAdminAreas({ searchTerm: term, pageNumber: 1, pageSize: 20 });
        if (res.administrativeAreas.length > 0) {
          foundId = res.administrativeAreas[0].id;
          foundName = res.administrativeAreas[0].name;
          console.log(`✅ [CreatePost] Area resolved: ${foundName} (${foundId}) via "${term}"`);
        }
      } catch {
        console.warn(`⚠️ [CreatePost] Admin area search failed for: "${term}"`);
      }
    }

    // Fallback: use first area in list
    if (!foundId) {
      try {
        const allRes = await AreaService.getAdminAreas({ pageNumber: 1, pageSize: 100 });
        if (allRes.administrativeAreas.length > 0) {
          foundId = allRes.administrativeAreas[0].id;
          foundName = allRes.administrativeAreas[0].name;
          console.log(`⚠️ [CreatePost] Fallback area: ${foundName} (${foundId})`);
        }
      } catch {
        console.warn("⚠️ [CreatePost] Could not fetch fallback admin areas");
      }
    }

    setCurrentAreaId(foundId);
    setCurrentAreaName(foundName);
  }, []);

  /** Fetch the official status for the resolved area */
  const fetchAndCompareAreaStatus = useCallback(
    async (chosenSeverity: Severity, areaId: string): Promise<AreaStatus | null> => {
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

  /** Called when user taps a severity button */
  const handleSeverityChange = useCallback(
    async (newSeverity: Severity) => {
      if (!currentAreaId) {
        // No area resolved yet — just apply directly
        setSeverity(newSeverity);
        return;
      }

      // Fetch the official status and compare
      setFetchingAreaStatus(true);
      const status = await fetchAndCompareAreaStatus(newSeverity, currentAreaId);
      setFetchingAreaStatus(false);

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
    [currentAreaId, fetchAndCompareAreaStatus]
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
      Alert.alert("Lỗi", "Chưa lấy được vị trí. Vui lòng thử lại!");
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
          "Thành công",
          response.status === "hidden"
            ? "Báo cáo của bạn đã được ghi nhận nhưng sẽ được kiểm duyệt trước khi hiển thị."
            : "Báo cáo ngập lụt đã được đăng thành công!",
          [{ text: "OK", onPress: () => router.replace("/community" as any) }]
        );
      } else {
        Alert.alert("Lỗi", response.message);
      }
    } catch (error: any) {
      console.error("Lỗi submit:", error);
      if (error.response?.status === 413) {
        Alert.alert(
          "File quá lớn",
          "Tổng dung lượng ảnh/video quá lớn. Vui lòng gửi file nhẹ hơn (Tối đa 50MB cho video)."
        );
      } else if (error.response?.status === 429) {
        const retryAfter = error.response?.data?.retryAfterSeconds || 3;
        Alert.alert(
          "Quá nhanh",
          `Bạn đăng bài quá nhanh. Vui lòng thử lại sau ${Math.ceil(retryAfter / 60)} phút.`
        );
      } else {
        Alert.alert("Lỗi", "Không thể đăng báo cáo. Vui lòng thử lại.");
      }
    } finally {
      setSubmitting(false);
      setUploadProgress(-1);
    }
  };

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
      officialLabel: API_STATUS_LABEL[areaStatus.status] ?? areaStatus.status,
      userLabel: SEVERITY_LABEL[pendingSeverity],
      areaName: areaStatus.areaName,
      message: isHigher
        ? `Hệ thống đang ghi nhận khu vực "${areaStatus.areaName}" ở mức "${API_STATUS_LABEL[areaStatus.status]}", nhưng bạn chọn mức "${SEVERITY_LABEL[pendingSeverity]}" (cao hơn thực tế). Bạn có chắc chắn muốn báo cáo ở mức này không?`
        : `Hệ thống đang ghi nhận khu vực "${areaStatus.areaName}" ở mức "${API_STATUS_LABEL[areaStatus.status]}", nhưng bạn chọn mức "${SEVERITY_LABEL[pendingSeverity]}" (thấp hơn thực tế). Bạn có muốn điều chỉnh lại không?`,
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
              Tạo báo cáo
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
                <Text className="text-xs font-semibold text-white">Đăng</Text>
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
                ? "Đang lấy vị trí..."
                : locationAddress
                ? locationAddress
                : currentLocation
                ? `${currentLocation.coords.latitude.toFixed(6)}, ${currentLocation.coords.longitude.toFixed(6)}`
                : "Chưa lấy được vị trí"}
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
              <Text className="text-slate-900 dark:text-white text-sm font-semibold">Bạn</Text>
              <Text className="text-xs text-slate-400 dark:text-slate-500">Báo cáo ngập lụt</Text>
            </View>
          </View>

          {/* Severity selector */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm text-slate-700 dark:text-slate-300">
                Mức độ ngập lụt
              </Text>
              {fetchingAreaStatus && (
                <View className="flex-row items-center gap-1.5">
                  <ActivityIndicator size="small" color="#0EA5E9" />
                  <Text className="text-[10px] text-slate-400 dark:text-slate-500">
                    Đang kiểm tra khu vực...
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
                    {level === "low" ? "Thấp" : level === "medium" ? "Trung bình" : "Cao"}
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
                  <Text className="font-semibold">{areaStatus.areaName}</Text> — hệ thống:{" "}
                  <Text
                    className={
                      areaStatus.status === "Safe"
                        ? "text-green-600 dark:text-green-400 font-bold"
                        : areaStatus.status === "Warning"
                        ? "text-yellow-600 dark:text-yellow-400 font-bold"
                        : "text-red-600 dark:text-red-400 font-bold"
                    }
                  >
                    {API_STATUS_LABEL[areaStatus.status]}
                  </Text>
                </Text>
              </View>
            )}
          </View>

          {/* Content input */}
          <TextInput
            placeholder="Mô tả tình hình ngập lụt tại khu vực..."
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
                        <Text className="text-white text-[10px]">Bìa</Text>
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
              Thêm vào báo cáo
            </Text>
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                className="flex-row items-center gap-2"
                onPress={() => setShowCamera(true)}
              >
                <Ionicons name="camera" size={20} color="#22C55E" />
                <Text className="text-xs text-slate-700 dark:text-slate-200">
                  Chụp ảnh / Video
                </Text>
              </TouchableOpacity>
              <View className="flex-row items-center gap-2">
                <Ionicons name="location" size={20} color="#0EA5E9" />
                <Text className="text-xs text-slate-700 dark:text-slate-200">
                  {currentLocation ? "Đã có vị trí" : "Chưa có vị trí"}
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
              Mức độ không khớp
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
                    HỆ THỐNG
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
                    BẠN CHỌN
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
                  Điều chỉnh lại
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
                  Vẫn tiếp tục
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
