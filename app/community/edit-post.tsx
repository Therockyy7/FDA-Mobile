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
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";

import { CustomCamera, CapturedMedia } from "~/components/CustomCamera";
import { CommunityService } from "~/features/community/services/community.service";
import { Post } from "~/features/community/types/post-types";
import { useTranslation } from "~/features/i18n";

type Severity = "low" | "medium" | "high";

interface ExistingMedia {
  id: string;
  mediaUrl: string;
  mediaType: "photo" | "video";
  thumbnailUrl?: string | null;
}

export default function EditPostScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const router = useRouter();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<Severity>("medium");
  const [address, setAddress] = useState("");
  const [showCamera, setShowCamera] = useState(false);

  // Media
  const [existingMedia, setExistingMedia] = useState<ExistingMedia[]>([]);
  const [newMediaList, setNewMediaList] = useState<CapturedMedia[]>([]);
  const [mediaToDelete, setMediaToDelete] = useState<string[]>([]);

  // Location
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>("");

  // Load post data
  useEffect(() => {
    async function loadPost() {
      if (!postId) return;

      try {
        setLoading(true);
        const response = await CommunityService.getFloodReportById(postId);

        if (response.success) {
          setDescription(response.description || "");
          setSeverity(response.severity as Severity);
          setAddress(response.address || "");

          // Load existing media
          if (response.media && response.media.length > 0) {
            setExistingMedia(
              response.media.map((m) => ({
                id: m.id,
                mediaUrl: m.mediaUrl,
                mediaType: m.mediaType,
                thumbnailUrl: m.thumbnailUrl,
              }))
            );
          }

          // Helper to set location with reverse geocoding
          const setLocationWithAddress = async (lat: number, lng: number) => {
            setCurrentLocation({
              coords: { latitude: lat, longitude: lng, altitude: null, accuracy: 0, altitudeAccuracy: 0, heading: 0, speed: 0 },
              timestamp: Date.now(),
            } as Location.LocationObject);

            try {
              const [result] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
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
              setLocationAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            }
          };

          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status === "granted") {
            try {
              let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
              });
              await setLocationWithAddress(location.coords.latitude, location.coords.longitude);
            } catch (error) {
              // Use original location from post
              await setLocationWithAddress(response.latitude, response.longitude);
            }
          } else {
            await setLocationWithAddress(response.latitude, response.longitude);
          }
        }
      } catch (error) {
        console.error("Lỗi load post:", error);
        Alert.alert(t("common.error"), t("community.post.loadError"));
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [postId]);

  // Handle new media from camera
  const handleMediaDone = (media: CapturedMedia[]) => {
    setNewMediaList([...newMediaList, ...media]);
    setShowCamera(false);
  };

  // Remove new media
  const removeNewMedia = (index: number) => {
    setNewMediaList(newMediaList.filter((_, i) => i !== index));
  };

  // Mark existing media for deletion
  const markExistingMediaForDeletion = (id: string) => {
    setExistingMedia(existingMedia.filter((m) => m.id !== id));
    setMediaToDelete([...mediaToDelete, id]);
  };

  // Submit update
  const handleSubmit = async () => {
    if (!postId) return;

    // At least one of: description, new media, or keep existing media
    const hasContent = description.trim() || newMediaList.length > 0 || existingMedia.length > 0;
    if (!hasContent) {
      Alert.alert(t("common.error"), t("community.post.emptyContentError"));
      return;
    }

    setSubmitting(true);
    try {
      // Prepare new media files
      const mediaFilesToAdd = newMediaList.map((m) => ({
        uri: m.uri,
        type: m.type === "image" ? "image/jpeg" : "video/mp4",
        name: m.uri.split("/").pop() || `media.${m.type === "image" ? "jpg" : "mp4"}`,
      }));

      const response = await CommunityService.updateFloodReport(postId, {
        description: description.trim() || undefined,
        severity,
        address: address.trim() || undefined,
        mediaFilesToAdd: mediaFilesToAdd.length > 0 ? mediaFilesToAdd : undefined,
        mediaToDelete: mediaToDelete.length > 0 ? mediaToDelete : undefined,
      });

      if (response.success) {
        Alert.alert(t("common.success"), t("community.post.updateSuccess"), [
          { text: t("common.ok"), onPress: () => router.back() },
        ]);
      } else {
        Alert.alert(t("common.error"), response.message);
      }
    } catch (error: any) {
      console.error("Lỗi update:", error);
      Alert.alert(t("common.error"), t("community.post.updateError"));
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-100 dark:bg-slate-950 items-center justify-center">
        <ActivityIndicator size="large" color="#0EA5E9" />
        <Text className="text-slate-500 mt-2">{t("common.loading")}</Text>
      </SafeAreaView>
    );
  }

  // Camera view
  if (showCamera) {
    return (
      <CustomCamera
        onClose={() => setShowCamera(false)}
        onDone={handleMediaDone}
      />
    );
  }

  const hasChanges = description.trim() || newMediaList.length > 0 || mediaToDelete.length > 0;

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
              {t("community.post.edit")}
            </Text>
            <TouchableOpacity
              onPress={handleSubmit}
              className={`px-3 py-1.5 rounded-full ${
                submitting ? "bg-slate-300" : "bg-sky-600"
              }`}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-xs font-semibold text-white">{t("common.save")}</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Location */}
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons
              name="location"
              size={14}
              color={currentLocation ? "#22C55E" : "#94A3B8"}
            />
            <Text className="text-xs text-slate-500 dark:text-slate-400">
              {locationAddress
                ? locationAddress
                : currentLocation
                ? `${currentLocation.coords.latitude.toFixed(6)}, ${currentLocation.coords.longitude.toFixed(6)}`
                : t("community.post.noLocation")}
            </Text>
          </View>

          {/* Severity selector */}
          <View className="mb-4">
            <Text className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              {t("community.post.level")}
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
                    {level === "low" ? t("alerts.severity.low") : level === "medium" ? t("alerts.severity.medium") : t("alerts.severity.high")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description input */}
          <Text className="text-sm text-slate-700 dark:text-slate-300 mb-2">
            {t("community.post.description")}
          </Text>
          <TextInput
            placeholder={t("community.post.descriptionPlaceholder")}
            placeholderTextColor="#94A3B8"
            multiline
            value={description}
            onChangeText={setDescription}
            className="min-h-[100px] text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 mb-4"
            textAlignVertical="top"
          />

          {/* Existing Media */}
          {existingMedia.length > 0 && (
            <View className="mb-4">
              <Text className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                {t("community.post.currentImages")}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {existingMedia.map((media) => (
                    <View key={media.id} className="relative">
                      <Image
                        source={{ uri: media.mediaUrl }}
                        className="w-24 h-24 rounded-xl"
                        resizeMode="cover"
                      />
                      {media.mediaType === "video" && (
                        <View className="absolute inset-0 items-center justify-center bg-black/30 rounded-xl">
                          <Ionicons name="play" size={24} color="white" />
                        </View>
                      )}
                      <TouchableOpacity
                        className="absolute -top-2 -right-2 bg-red-500 w-6 h-6 rounded-full items-center justify-center"
                        onPress={() => markExistingMediaForDeletion(media.id)}
                      >
                        <Ionicons name="close" size={14} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Media to delete indicator */}
          {mediaToDelete.length > 0 && (
            <View className="flex-row items-center gap-2 mb-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">
              <Ionicons name="trash" size={16} color="#EF4444" />
              <Text className="text-sm text-red-600 dark:text-red-400">
                {mediaToDelete.length} {t("community.post.imagesToDeleteInfo")}
              </Text>
            </View>
          )}

          {/* New Media Preview */}
          {newMediaList.length > 0 && (
            <View className="mb-4">
              <Text className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                {t("community.post.newImages")}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {newMediaList.map((media, index) => (
                    <View key={index} className="relative">
                      <Image
                        source={{ uri: media.uri }}
                        className="w-24 h-24 rounded-xl"
                        resizeMode="cover"
                      />
                      {media.type === "video" && (
                        <View className="absolute inset-0 items-center justify-center bg-black/30 rounded-xl">
                          <Ionicons name="play" size={24} color="white" />
                        </View>
                      )}
                      <TouchableOpacity
                        className="absolute -top-2 -right-2 bg-red-500 w-6 h-6 rounded-full items-center justify-center"
                        onPress={() => removeNewMedia(index)}
                      >
                        <Ionicons name="close" size={14} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Add Media Button */}
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 py-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 mb-4"
            onPress={() => setShowCamera(true)}
          >
            <Ionicons name="camera" size={20} color="#22C55E" />
            <Text className="text-sm text-slate-700 dark:text-slate-300">
              {t("community.post.addMedia")}
            </Text>
          </TouchableOpacity>

          {/* Info */}
          <View className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl flex-row gap-2">
            <Ionicons name="information-circle" size={18} color="#0EA5E9" />
            <Text className="text-xs text-blue-700 dark:text-blue-400 flex-1">
              {t("community.post.editInfo")}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
