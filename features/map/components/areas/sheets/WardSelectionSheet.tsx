// features/map/components/areas/sheets/WardSelectionSheet.tsx
import { Ionicons } from "@expo/vector-icons";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "~/components/ui/text";
import type { AdminArea } from "~/features/areas/types/admin-area.types";
import { useColorScheme } from "~/lib/useColorScheme";

interface WardSelectionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  adminAreas: AdminArea[];
  onSelectWard: (area: AdminArea) => void;
}

// Lightweight item type for the list (avoid passing geometry around)
interface WardListItem {
  id: string;
  name: string;
  code: string;
}

export function WardSelectionSheet({
  isOpen,
  onClose,
  adminAreas,
  onSelectWard,
}: WardSelectionSheetProps) {
  const { isDarkColorScheme } = useColorScheme();
  const [searchQuery, setSearchQuery] = useState("");
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  const { height: SCREEN_HEIGHT } = Dimensions.get("window");
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS === "android") {
      const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      });
      const hideSub = Keyboard.addListener("keyboardDidHide", () => {
        setKeyboardHeight(0);
      });
      return () => {
        showSub.remove();
        hideSub.remove();
      };
    }
  }, []);

  // Theme colors
  const colors = useMemo(
    () => ({
      bg: isDarkColorScheme ? "#0F172A" : "#FFFFFF",
      surface: isDarkColorScheme ? "#1E293B" : "#F8FAFC",
      surfaceHover: isDarkColorScheme ? "#334155" : "#EFF6FF",
      border: isDarkColorScheme ? "#334155" : "#E2E8F0",
      text: isDarkColorScheme ? "#F1F5F9" : "#1E293B",
      textSecondary: isDarkColorScheme ? "#94A3B8" : "#64748B",
      textMuted: isDarkColorScheme ? "#64748B" : "#94A3B8",
      accent: "#3B82F6",
      accentLight: isDarkColorScheme ? "#3B82F620" : "#3B82F610",
      handle: isDarkColorScheme ? "#475569" : "#CBD5E1",
      searchBg: isDarkColorScheme ? "#1E293B" : "#F1F5F9",
      searchBorder: isDarkColorScheme ? "#334155" : "#E2E8F0",
    }),
    [isDarkColorScheme],
  );

  // Build lightweight list (strip geometry for performance)
  const wardList: WardListItem[] = useMemo(
    () =>
      adminAreas.map((a) => ({
        id: a.id,
        name: a.name,
        code: a.code,
      })),
    [adminAreas],
  );

  // Filtered list based on search
  const filteredWards = useMemo(() => {
    if (!searchQuery.trim()) return wardList;
    const q = searchQuery.toLowerCase().trim();
    return wardList.filter(
      (w) =>
        w.name.toLowerCase().includes(q) || w.code.toLowerCase().includes(q),
    );
  }, [wardList, searchQuery]);

  // Pulse animation for the AI icon
  useEffect(() => {
    if (isOpen) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isOpen, pulseAnim]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  const handleSelect = useCallback(
    (item: WardListItem) => {
      // Find the full admin area (with geometry) by id
      const fullArea = adminAreas.find((a) => a.id === item.id);
      if (fullArea) {
        onSelectWard(fullArea);
      }
    },
    [adminAreas, onSelectWard],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: WardListItem; index: number }) => (
      <TouchableOpacity
        key={item.id}
        onPress={() => handleSelect(item)}
        activeOpacity={0.6}
        style={[
          styles.wardItem,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        {/* Index badge */}
        <View
          style={[styles.indexBadge, { backgroundColor: colors.accentLight }]}
        >
          <Text
            style={[
              styles.indexText,
              { color: colors.accent },
            ]}
          >
            {index + 1}
          </Text>
        </View>

        {/* Ward info */}
        <View style={styles.wardInfo}>
          <Text
            style={[styles.wardName, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text
            style={[styles.wardCode, { color: colors.textMuted }]}
            numberOfLines={1}
          >
            {item.code}
          </Text>
        </View>

        {/* Arrow icon */}
        <View style={[styles.arrowContainer, { backgroundColor: colors.accentLight }]}>
          <Ionicons name="chevron-forward" size={16} color={colors.accent} />
        </View>
      </TouchableOpacity>
    ),
    [colors, handleSelect],
  );

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, justifyContent: "flex-end", paddingBottom: Platform.OS === "android" ? keyboardHeight : 0 }}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        >
          <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.4)" }} />
        </Pressable>

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.bg,
              maxHeight: SCREEN_HEIGHT * 0.6,
              minHeight: SCREEN_HEIGHT * 0.4,
              paddingTop: 12,
            },
          ]}
        >
          <View style={styles.handleIndicatorContainer}>
          <View style={[styles.handleIndicator, { backgroundColor: colors.handle }]} />
        </View>

        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerTitleRow}>
              <Animated.View
                style={[
                  styles.aiIconContainer,
                  { opacity: pulseAnim },
                ]}
              >
                <Ionicons name="sparkles" size={20} color="#8B5CF6" />
              </Animated.View>
              <View>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  Chọn khu vực dự báo
                </Text>
                <Text
                  style={[styles.headerSubtitle, { color: colors.textSecondary }]}
                >
                  {filteredWards.length} phường/xã có sẵn
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.surface }]}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: colors.searchBg,
                borderColor: colors.searchBorder,
              },
            ]}
          >
            <Ionicons
              name="search"
              size={18}
              color={colors.textMuted}
              style={{ marginRight: 10 }}
            />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Tìm phường/xã theo tên hoặc mã..."
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, { color: colors.text }]}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Ward List */}
        <FlatList
          data={filteredWards}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={true}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Không tìm thấy khu vực nào
              </Text>
              <Text style={[styles.emptyHint, { color: colors.textMuted }]}>
                Thử tìm với từ khóa khác
              </Text>
            </View>
          }
          keyboardShouldPersistTaps="handled"
        />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 16,
  },
  handleIndicatorContainer: {
    alignItems: "center",
    paddingBottom: 12,
  },
  handleIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  aiIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#8B5CF615",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    padding: 0,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 8,
  },
  wardItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  indexBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  indexText: {
    fontSize: 13,
    fontWeight: "700",
  },
  wardInfo: {
    flex: 1,
  },
  wardName: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  wardCode: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  arrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  emptyHint: {
    fontSize: 13,
    fontWeight: "500",
  },
});
