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
import { TabLoadingScreen } from "~/components/ui/TabLoadingScreen";
import { Text } from "~/components/ui/text";
import type { NotificationChannels } from "~/features/alerts/types/alert-settings.types";
import { AdminAreaCard } from "~/features/areas/components/AdminAreaCard";
import { ConfirmDeleteModal } from "~/features/areas/components/ConfirmDeleteModal";
import { EditAreaSheet } from "~/features/areas/components/EditAreaSheet";
import { ErrorModal } from "~/features/areas/components/ErrorModal";
import { WaterLevelAreaCard } from "~/features/areas/components/WaterLevelAreaCard";
import { useQueryClient } from "@tanstack/react-query";
import { AreaService } from "~/features/areas/services/area.service";
import { ADMIN_AREAS_QUERY_KEY, useAdminAreasQuery } from "~/features/map/hooks/queries/useAdminAreasQuery";
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

  const queryClient = useQueryClient();
  const adminAreasQuery = useAdminAreasQuery();
  const adminAreas = adminAreasQuery.data ?? [];
  const loadingAdminAreas = adminAreasQuery.isLoading;

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

  // Theme colors — use NativeWind dark: prefix instead of ternaries
  // Background handled by className
  const statusBarStyle = isDarkColorScheme ? "light-content" : "dark-content";

  // const {handleStartEditArea} = useControlArea();

  // Fetch areas from API
  const fetchAreas = useCallback(async (showFullLoading = false) => {
    if (showFullLoading) setIsLoading(true);
    try {
      // FE-10A: single batch call instead of getAreas() + N × getAreaStatus()
      const areasWithStatus = await AreaService.getAreasWithStatus();

      const ALERT_KEYS = areasWithStatus.map(
        (a) => `${ALERT_SETTINGS_KEY_PREFIX}${a.id}`,
      );
      const storedValues = await Promise.all(
        ALERT_KEYS.map((k) => AsyncStorage.getItem(k).catch(() => null)),
      );

      const result: AreaWithStatus[] = areasWithStatus.map((a, i) => {
        let alertChannels = DEFAULT_ALERT_CHANNELS;
        try {
          const stored = storedValues[i];
          if (stored) {
            const parsed = JSON.parse(stored) as {
              notificationChannels?: NotificationChannels;
            };
            alertChannels =
              parsed.notificationChannels || DEFAULT_ALERT_CHANNELS;
          }
        } catch {
          // ignore
        }
        return {
          area: a,
          status: {
            areaId: a.id,
            status: a.status,
            severityLevel: a.severityLevel,
            summary: a.summary,
            contributingStations: a.contributingStations,
            evaluatedAt: a.evaluatedAt ?? new Date().toISOString(),
          },
          alertChannels,
        };
      });

      setAreas(result);
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
      // Chỉ hiện full loading lần đầu (areas chưa có data)
      fetchAreas(areas.length === 0);
    }, [fetchAreas, areas.length]),
  );

  // Pull to refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    if (activeTab === "my-areas") {
      fetchAreas(false);
    } else {
      queryClient.invalidateQueries({ queryKey: [ADMIN_AREAS_QUERY_KEY] }).finally(() =>
        setRefreshing(false),
      );
    }
  }, [fetchAreas, activeTab, queryClient]);

  // Load Admin Areas when tab changes to admin-areas
  React.useEffect(() => {
    if (activeTab === "admin-areas") {
      queryClient.invalidateQueries({ queryKey: [ADMIN_AREAS_QUERY_KEY] });
    }
  }, [activeTab, queryClient]);

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

  // Edit area - navigate to map with edit mode (like AreaActionBar)
  const handleEdit = useCallback(
    (area: Area) => {
      // Navigate to Map tab with edit params → triggers handleStartEditAreaFromParams
      router.push({
        pathname: "/(tabs)/map" as any,
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
    router.push("/");
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
    <View style={{ flex: 1 }} className="bg-slate-50 dark:bg-slate-900">
      <StatusBar
        barStyle={statusBarStyle as any}
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <LinearGradient
        colors={isDarkColorScheme ? ["#1E293B", "#0B1A33"] : ["#FFFFFF", "#F9FAFB"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop:
            Platform.OS === "android"
              ? (StatusBar.currentHeight || 0) + 12
              : insets.top + 8,
          paddingBottom: 16,
          paddingHorizontal: 20,
          borderBottomWidth: 1,
        }}
        className="dark:from-slate-800 dark:to-slate-900 border-border-light dark:border-border-dark"
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
                  backgroundColor: "#007AFF",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="location" size={20} color="white" />
              </View>
              <Text
                className="text-slate-900 dark:text-slate-100 font-extrabold tracking-tight"
                style={{ fontSize: 24 }}
                testID="areas-screen-title"
              >
                Vùng theo dõi
              </Text>
            </View>
            <Text
              className="text-slate-500 dark:text-slate-400 font-medium"
              style={{
                fontSize: 13,
                marginTop: 4,
                marginLeft: 48,
              }}
              testID="areas-screen-count"
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
                  borderWidth: 1,
                }}
                className="bg-white dark:bg-slate-800 border-border-light dark:border-border-dark"
              >
                <Ionicons name="time-outline" size={16} className="text-slate-900 dark:text-slate-100" />
                <Text
                  className="text-slate-900 dark:text-slate-100 font-bold"
                  style={{
                    fontSize: 12,
                  }}
                  testID="areas-screen-history-button"
                >
                  Lịch sử
                </Text>
              </View>
            </TouchableOpacity>
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
                activeTab === "my-areas" ? "#007AFF" : "transparent",
              alignItems: "center",
            }}
            testID="areas-screen-tab-my-areas"
          >
            <Text
              className={activeTab === "my-areas" ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-500 dark:text-slate-400 font-medium"}
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
                activeTab === "admin-areas" ? "#007AFF" : "transparent",
              alignItems: "center",
            }}
            testID="areas-screen-tab-admin"
          >
            <Text
              className={activeTab === "admin-areas" ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-500 dark:text-slate-400 font-medium"}
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
            testID="areas-screen-empty"
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
              className="bg-slate-200/50 dark:bg-slate-700/50"
            >
              <Ionicons
                name="location-outline"
                size={40}
                className="text-slate-400 dark:text-slate-500"
              />
            </View>
            <Text
              className="text-slate-900 dark:text-slate-100 font-bold mb-2 text-center"
              style={{
                fontSize: 18,
              }}
              testID="areas-screen-empty-title"
            >
              Chưa có vùng nào
            </Text>
            <Text
              className="text-slate-500 dark:text-slate-400 text-center font-medium mb-6"
              style={{
                fontSize: 14,
              }}
              testID="areas-screen-empty-description"
            >
              Tạo vùng theo dõi để nhận cảnh báo mực nước trong khu vực của bạn
            </Text>
            <TouchableOpacity onPress={handleCreateArea} activeOpacity={0.8}>
              <LinearGradient
                colors={["#007AFF", "#2563EB"]}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingVertical: 14,
                  paddingHorizontal: 24,
                  borderRadius: 14,
                }}
                testID="areas-screen-empty-button"
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
                colors={["#007AFF"]}
                tintColor="#007AFF"
              />
            }
          >
            {areas.map(({ area, status, alertChannels }) => (
              <WaterLevelAreaCard
                key={area.id}
                area={area}
                status={status}
                alertChannels={alertChannels}
                onPress={() => handleViewDetail(area.id)}
                onEdit={() => handleEdit(area)}
                onDelete={() => handleDelete(area.id, area.name)}
                onAlertSettings={() => handleAlertSettings(area.id, area.name)}
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
              colors={["#007AFF"]}
              tintColor="#007AFF"
            />
          }
          testID="areas-screen-admin-list"
        >
          {loadingAdminAreas && adminAreas.length === 0 ? (
            <Text
              className="text-slate-500 dark:text-slate-400 text-center font-medium mt-5"
              testID="areas-screen-admin-loading"
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
              className="text-slate-500 dark:text-slate-400 text-center font-medium mt-5"
              testID="areas-screen-admin-empty"
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
