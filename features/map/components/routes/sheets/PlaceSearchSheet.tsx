// features/map/components/routes/PlaceSearchSheet.tsx
// Fullscreen search sheet for selecting a place (like Google Maps)

import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Platform,
  StatusBar,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import {
  usePlaceSearch,
  type PlacePrediction,
} from "~/features/map/hooks/usePlaceSearch";
import type { LatLng } from "~/features/map/types/safe-route.types";

interface PlaceSearchSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectPlace: (coord: LatLng, label: string) => void;
  onPickOnMap: () => void;
  onUseGPS?: () => void;
  showGPSOption?: boolean;
  placeholder?: string;
  accentColor?: string;
  initialQuery?: string;
  onQueryClear?: () => void;
}

export function PlaceSearchSheet({
  visible,
  onClose,
  onSelectPlace,
  onPickOnMap,
  onUseGPS,
  showGPSOption = false,
  placeholder = "Tìm kiếm địa điểm...",
  accentColor = "#007AFF",
  initialQuery = "",
  onQueryClear,
}: PlaceSearchSheetProps) {
  const { isDarkColorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const {
    query,
    setQuery,
    predictions,
    isSearching,
    getPlaceDetail,
    clearSearch,
  } = usePlaceSearch();

  useEffect(() => {
    if (visible) {
      setQuery(initialQuery);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      clearSearch();
    }
  }, [visible]);

  const handleSelect = async (prediction: PlacePrediction) => {
    Keyboard.dismiss();
    const detail = await getPlaceDetail(prediction);
    if (detail) {
      onSelectPlace(detail.coordinate, detail.name || detail.address);
      clearSearch();
      onClose();
    }
  };

  const handleSubmitEditing = async () => {
    if (predictions.length > 0) {
      await handleSelect(predictions[0]);
    }
  };

  const handlePickOnMap = () => {
    clearSearch();
    onClose();
    onPickOnMap();
  };

  const handleUseGPS = () => {
    clearSearch();
    onClose();
    onUseGPS?.();
  };

  const handleClose = () => {
    Keyboard.dismiss();
    clearSearch();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View
        className="flex-1 bg-white dark:bg-slate-800"
        style={{
          paddingTop:
            Platform.OS === "android"
              ? (StatusBar.currentHeight ?? 0) + 8
              : insets.top,
        }}
        testID="map-route-sheet-search-input"
      >
        {/* Search Header */}
        <View className="flex-row items-center px-3 pb-3 gap-2 border-b border-slate-100 dark:border-slate-700">
          <TouchableOpacity
            onPress={handleClose}
            style={{ padding: 8 }}
            hitSlop={8}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={isDarkColorScheme ? "#94A3B8" : "#374151"}
            />
          </TouchableOpacity>

          <View className="flex-1 flex-row items-center bg-gray-100 dark:bg-slate-700 rounded-xl px-3 gap-2">
            <Ionicons
              name="search"
              size={18}
              color={isDarkColorScheme ? "#64748B" : "#9CA3AF"}
            />
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={setQuery}
              placeholder={placeholder}
              placeholderTextColor={isDarkColorScheme ? "#64748B" : "#9CA3AF"}
              returnKeyType="search"
              autoCorrect={false}
              onSubmitEditing={handleSubmitEditing}
              style={{
                flex: 1,
                fontSize: 15,
                color: isDarkColorScheme ? "#F1F5F9" : "#111827",
                paddingVertical: 12,
              }}
            />
            {isSearching && (
              <ActivityIndicator size="small" color={accentColor} />
            )}
            {query.length > 0 && !isSearching && (
              <TouchableOpacity
                onPress={() => { setQuery(""); onQueryClear?.(); }}
                hitSlop={6}
              >
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-4 py-2 gap-0.5 border-b border-slate-100 dark:border-slate-700">
          {showGPSOption && (
            <TouchableOpacity
              onPress={handleUseGPS}
              activeOpacity={0.6}
              className="flex-row items-center py-3 gap-3"
            >
              <View className="w-9 h-9 rounded-full bg-emerald-100 items-center justify-center">
                <Ionicons name="navigate" size={18} color="#16A34A" />
              </View>
              <Text className="text-[15px] font-semibold text-emerald-600">
                Vị trí hiện tại
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handlePickOnMap}
            activeOpacity={0.6}
            className="flex-row items-center py-3 gap-3"
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: accentColor + "15",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="map" size={18} color={accentColor} />
            </View>
            <Text className="text-[15px] font-medium text-slate-600 dark:text-slate-400">
              Chọn trên bản đồ
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Results */}
        <View className="flex-1">
          {predictions.length > 0 && (
            <View className="pt-2">
              <Text className="text-[12px] font-semibold text-slate-400 dark:text-slate-500 px-4 pb-2 tracking-wide">
                KẾT QUẢ TÌM KIẾM
              </Text>
              {predictions.map((prediction, index) => (
                <TouchableOpacity
                  key={prediction.placeId + index}
                  onPress={() => handleSelect(prediction)}
                  activeOpacity={0.6}
                  className="flex-row items-center px-4 py-3 gap-3 border-b border-slate-50 dark:border-slate-700"
                >
                  <View className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 items-center justify-center">
                    <Ionicons
                      name="location"
                      size={18}
                      color={isDarkColorScheme ? "#94A3B8" : "#6B7280"}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-sm font-semibold text-slate-800 dark:text-slate-100"
                      numberOfLines={1}
                    >
                      {prediction.mainText}
                    </Text>
                    {prediction.secondaryText ? (
                      <Text
                        className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5"
                        numberOfLines={1}
                      >
                        {prediction.secondaryText}
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Empty state */}
          {query.length >= 2 && predictions.length === 0 && !isSearching && (
            <View className="items-center pt-10 px-8">
              <Ionicons
                name="search"
                size={40}
                color={isDarkColorScheme ? "#334155" : "#D1D5DB"}
              />
              <Text className="text-sm text-slate-400 dark:text-slate-500 text-center mt-3">
                Không tìm thấy kết quả cho "{query}"
              </Text>
            </View>
          )}

          {/* Hint */}
          {query.length < 2 && predictions.length === 0 && (
            <View className="items-center pt-10 px-8">
              <Ionicons
                name="location-outline"
                size={40}
                color={isDarkColorScheme ? "#334155" : "#D1D5DB"}
              />
              <Text className="text-sm text-slate-400 dark:text-slate-500 text-center mt-3 leading-5">
                Nhập tên đường, địa danh hoặc địa chỉ để tìm kiếm
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
