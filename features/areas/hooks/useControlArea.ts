// features/areas/hooks/useControlArea.ts
// Hook to manage all area-related operations for map screen
import { useCallback, useRef, useState } from "react";
import { Alert, Animated } from "react-native";
import type MapView from "react-native-maps";
import type { MapPressEvent, Region } from "react-native-maps";
import { AreaService } from "~/features/areas/services/area.service";
import { DANANG_CENTER } from "~/features/map/constants/map-data";
import type { AreaWithStatus } from "~/features/map/types/map-layers.types";

type UseControlAreaParams = {
  mapRef: React.RefObject<MapView>;
  region: Region | null;
  refreshAreas: () => void | Promise<void>;
  clearSelections: () => void;
};

export function useControlArea({
  mapRef,
  region,
  refreshAreas,
  clearSelections,
}: UseControlAreaParams) {
  // Selected area state
  const [selectedArea, setSelectedArea] = useState<AreaWithStatus | null>(null);
  const areaCardAnim = useRef(new Animated.Value(300)).current;

  // Create/Edit area state - Two-step flow
  // Step 1: Adjust radius bar visible, map draggable
  // Step 2: Modal for name/address input
  const [isAdjustingRadius, setIsAdjustingRadius] = useState(false);
  const [showCreateAreaSheet, setShowCreateAreaSheet] = useState(false);
  const [isCreatingArea, setIsCreatingArea] = useState(false);
  const [draftAreaCenter, setDraftAreaCenter] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [draftAreaRadius, setDraftAreaRadius] = useState(500);
  const [editingArea, setEditingArea] = useState<AreaWithStatus | null>(null);

  // Handle area press - select and show card
  const handleAreaPress = useCallback(
    (area: AreaWithStatus) => {
      clearSelections();
      setSelectedArea(area);

      // Animate card slide in
      Animated.timing(areaCardAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Focus on area
      mapRef.current?.animateToRegion(
        {
          latitude: area.latitude,
          longitude: area.longitude,
          latitudeDelta: (area.radiusMeters / 111320) * 3,
          longitudeDelta: (area.radiusMeters / 111320) * 3,
        },
        500,
      );
    },
    [clearSelections, areaCardAnim, mapRef],
  );

  // Close area card
  const handleCloseAreaCard = useCallback(() => {
    Animated.timing(areaCardAnim, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setSelectedArea(null);
    });
  }, [areaCardAnim]);

  // Delete area
  const handleDeleteArea = useCallback(() => {
    if (!selectedArea) return;

    Alert.alert(
      "Xóa vùng theo dõi",
      `Bạn có chắc chắn muốn xóa "${selectedArea.name}" không?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            const areaId = selectedArea.id;
            setSelectedArea(null);

            try {
              await AreaService.deleteArea(areaId);
              await refreshAreas();
            } catch (error: any) {
              console.error("Failed to delete area:", error);
              Alert.alert("Lỗi", "Không thể xóa vùng này.");
            }
          },
        },
      ],
    );
  }, [selectedArea, refreshAreas]);

  // Step 1: Start creating area - show radius adjust bar
  const handleStartCreateArea = useCallback(() => {
    clearSelections();
    setSelectedArea(null);

    // Set draft area at current map center
    const currentCenter = region || DANANG_CENTER;
    setDraftAreaCenter({
      latitude: currentCenter.latitude,
      longitude: currentCenter.longitude,
    });
    setDraftAreaRadius(100);
    setIsAdjustingRadius(true);
  }, [region, clearSelections]);

 

  // Step 1 -> Step 2: Confirm location, show name/address modal
  const handleConfirmLocation = useCallback(() => {
    setIsAdjustingRadius(false);
    setShowCreateAreaSheet(true);
  }, []);

  // Cancel Step 1: Cancel radius adjustment
  const handleCancelCreateArea = useCallback(() => {
    setIsAdjustingRadius(false);
    setDraftAreaCenter(null);
    setDraftAreaRadius(100);
    setEditingArea(null);
  }, []);

  // Step 2: Submit name/address and create/update area
  const handleCreateAreaSubmit = useCallback(
    async (data: { name: string; addressText: string }) => {
      if (!draftAreaCenter) return;

      setIsCreatingArea(true);
      try {
        if (editingArea) {
          // Update existing area
          await AreaService.updateArea(editingArea.id, {
            name: data.name,
            latitude: draftAreaCenter.latitude,
            longitude: draftAreaCenter.longitude,
            radiusMeters: draftAreaRadius,
            addressText: data.addressText || undefined,
          });
        } else {
          // Create new area
          await AreaService.createArea({
            name: data.name,
            latitude: draftAreaCenter.latitude,
            longitude: draftAreaCenter.longitude,
            radiusMeters: draftAreaRadius,
            addressText: data.addressText || undefined,
          });
        }

        // Refresh areas list
        await refreshAreas();

        // Close sheet and reset
        setShowCreateAreaSheet(false);
        setDraftAreaCenter(null);
        setEditingArea(null);
      } catch (error: any) {
        console.error("Failed to save area:", error);
        Alert.alert(
          editingArea ? "Lỗi cập nhật" : "Lỗi tạo vùng",
          error?.message || "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
          [{ text: "OK" }],
        );
      } finally {
        setIsCreatingArea(false);
      }
    },
    [draftAreaCenter, draftAreaRadius, refreshAreas, editingArea],
  );

  // Close Step 2 modal (go back to Step 1)
  const handleCloseCreateArea = useCallback(() => {
    setShowCreateAreaSheet(false);
    setIsAdjustingRadius(true);
  }, []);

  // Handle map press to update draft area center during Step 1
  const handleMapPress = useCallback(
    (event: MapPressEvent) => {
      if (isAdjustingRadius && draftAreaCenter) {
        setDraftAreaCenter(event.nativeEvent.coordinate);
      }
    },
    [isAdjustingRadius, draftAreaCenter],
  );

  // Start edit mode from external params (from Areas tab navigation)
  const handleStartEditAreaFromParams = useCallback(
    (areaData: {
      id: string;
      name: string;
      latitude: number;
      longitude: number;
      radiusMeters: number;
      addressText?: string;
    }) => {
      clearSelections();

      // Set editing area with the data
      setEditingArea({
        ...areaData,
        status: "Unknown",
        severityLevel: 0,
        summary: "",
        contributingStations: [],
        evaluatedAt: new Date().toISOString(),
      } as AreaWithStatus);

      // Set draft values
      setDraftAreaCenter({
        latitude: areaData.latitude,
        longitude: areaData.longitude,
      });
      setDraftAreaRadius(areaData.radiusMeters);

      // Show radius adjustment bar
      setIsAdjustingRadius(true);
    },
    [clearSelections],
  );

 // Start editing area
  const handleStartEditArea = useCallback(() => {
    if (!selectedArea) return;

    // Set editing state
    setEditingArea(selectedArea);
    setDraftAreaCenter({
      latitude: selectedArea.latitude,
      longitude: selectedArea.longitude,
    });
    setDraftAreaRadius(selectedArea.radiusMeters);

    // Close card and show radius adjust
    setSelectedArea(null);
    setIsAdjustingRadius(true);

    // Focus map on area
    mapRef.current?.animateToRegion(
      {
        latitude: selectedArea.latitude,
        longitude: selectedArea.longitude,
        latitudeDelta: (selectedArea.radiusMeters / 111320) * 4,
        longitudeDelta: (selectedArea.radiusMeters / 111320) * 4,
      },
      500,
    );
  }, [selectedArea, mapRef]);

  return {
    // State
    selectedArea,
    areaCardAnim,
    isAdjustingRadius,
    showCreateAreaSheet,
    isCreatingArea,
    draftAreaCenter,
    draftAreaRadius,
    editingArea,

    // Setters for external use
    setSelectedArea,
    setDraftAreaRadius,
    setDraftAreaCenter,

    // Handlers
    handleAreaPress,
    handleCloseAreaCard,
    handleDeleteArea,
    handleStartCreateArea,
    handleStartEditArea,
    handleStartEditAreaFromParams,
    handleConfirmLocation,
    handleCancelCreateArea,
    handleCreateAreaSubmit,
    handleCloseCreateArea,
    handleMapPress,
  };
}
