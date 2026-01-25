// features/areas/hooks/useControlArea.ts
// Hook to manage all area-related operations for map screen
import * as Location from "expo-location";
import { useCallback, useRef, useState } from "react";
import { Alert, Animated } from "react-native";
import type MapView from "react-native-maps";
import type { MapPressEvent, Region } from "react-native-maps";
import { AreaService } from "~/features/areas/services/area.service";
import type { AreaWithStatus } from "~/features/map/types/map-layers.types";

type UseControlAreaParams = {
  mapRef: React.RefObject<MapView>;
  region: Region | null;
  refreshAreas: () => void | Promise<void>;
  clearSelections: () => void;
};

// Default radius for new areas (meters)
const DEFAULT_RADIUS = 150;

// Premium limits
const FREE_AREA_LIMIT = 5;

export function useControlArea({
  mapRef,
  region,
  refreshAreas,
  clearSelections,
}: UseControlAreaParams) {
  // Selected area state
  const [selectedArea, setSelectedArea] = useState<AreaWithStatus | null>(null);
  const areaCardAnim = useRef(new Animated.Value(300)).current;

  // New: Option selection state
  const [showCreationOptions, setShowCreationOptions] = useState(false);
  const [showAddressSearch, setShowAddressSearch] = useState(false);
  const [draftAddress, setDraftAddress] = useState("");

  // Premium limit state
  const [showPremiumLimitModal, setShowPremiumLimitModal] = useState(false);
  const [currentAreaCount, setCurrentAreaCount] = useState(0);

  // Loading states for better UX
  const [isCheckingLimit, setIsCheckingLimit] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

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
  const [draftAreaRadius, setDraftAreaRadius] = useState(DEFAULT_RADIUS);
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

  // NEW: Start creating area - check premium limit first, then show option selection sheet
  const handleStartCreateArea = useCallback(async () => {
    // Prevent multiple calls
    if (isCheckingLimit) {
      console.log("⚠️ Already checking limit, skipping...");
      return;
    }

    clearSelections();
    setSelectedArea(null);
    setIsCheckingLimit(true);

    // Check if user has reached free limit
    try {
      console.log("🔍 Checking area count...");
      const areas = await AreaService.getAreas();
      const count = areas.length;
      console.log(`📊 Area count: ${count}/${FREE_AREA_LIMIT}`);
      setCurrentAreaCount(count);

      if (count >= FREE_AREA_LIMIT) {
        // Show premium limit modal instead of creation options
        console.log("🔒 LIMIT REACHED! Showing premium modal...");
        setIsCheckingLimit(false);
        setShowPremiumLimitModal(true);
        return;
      }

      // Under limit, show creation options
      console.log("✅ Under limit, showing creation options...");
      setIsCheckingLimit(false);
      setShowCreationOptions(true);
    } catch (error) {
      console.error("❌ Failed to check area count:", error);
      // Still reset checking state and allow creation on error
      setIsCheckingLimit(false);
      setShowCreationOptions(true);
    }
  }, [clearSelections, isCheckingLimit]);

  // NEW: Handle option selection (GPS or Search)
  const handleOptionSelect = useCallback(
    async (option: "gps" | "search") => {
      setShowCreationOptions(false);

      if (option === "gps") {
        // Option 1: Use current GPS location
        setIsLoadingLocation(true);
        try {
          // Request location permission
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            Alert.alert(
              "Quyền truy cập vị trí",
              "Ứng dụng cần quyền truy cập vị trí để sử dụng tính năng này. Vui lòng cấp quyền trong cài đặt.",
              [{ text: "OK" }],
            );
            return;
          }

          // Get current location
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          console.log("Location GPS:", location);

          const { latitude, longitude } = location.coords;

          // Reverse geocode to get address from coordinates
          let addressText = "";
          try {
            const reverseGeocode = await Location.reverseGeocodeAsync({
              latitude,
              longitude,
            });

            if (reverseGeocode.length > 0) {
              const place = reverseGeocode[0];
              // Build address string from components
              const addressParts = [
                place.streetNumber,
                place.street,
                place.district,
                place.subregion,
                place.city,
              ].filter(Boolean); // Remove null/undefined values

              addressText = addressParts.join(", ");
              console.log("Reverse geocoded address:", addressText);
            }
          } catch (geocodeError) {
            console.warn("Reverse geocoding failed:", geocodeError);
            // Continue without address - user can fill manually
          }

          // Set draft area at user's location with 150m radius
          setDraftAreaCenter({ latitude, longitude });
          setDraftAreaRadius(DEFAULT_RADIUS);
          setDraftAddress(addressText);
          setIsAdjustingRadius(true);
          setIsLoadingLocation(false);

          // Animate map to user's location
          mapRef.current?.animateToRegion(
            {
              latitude,
              longitude,
              latitudeDelta: (DEFAULT_RADIUS / 111320) * 4,
              longitudeDelta: (DEFAULT_RADIUS / 111320) * 4,
            },
            500,
          );
        } catch (error) {
          console.error("Location error:", error);
          setIsLoadingLocation(false);
          Alert.alert(
            "Lỗi vị trí",
            "Không thể lấy vị trí hiện tại. Vui lòng thử lại hoặc dùng tìm kiếm địa chỉ.",
            [{ text: "OK" }],
          );
        }
      } else {
        // Option 2: Show address search sheet
        setShowAddressSearch(true);
      }
    },
    [mapRef],
  );

  // NEW: Handle address selection from search
  const handleAddressSelected = useCallback(
    (coords: { latitude: number; longitude: number; address: string }) => {
      setShowAddressSearch(false);

      // Set draft area at searched location with 150m radius
      setDraftAreaCenter({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      setDraftAreaRadius(DEFAULT_RADIUS);
      setDraftAddress(coords.address);
      setIsAdjustingRadius(true);

      // Animate map to searched location
      mapRef.current?.animateToRegion(
        {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: (DEFAULT_RADIUS / 111320) * 4,
          longitudeDelta: (DEFAULT_RADIUS / 111320) * 4,
        },
        500,
      );
    },
    [mapRef],
  );

  // NEW: Close creation options sheet
  const handleCloseCreationOptions = useCallback(() => {
    setShowCreationOptions(false);
  }, []);

  // NEW: Close address search sheet
  const handleCloseAddressSearch = useCallback(() => {
    setShowAddressSearch(false);
  }, []);

  // Step 1 -> Step 2: Confirm location, show name/address modal
  const handleConfirmLocation = useCallback(() => {
    setIsAdjustingRadius(false);
    setShowCreateAreaSheet(true);
  }, []);

  // Cancel Step 1: Cancel radius adjustment
  const handleCancelCreateArea = useCallback(() => {
    setIsAdjustingRadius(false);
    setDraftAreaCenter(null);
    setDraftAreaRadius(DEFAULT_RADIUS);
    setDraftAddress("");
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
        setDraftAddress("");
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
        // Allow tap on map to change position
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
      setDraftAddress(areaData.addressText || "");

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
    setDraftAddress(selectedArea.addressText || "");

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

  // Close premium limit modal
  const handleClosePremiumLimitModal = useCallback(() => {
    setShowPremiumLimitModal(false);
  }, []);

  // Handle premium upgrade (placeholder for future implementation)
  const handleUpgradePremium = useCallback(() => {
    setShowPremiumLimitModal(false);
    // TODO: Navigate to premium upgrade screen
    Alert.alert(
      "Nâng cấp Premium",
      "Tính năng Premium sẽ sớm ra mắt. Hãy theo dõi để cập nhật!",
      [{ text: "OK" }],
    );
  }, []);

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
    // NEW: Option selection states
    showCreationOptions,
    showAddressSearch,
    draftAddress,
    // Premium limit states
    showPremiumLimitModal,
    currentAreaCount,
    freeAreaLimit: FREE_AREA_LIMIT,
    // Loading states
    isCheckingLimit,
    isLoadingLocation,

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
    // NEW: Option selection handlers
    handleOptionSelect,
    handleAddressSelected,
    handleCloseCreationOptions,
    handleCloseAddressSearch,
    // Premium limit handlers
    handleClosePremiumLimitModal,
    handleUpgradePremium,
  };
}
