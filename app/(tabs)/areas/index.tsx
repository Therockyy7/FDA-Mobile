// app/(tabs)/areas/index.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { TabLoadingScreen } from "~/components/ui/TabLoadingScreen";
import { Text } from "~/components/ui/text";
import type { NotificationChannels } from "~/features/alerts/types/alert-settings.types";
import { AdminAreaCard } from "~/features/areas/components/AdminAreaCard";
import { ConfirmDeleteModal } from "~/features/areas/components/ConfirmDeleteModal";
import { EditAreaSheet } from "~/features/areas/components/EditAreaSheet";
import { ErrorModal } from "~/features/areas/components/ErrorModal";
import { WaterLevelAreaCard } from "~/features/areas/components/WaterLevelAreaCard";
import { AreaService } from "~/features/areas/services/area.service";
import { fetchAdminAreas } from "~/features/areas/stores/admin-area.slice";
import type {
  Area,
  AreaStatusResponse,
} from "~/features/map/types/map-layers.types";
import { useColorScheme } from "~/lib/useColorScheme";

// Areas with their status
interface AreaWithStatus {
  area: Area;
  status?: AreaStatusResponse;
  alertChannels?: NotificationChannels;
}

const ALERT_SETTINGS_KEY_PREFIX = "@alert_settings_";
const DEFAULT_ALERT_CHANNELS: NotificationChannels = {
  push: true,
  email: false,
  sms: false,
};

export default function AreasScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkColorScheme } = useColorScheme();

  // State
  const [areas, setAreas] = useState<AreaWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"my-areas" | "admin-areas">(
    "my-areas",
  );

  const dispatch = useAppDispatch();
  const { items: adminAreas, loading: loadingAdminAreas } = useAppSelector(
    (state) => state.adminAreas,
  );

  // Delete modal state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingArea, setDeletingArea] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Error modal state
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Theme colors
  const colors = {
    background: isDarkColorScheme ? "#0F172A" : "#F9FAFB",
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#6B7280",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    statusBarStyle: isDarkColorScheme ? "light-content" : "dark-content",
  };

  // const {handleStartEditArea} = useControlArea();

  // Fetch areas from API
  const fetchAreas = useCallback(async () => {
    try {
      const fetchedAreas = await AreaService.getAreas();

      // Fetch status for each area
      const areasWithStatus: AreaWithStatus[] = await Promise.all(
        fetchedAreas.map(async (area) => {
          try {
            const status = await AreaService.getAreaStatus(area.id);
            return { area, status };
          } catch {
            return { area, status: undefined };
          }
        }),
      );

      const areasWithAlerts: AreaWithStatus[] = await Promise.all(
        areasWithStatus.map(async (entry) => {
          try {
            const stored = await AsyncStorage.getItem(
              `${ALERT_SETTINGS_KEY_PREFIX}${entry.area.id}`,
            );
            if (stored) {
              const parsed = JSON.parse(stored) as {
                notificationChannels?: NotificationChannels;
              };
              return {
                ...entry,
                alertChannels:
                  parsed.notificationChannels || DEFAULT_ALERT_CHANNELS,
              };
            }
          } catch {
            // Ignore storage errors and fall back to defaults
          }
          return { ...entry, alertChannels: DEFAULT_ALERT_CHANNELS };
        }),
      );

      setAreas(areasWithAlerts);
    } catch (error) {
      console.error("Failed to fetch areas:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Refresh areas when screen gains focus (after returning from Map edit)
  useFocusEffect(
    useCallback(() => {
      fetchAreas();
    }, [fetchAreas]),
  );

  // Pull to refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    if (activeTab === "my-areas") {
      fetchAreas();
    } else {
      dispatch(fetchAdminAreas({ pageNumber: 1, pageSize: 100 })).finally(() =>
        setRefreshing(false),
      );
    }
  }, [fetchAreas, activeTab, dispatch]);

  // Load Admin Areas when tab changes
  React.useEffect(() => {
    if (activeTab === "admin-areas" && adminAreas.length === 0) {
      dispatch(fetchAdminAreas({ pageNumber: 1, pageSize: 100 }));
    }
  }, [activeTab, dispatch, adminAreas.length]);

  // Open delete confirmation modal
  const handleDelete = useCallback((areaId: string, areaName: string) => {
    setDeletingArea({ id: areaId, name: areaName });
    setDeleteModalVisible(true);
  }, []);

  // Confirm delete
  const handleConfirmDelete = useCallback(async () => {
    if (!deletingArea) return;

    setIsDeleting(true);
    try {
      await AreaService.deleteArea(deletingArea.id);
      setAreas((prev) => prev.filter((a) => a.area.id !== deletingArea.id));
      setDeleteModalVisible(false);
      setDeletingArea(null);
    } catch (error: any) {
      setDeleteModalVisible(false);
      setErrorMessage(
        error?.message || "Không thể xóa vùng. Vui lòng thử lại sau.",
      );
      setErrorModalVisible(true);
    } finally {
      setIsDeleting(false);
    }
  }, [deletingArea]);

  // Cancel delete
  const handleCancelDelete = useCallback(() => {
    setDeleteModalVisible(false);
    setDeletingArea(null);
  }, []);

  // Edit area - navigate to map with edit mode
  const handleEdit = useCallback(
    (area: Area) => {
      // Navigate to map with area's position and edit mode
      router.push({
        pathname: "/map",
        params: {
          editAreaId: area.id,
          editLat: area.latitude.toString(),
          editLng: area.longitude.toString(),
          editRadius: area.radiusMeters.toString(),
          editName: area.name,
          editAddress: area.addressText || "",
        },
      });
    },
    [router],
  );

  // Submit edit
  const handleEditSubmit = useCallback(
    async (data: { name: string; addressText: string }) => {
      if (!editingArea) return;

      setIsEditing(true);
      try {
        const updated = await AreaService.updateArea(editingArea.id, {
          name: data.name,
          addressText: data.addressText,
        });

        // Update local state
        setAreas((prev) =>
          prev.map((a) =>
            a.area.id === editingArea.id ? { ...a, area: updated } : a,
          ),
        );
        setEditingArea(null);
      } catch (error: any) {
        Alert.alert("Lỗi", error?.message || "Không thể cập nhật vùng");
      } finally {
        setIsEditing(false);
      }
    },
    [editingArea],
  );

  // Navigate to detail
  const handleViewDetail = useCallback(
    (areaId: string) => {
      router.push({
        pathname: "/areas/[id]",
        params: { id: areaId },
      });
    },
    [router],
  );

  // Navigate to map to create area
  const handleCreateArea = useCallback(() => {
    router.push("/map");
  }, [router]);

  // Navigate to alert settings
  const handleAlertSettings = useCallback(
    (areaId: string, areaName: string) => {
      router.push({
        pathname: "/alerts/settings" as const,
        params: { areaId, areaName },
      });
    },
    [router],
  );

  // Navigate to alert history
  const handleAlertHistory = useCallback(() => {
    router.push("/alerts/history");
  }, [router]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={colors.statusBarStyle as any}
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <LinearGradient
        colors={
          isDarkColorScheme ? ["#1E293B", "#0F172A"] : ["#FFFFFF", "#F9FAFB"]
        }
        style={{
          paddingTop:
            Platform.OS === "android"
              ? (StatusBar.currentHeight || 0) + 12
              : insets.top + 8,
          paddingBottom: 16,
          paddingHorizontal: 20,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  backgroundColor: "#3B82F6",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="location" size={20} color="white" />
              </View>
              <Text
                style={{ fontSize: 24, fontWeight: "800", color: colors.text }}
              >
                Vùng theo dõi
              </Text>
            </View>
            <Text
              style={{
                fontSize: 13,
                color: colors.subtext,
                marginTop: 4,
                marginLeft: 48,
              }}
            >
              {areas.length} vùng đã tạo
            </Text>
          </View>

          {/* Header actions */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TouchableOpacity onPress={handleAlertHistory} activeOpacity={0.8}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingVertical: 9,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  backgroundColor: isDarkColorScheme ? "#1F2937" : "#FFFFFF",
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Ionicons name="time-outline" size={16} color={colors.text} />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: colors.text,
                  }}
                >
                  Lịch sử
                </Text>
              </View>
            </TouchableOpacity>
            {/* <TouchableOpacity onPress={handleCreateArea} activeOpacity={0.8}>
              <LinearGradient
                colors={["#10B981", "#059669"]}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 12,
                }}
              >
                <Ionicons name="add-circle" size={18} color="white" />
                <Text
                  style={{ fontSize: 13, fontWeight: "700", color: "white" }}
                >
                  Tạo mới
                </Text>
              </LinearGradient>
            </TouchableOpacity> */}
          </View>
        </View>

        {/* Tab Switcher */}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 20,
            paddingTop: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => setActiveTab("my-areas")}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderBottomWidth: 2,
              borderBottomColor:
                activeTab === "my-areas" ? "#3B82F6" : "transparent",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontWeight: activeTab === "my-areas" ? "700" : "500",
                color: activeTab === "my-areas" ? "#3B82F6" : colors.subtext,
              }}
            >
              Khu vực của tôi
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("admin-areas")}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderBottomWidth: 2,
              borderBottomColor:
                activeTab === "admin-areas" ? "#3B82F6" : "transparent",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontWeight: activeTab === "admin-areas" ? "700" : "500",
                color: activeTab === "admin-areas" ? "#3B82F6" : colors.subtext,
              }}
            >
              Khu vực hệ thống
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      {activeTab === "my-areas" &&
        (isLoading ? (
          <TabLoadingScreen
            visible={isLoading}
            message="Đang tải vùng theo dõi..."
          />
        ) : areas.length === 0 ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              padding: 40,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: `${colors.border}50`,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Ionicons
                name="location-outline"
                size={40}
                color={colors.subtext}
              />
            </View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: colors.text,
                marginBottom: 8,
              }}
            >
              Chưa có vùng nào
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.subtext,
                textAlign: "center",
                marginBottom: 24,
              }}
            >
              Tạo vùng theo dõi để nhận cảnh báo mực nước trong khu vực của bạn
            </Text>
            <TouchableOpacity onPress={handleCreateArea} activeOpacity={0.8}>
              <LinearGradient
                colors={["#3B82F6", "#2563EB"]}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingVertical: 14,
                  paddingHorizontal: 24,
                  borderRadius: 14,
                }}
              >
                <Ionicons name="add-circle" size={20} color="white" />
                <Text
                  style={{ fontSize: 15, fontWeight: "700", color: "white" }}
                >
                  Tạo vùng đầu tiên
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={["#3B82F6"]}
                tintColor="#3B82F6"
              />
            }
          >
            {areas.map(({ area, status }) => (
              <WaterLevelAreaCard
                key={area.id}
                area={area}
                status={status}
                onPress={() => handleViewDetail(area.id)}
                onEdit={() => handleEdit(area)}
                onDelete={() => handleDelete(area.id, area.name)}
              />
            ))}
          </ScrollView>
        ))}

      {activeTab === "admin-areas" && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#3B82F6"]}
              tintColor="#3B82F6"
            />
          }
        >
          {loadingAdminAreas && adminAreas.length === 0 ? (
            <Text
              style={{
                textAlign: "center",
                marginTop: 20,
                color: colors.subtext,
              }}
            >
              Đang tải...
            </Text>
          ) : (
            adminAreas.map((area) => (
              <AdminAreaCard
                key={area.id}
                area={area}
                onPress={() =>
                  router.push({
                    pathname: "/prediction/[id]",
                    params: {
                      id: area.id,
                      name: area.name,
                    },
                  })
                }
              />
            ))
          )}
          {!loadingAdminAreas && adminAreas.length === 0 && (
            <Text
              style={{
                textAlign: "center",
                marginTop: 20,
                color: colors.subtext,
              }}
            >
              Chưa có khu vực nào.
            </Text>
          )}
        </ScrollView>
      )}

      {/* Edit Modal */}
      <EditAreaSheet
        visible={!!editingArea}
        area={editingArea}
        onClose={() => setEditingArea(null)}
        onSubmit={handleEditSubmit}
        isLoading={isEditing}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        visible={deleteModalVisible}
        areaName={deletingArea?.name || ""}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={errorModalVisible}
        title="Không thể xóa vùng"
        message={errorMessage}
        onClose={() => setErrorModalVisible(false)}
      />
    </View>
  );
}
