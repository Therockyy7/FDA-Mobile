// features/map/components/areas/AddressSearchSheet.tsx
// Sheet for searching and selecting address to create area
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface AddressSearchSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (coords: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
}

interface SearchResult {
  address: string;
  latitude: number;
  longitude: number;
}

export function AddressSearchSheet({
  visible,
  onClose,
  onSelectLocation,
}: AddressSearchSheetProps) {
  const { isDarkColorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const colors = {
    background: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    cardBg: isDarkColorScheme ? "#334155" : "#F8FAFC",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#475569" : "#E2E8F0",
    inputBg: isDarkColorScheme ? "#0F172A" : "#F1F5F9",
    overlay: "rgba(0, 0, 0, 0.5)",
    accent: "#3B82F6",
    error: "#EF4444",
  };

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    Keyboard.dismiss();
    setIsSearching(true);
    setError(null);
    setSearchResults([]);

    try {
      // Add "Đà Nẵng" or "Vietnam" to improve geocoding results
      const searchAddress =
        searchQuery.includes("Đà Nẵng") || searchQuery.includes("Da Nang")
          ? searchQuery
          : `${searchQuery}, Đà Nẵng, Vietnam`;

      const results = await Location.geocodeAsync(searchAddress);

      if (results.length === 0) {
        setError("Không tìm thấy địa chỉ. Vui lòng thử lại với địa chỉ khác.");
        return;
      }

      // Convert results to our format
      const formattedResults: SearchResult[] = results
        .slice(0, 5)
        .map((result, index) => ({
          address:
            index === 0 ? searchQuery : `${searchQuery} (Kết quả ${index + 1})`,
          latitude: result.latitude,
          longitude: result.longitude,
        }));

      setSearchResults(formattedResults);
    } catch (err) {
      console.error("Geocoding error:", err);
      setError("Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.");
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleSelectResult = useCallback(
    (result: SearchResult) => {
      onSelectLocation({
        latitude: result.latitude,
        longitude: result.longitude,
        address: result.address,
      });
      // Reset state
      setSearchQuery("");
      setSearchResults([]);
      setError(null);
    },
    [onSelectLocation],
  );

  const handleClose = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setError(null);
    onClose();
  }, [onClose]);

  if (!visible) return null;
// Đống Đa
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Backdrop */}
        <Pressable
          style={[styles.overlay, { backgroundColor: colors.overlay }]}
          onPress={handleClose}
        />

        {/* Sheet Content */}
        <Animated.View
          entering={FadeIn.duration(200)}
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          {/* Handle Bar */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>

          {/* Header */}
          <LinearGradient
            colors={["#F97316", "#EA580C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerIconContainer}>
                <Ionicons name="search" size={24} color="white" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Tìm kiếm địa chỉ</Text>
                <Text style={styles.headerSubtitle}>
                  Nhập địa chỉ để tạo vùng theo dõi
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={18} color="white" />
            </TouchableOpacity>
          </LinearGradient>

          {/* Search Input */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(300)}
            style={styles.searchContainer}
          >
            <View
              style={[
                styles.searchInputContainer,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons name="location" size={20} color={colors.subtext} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="VD: 123 Nguyễn Văn Linh, Hải Châu"
                placeholderTextColor={colors.subtext}
                style={[styles.searchInput, { color: colors.text }]}
                returnKeyType="search"
                onSubmitEditing={handleSearch}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={colors.subtext}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Search Button */}
            <TouchableOpacity
              onPress={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  searchQuery.trim()
                    ? ["#3B82F6", "#2563EB"]
                    : [colors.border, colors.border]
                }
                style={styles.searchButton}
              >
                {isSearching ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Ionicons name="search" size={20} color="white" />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Error Message */}
          {error && (
            <Animated.View
              entering={FadeInDown.duration(200)}
              style={[
                styles.errorContainer,
                { backgroundColor: `${colors.error}15` },
              ]}
            >
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>
                {error}
              </Text>
            </Animated.View>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <Animated.View entering={FadeInDown.delay(100).duration(300)}>
              <Text style={[styles.resultsTitle, { color: colors.subtext }]}>
                KẾT QUẢ TÌM KIẾM
              </Text>
              <ScrollView
                style={styles.resultsList}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {searchResults.map((result, index) => (
                  <TouchableOpacity
                    key={`${result.latitude}-${result.longitude}-${index}`}
                    onPress={() => handleSelectResult(result)}
                    activeOpacity={0.7}
                    style={[
                      styles.resultItem,
                      {
                        backgroundColor: colors.cardBg,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.resultIcon,
                        { backgroundColor: `${colors.accent}20` },
                      ]}
                    >
                      <Ionicons
                        name="location"
                        size={18}
                        color={colors.accent}
                      />
                    </View>
                    <View style={styles.resultContent}>
                      <Text
                        style={[styles.resultAddress, { color: colors.text }]}
                      >
                        {result.address}
                      </Text>
                      <Text
                        style={[styles.resultCoords, { color: colors.subtext }]}
                      >
                        {result.latitude.toFixed(5)},{" "}
                        {result.longitude.toFixed(5)}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={colors.subtext}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {/* Hint when no results */}
          {searchResults.length === 0 && !error && !isSearching && (
            <View style={styles.hintContainer}>
              <Ionicons
                name="information-circle"
                size={16}
                color={colors.subtext}
              />
              <Text style={[styles.hintText, { color: colors.subtext }]}>
                Nhập tên đường, số nhà hoặc địa danh để tìm kiếm vị trí
              </Text>
            </View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    margin: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 13,
    flex: 1,
  },
  resultsTitle: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  resultsList: {
    maxHeight: 200,
    marginHorizontal: 16,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  resultIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  resultContent: {
    flex: 1,
  },
  resultAddress: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  resultCoords: {
    fontSize: 11,
  },
  hintContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginHorizontal: 16,
    paddingHorizontal: 12,
  },
  hintText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
});

export default AddressSearchSheet;
