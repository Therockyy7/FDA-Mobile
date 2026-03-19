import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Text } from "~/components/ui/text";
import { Ionicons } from "@expo/vector-icons";

import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";

import { CustomCamera, CapturedMedia } from "~/components/CustomCamera";
import { CommunityService } from "~/features/community/services/community.service";

type Severity = "low" | "medium" | "high";

export default function CreatePostScreen() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [severity, setSeverity] = useState<Severity>("medium");
  const [showCamera, setShowCamera] = useState(false);
  const [mediaList, setMediaList] = useState<CapturedMedia[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(-1);

  // Lấy GPS khi vào màn hình
  useEffect(() => {
    (async () => {
      setLocationLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Cần quyền vị trí",
          "Cần quyền vị trí để báo cáo ngập lụt chính xác!"
        );
        setLocationLoading(false);
        return;
      }
      try {
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setCurrentLocation(location);

        // Chuyển tọa độ thành địa chỉ
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

  // Xử lý khi người dùng chụp xong
  const handleMediaDone = (newMedia: CapturedMedia[]) => {
    setMediaList([...mediaList, ...newMedia]);
    setShowCamera(false);
  };

  // Xóa ảnh khỏi danh sách
  const removeMedia = (index: number) => {
    setMediaList(mediaList.filter((_, i) => i !== index));
  };

  // Validate trước khi submit
  const canSubmit = content.trim() || mediaList.length > 0;

  // Submit báo cáo
  const handleSubmit = async () => {
    if (!currentLocation) {
      Alert.alert("Lỗi", "Chưa lấy được vị trí. Vui lòng thử lại!");
      return;
    }

    if (!canSubmit) {
      return;
    }

    setSubmitting(true);
    try {
      // Tách photos và videos
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
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        }
      );

      if (response.success) {
        Alert.alert(
          "Thành công",
          response.status === "hidden"
            ? "Báo cáo của bạn đã được ghi nhận nhưng sẽ được kiểm duyệt trước khi hiển thị."
            : "Báo cáo ngập lụt đã được đăng thành công!",
          [{ text: "OK", onPress: () => router.back() }]
        );
      } else {
        Alert.alert("Lỗi", response.message);
      }
    } catch (error: any) {
      console.error("Lỗi submit:", error);
      if (error.response?.status === 413) {
        Alert.alert(
          "File quá lớn",
          "Tổng dung lượng ảnh/video quá lớn (vượt giới hạn máy chủ). Vui lòng gửi file nhẹ hơn hoặc ngắn hơn (Tối đa 50MB cho video)."
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

  // Nếu đang bật Camera
  if (showCamera) {
    return (
      <CustomCamera
        onClose={() => setShowCamera(false)}
        onDone={handleMediaDone}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-100 dark:bg-slate-950">
      <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900">
        <View className="px-4 pt-4 pb-6">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
              <Ionicons name="close" size={22} color="#0F172A" />
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
            <Text className="text-xs text-slate-500 dark:text-slate-400">
              {locationLoading
                ? "Đang lấy vị trí..."
                : locationAddress
                ? locationAddress
                : currentLocation
                ? `Vĩ độ: ${currentLocation.coords.latitude.toFixed(6)}, Kinh độ: ${currentLocation.coords.longitude.toFixed(6)}`
                : "Chưa lấy được vị trí"}
            </Text>
          </View>

          {/* User row */}
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-9 h-9 rounded-full bg-slate-300 dark:bg-slate-700" />
            <View>
              <Text className="text-slate-900 dark:text-white text-sm font-semibold">
                Bạn
              </Text>
              <Text className="text-xs text-slate-400 dark:text-slate-500">
                Báo cáo ngập lụt
              </Text>
            </View>
          </View>

          {/* Severity selector */}
          <View className="mb-4">
            <Text className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              Mức độ ngập lụt
            </Text>
            <View className="flex-row gap-2">
              {(["low", "medium", "high"] as Severity[]).map((level) => (
                <TouchableOpacity
                  key={level}
                  onPress={() => setSeverity(level)}
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
    </SafeAreaView>
  );
}
