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
import {
  usePlaceSearchHistoryItems,
  usePlaceSearchHistoryStore,
} from "~/features/map/stores/usePlaceSearchHistoryStore";
import type { PlaceSearchHistoryItem } from "~/features/map/stores/usePlaceSearchHistoryStore";
import type { LatLng } from "~/features/map/types/safe-route.types";
import { PlaceSearchHistoryList } from "./place-search-history-list";

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
  const isDark = isDarkColorScheme;
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
  const historyItems = usePlaceSearchHistoryItems();
  const addHistoryItem = usePlaceSearchHistoryStore((s) => s.addItem);
  const removeHistoryItem = usePlaceSearchHistoryStore((s) => s.removeItem);
  const clearHistory = usePlaceSearchHistoryStore((s) => s.clearAll);

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
      addHistoryItem({
        placeId: detail.placeId || prediction.placeId,
        name: detail.name || prediction.mainText,
        address: detail.address || prediction.fullText,
        latitude: detail.coordinate.latitude,
        longitude: detail.coordinate.longitude,
      });
      onSelectPlace(detail.coordinate, detail.name || detail.address);
      clearSearch();
      onClose();
    }
  };

  const handleSelectHistory = (item: PlaceSearchHistoryItem) => {
    Keyboard.dismiss();
    addHistoryItem({
      placeId: item.placeId,
      name: item.name,
      address: item.address,
      latitude: item.latitude,
      longitude: item.longitude,
    });
    onSelectPlace(
      { latitude: item.latitude, longitude: item.longitude },
      item.name || item.address,
    );
    clearSearch();
    onClose();
  };

  // When user presses "search" on keyboard, auto-select first result
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
        style={{
          flex: 1,
          backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
          paddingTop:
            Platform.OS === "android"
              ? (StatusBar.currentHeight ?? 0) + 8
              : insets.top,
        }}
      >
        {/* Search Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingBottom: 12,
            gap: 8,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? "#334155" : "#F1F5F9",
          }}
        >
          <TouchableOpacity
            onPress={handleClose}
            style={{ padding: 8 }}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={22} color={isDark ? "#94A3B8" : "#374151"} />
          </TouchableOpacity>

          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: isDark ? "#334155" : "#F3F4F6",
              borderRadius: 12,
              paddingHorizontal: 12,
              gap: 8,
            }}
          >
            <Ionicons name="search" size={18} color={isDark ? "#64748B" : "#9CA3AF"} />
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={setQuery}
              placeholder={placeholder}
              placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
              returnKeyType="search"
              autoCorrect={false}
              onSubmitEditing={handleSubmitEditing}
              style={{
                flex: 1,
                fontSize: 15,
                color: isDark ? "#F1F5F9" : "#111827",
                paddingVertical: 12,
              }}
            />
            {isSearching && (
              <ActivityIndicator size="small" color={accentColor} />
            )}
            {query.length > 0 && !isSearching && (
              <TouchableOpacity onPress={() => { setQuery(""); onQueryClear?.(); }} hitSlop={6}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            gap: 2,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? "#334155" : "#F1F5F9",
          }}
        >
          {showGPSOption && (
            <TouchableOpacity
              onPress={handleUseGPS}
              activeOpacity={0.6}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "#D1FAE5",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="navigate" size={18} color="#16A34A" />
              </View>
              <Text
                style={{ fontSize: 15, fontWeight: "600", color: "#16A34A" }}
              >
                Vị trí hiện tại
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handlePickOnMap}
            activeOpacity={0.6}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 12,
              gap: 12,
            }}
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
            <Text style={{ fontSize: 15, fontWeight: "500", color: isDark ? "#94A3B8" : "#374151" }}>
              Chọn trên bản đồ
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Results */}
        <View style={{ flex: 1 }}>
          {predictions.length > 0 && (
            <View style={{ paddingTop: 8 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: isDark ? "#64748B" : "#9CA3AF",
                  paddingHorizontal: 16,
                  paddingBottom: 8,
                  letterSpacing: 0.5,
                }}
              >
                KẾT QUẢ TÌM KIẾM
              </Text>
              {predictions.map((prediction, index) => (
                <TouchableOpacity
                  key={prediction.placeId + index}
                  onPress={() => handleSelect(prediction)}
                  activeOpacity={0.6}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    gap: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: isDark ? "#334155" : "#F8FAFC",
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: isDark ? "#334155" : "#F1F5F9",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="location" size={18} color={isDark ? "#94A3B8" : "#6B7280"} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: isDark ? "#F1F5F9" : "#1F2937",
                      }}
                      numberOfLines={1}
                    >
                      {prediction.mainText}
                    </Text>
                    {prediction.secondaryText ? (
                      <Text
                        style={{
                          fontSize: 12,
                          color: isDark ? "#64748B" : "#9CA3AF",
                          marginTop: 2,
                        }}
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
            <View
              style={{
                alignItems: "center",
                paddingTop: 40,
                paddingHorizontal: 32,
              }}
            >
              <Ionicons name="search" size={40} color={isDark ? "#334155" : "#D1D5DB"} />
              <Text
                style={{
                  fontSize: 14,
                  color: isDark ? "#64748B" : "#9CA3AF",
                  textAlign: "center",
                  marginTop: 12,
                }}
              >
                Không tìm thấy kết quả cho “{query}”
              </Text>
            </View>
          )}

          {/* Recent searches */}
          {query.length < 2 && predictions.length === 0 && historyItems.length > 0 && (
            <PlaceSearchHistoryList
              items={historyItems}
              isDark={isDark}
              onSelect={handleSelectHistory}
              onRemove={removeHistoryItem}
              onClearAll={clearHistory}
            />
          )}

          {/* Hint */}
          {query.length < 2 && predictions.length === 0 && historyItems.length === 0 && (
            <View
              style={{
                alignItems: "center",
                paddingTop: 40,
                paddingHorizontal: 32,
              }}
            >
              <Ionicons name="location-outline" size={40} color={isDark ? "#334155" : "#D1D5DB"} />
              <Text
                style={{
                  fontSize: 14,
                  color: isDark ? "#64748B" : "#9CA3AF",
                  textAlign: "center",
                  marginTop: 12,
                  lineHeight: 20,
                }}
              >
                Nhập tên đường, địa danh hoặc địa chỉ để tìm kiếm
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
