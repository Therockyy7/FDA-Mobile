// features/areas/hooks/useControlArea.ts
// Hook to manage all area-related operations for map screen
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import type MapView from "react-native-maps";
import type { MapPressEvent, Region } from "react-native-maps";
import { AreaService } from "~/features/areas/services/area.service";
import { useTranslation } from "~/features/i18n/hooks/useTranslation";
import type { AreaWithStatus } from "~/features/map/types/map-layers.types";
import { useCurrentSubscription } from "~/features/plans/hooks/useCurrentSubscription";

// Error types for better UX
export type AreaErrorType =
  | "duplicate"
  | "duplicateName"
  | "noStations"
  | "general"
  | null;

export interface AreaError {
  type: AreaErrorType;
  title: string;
  message: string;
  existingAreaName?: string;
}

type UseControlAreaParams = {
  mapRef: React.RefObject<MapView | null>;
  region: Region | null;
  refreshAreas: () => void | Promise<void>;
  clearSelections: () => void;
  onMapCenterChange?: (coordinate: { latitude: number; longitude: number }) => void;
  onAreaSubscribe?: (areaId: string) => void;
  onAreaUnsubscribe?: (areaId: string) => void;
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
  onMapCenterChange,
  onAreaSubscribe,
  onAreaUnsubscribe,
}: UseControlAreaParams) {
  const { t } = useTranslation();
  const router = useRouter();
  // Subscription check — Premium/Monitor bypasses the free 5-area limit
  const { data: subscriptionData } = useCurrentSubscription();
  const tierCode = subscriptionData?.subscription?.tierCode;
  const isPremium = tierCode === "PREMIUM" || tierCode === "MONITOR";
  // Selected area state
  const [selectedArea, setSelectedArea] = useState<AreaWithStatus | null>(null);

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

  // Error modal state
  const [areaError, setAreaError] = useState<AreaError | null>(null);

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
    [clearSelections, mapRef],
  );

  // Close area card
  const handleCloseAreaCard = useCallback(() => {
    setSelectedArea(null);
  }, []);

  // Delete Confirmation State
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Trigger delete modal
  const handleDeleteArea = useCallback(() => {
    if (!selectedArea) return;
    setDeleteModalVisible(true);
  }, [selectedArea]);

  const handleCancelDelete = useCallback(() => {
    setDeleteModalVisible(false);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedArea) return;
    
    setIsDeleting(true);
    const areaId = selectedArea.id;
    
    try {
      onAreaUnsubscribe?.(areaId);
      await AreaService.deleteArea(areaId);
      await refreshAreas();
      setSelectedArea(null);
      setDeleteModalVisible(false);
    } catch (error: any) {
      console.error("Failed to delete area:", error);
      Alert.alert("Lỗi", "Không thể xóa vùng này.");
    } finally {
      setIsDeleting(false);
    }
  }, [selectedArea, refreshAreas, onAreaUnsubscribe]);

  // NEW: Start creating area - check premium limit first, then show option selection sheet
  const handleStartCreateArea = useCallback(async () => {
    // Prevent multiple calls
    if (isCheckingLimit) {
      // console.log("⚠️ Already checking limit, skipping...");
      return;
    }

    clearSelections();
    setSelectedArea(null);
    setIsCheckingLimit(true);

    // Check if user has reached free limit
    try {
      // console.log("🔍 Checking area count...");
      const areas = await AreaService.getAreas();
      const count = areas.length;
      // console.log(`📊 Area count: ${count}/${FREE_AREA_LIMIT}`);
      setCurrentAreaCount(count);

      // Premium/Monitor users have unlimited areas — skip the limit check
      if (!isPremium && count >= FREE_AREA_LIMIT) {
        // Show premium limit modal instead of creation options
        // console.log("🔒 LIMIT REACHED! Showing premium modal...");
        setIsCheckingLimit(false);
        setShowPremiumLimitModal(true);
        return;
      }

      // Under limit (or Premium), show creation options
      // console.log("✅ Under limit, showing creation options...");
      setIsCheckingLimit(false);
      setShowCreationOptions(true);
    } catch (error) {
      console.error("❌ Failed to check area count:", error);
      // Still reset checking state and allow creation on error
      setIsCheckingLimit(false);
      setShowCreationOptions(true);
    }
  }, [clearSelections, isCheckingLimit, isPremium]);

  // NEW: Handle option selection (GPS or Search)
  const handleOptionSelect = useCallback(
    async (option: "gps" | "search" | "map_center") => {
      // Don't close immediately - wait for next step to be ready
      // setShowCreationOptions(false);

      if (option === "gps") {
        // Option 1: Use current GPS location
        setIsLoadingLocation(true);
        try {
          // Request location permission
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            setIsLoadingLocation(false);
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
          // console.log("Location GPS:", location);

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
              // console.log("Reverse geocoded address:", addressText);
            }
          } catch (geocodeError) {
            console.warn("Reverse geocoding failed:", geocodeError);
            // Continue without address - user can fill manually
          }

          // Set draft area at user's location with 150m radius
          setDraftAreaCenter({ latitude, longitude });
          setDraftAreaRadius(DEFAULT_RADIUS);
          setDraftAddress(addressText);

          // Switch to adjustment mode and CLOSE the options sheet
          setIsAdjustingRadius(true);
          setShowCreationOptions(false);
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
      } else if (option === "map_center") {
        // Option 3: Use current map center
        if (region) {
          const { latitude, longitude } = region;
          setDraftAreaCenter({ latitude, longitude });
          setDraftAreaRadius(DEFAULT_RADIUS);
          setDraftAddress("");

          // Switch to adjustment mode and CLOSE the options sheet
          setIsAdjustingRadius(true);
          setShowCreationOptions(false);
        } else {
          Alert.alert("Lỗi", "Không thể lấy vị trí trung tâm bản đồ.", [
            { text: "OK" },
          ]);
        }
      } else {
        // Option 2: Show address search sheet with brief loading
        setIsLoadingSearch(true);
        // Brief delay for smooth UX
        setTimeout(() => {
          setIsLoadingSearch(false);
          setShowAddressSearch(true);
          setShowCreationOptions(false); // Close options sheet when search sheet opens
        }, 300);
      }
    },
    [mapRef, region],
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

  // Loading state for search option (brief loading before showing search sheet)
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  // Step 1 -> Step 2: Confirm location, show name/address modal
  const handleConfirmLocation = useCallback(async () => {
    if (draftAreaCenter && !editingArea) {
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: draftAreaCenter.latitude,
          longitude: draftAreaCenter.longitude,
        });

        if (reverseGeocode.length > 0) {
          const place = reverseGeocode[0];
          const addressParts = [
            place.streetNumber,
            place.street,
            place.district,
            place.subregion,
            place.city,
          ].filter(Boolean);

          const addressText = addressParts.join(", ");
          if (addressText) {
            setDraftAddress(addressText);
          }
        }
      } catch (error) {
        console.warn("Reverse geocoding failed on confirm:", error);
      }
    }

    setIsAdjustingRadius(false);
    setShowCreateAreaSheet(true);
  }, [draftAreaCenter, editingArea]);

  // Cancel Step 1: Cancel radius adjustment
  const handleCancelCreateArea = useCallback(() => {
    setIsAdjustingRadius(false);
    setDraftAreaCenter(null);
    setDraftAreaRadius(DEFAULT_RADIUS);
    setDraftAddress("");
    setEditingArea(null);
  }, []);

  // Parse error message into a localized + typed AreaError.
  const parseAreaError = useCallback(
    (errorMessage: string, isUpdate: boolean): AreaError => {
      // Duplicate-by-location:
      //   "An area 'AreaName' already exists within X meters"
      const duplicateLocationMatch = errorMessage.match(
        /An area '([^']+)' already exists within (\d+) meters/i,
      );
      if (duplicateLocationMatch) {
        const existingAreaName = duplicateLocationMatch[1];
        const distance = duplicateLocationMatch[2];
        return {
          type: "duplicate",
          title: t("areas.error.duplicate.title"),
          message: t("areas.error.duplicate.message", {
            name: existingAreaName,
            distance,
          }),
          existingAreaName,
        };
      }

      // Duplicate name. BE phrasings vary, so cover the common ones:
      //   "You already have an area named 'X'. Please choose a different name."
      //   "An area with name 'X' already exists"
      //   "Area name 'X' is already taken/used"
      //   "Duplicate area name"
      //   "Tên vùng đã tồn tại" / "trùng tên"
      const duplicateNamedMatch = errorMessage.match(
        /(?:you\s+already\s+have\s+an?\s+area|an?\s+area\s+with\s+(?:the\s+)?name)\s+(?:named\s+)?['"]([^'"]+)['"]/i,
      );
      const isDuplicateName =
        !!duplicateNamedMatch ||
        /(?:area\s+)?name\s+['"]?[^'"]*['"]?\s+(?:is\s+)?(?:already\s+)?(?:exists?|taken|used|in\s+use)/i.test(
          errorMessage,
        ) ||
        /duplicate\s+(?:area\s+)?name/i.test(errorMessage) ||
        /choose\s+a\s+different\s+name/i.test(errorMessage) ||
        /tên.{0,30}(?:đã\s+tồn\s+tại|trùng|đã\s+sử\s+dụng)/i.test(
          errorMessage,
        ) ||
        /trùng\s+tên/i.test(errorMessage);

      if (isDuplicateName) {
        const capturedName = duplicateNamedMatch?.[1];
        return {
          type: "duplicateName",
          title: t("areas.error.duplicateName.title"),
          message: capturedName
            ? t("areas.error.duplicateName.message", { name: capturedName })
            : t("areas.error.duplicateName.messageGeneric"),
          existingAreaName: capturedName,
        };
      }

      // No active monitoring stations within radius
      if (/no active monitoring stations/i.test(errorMessage)) {
        return {
          type: "noStations",
          title: t("areas.error.create.title"),
          message: t("areas.error.noStations.message"),
        };
      }

      // General fallback — note: raw `errorMessage` from the BE may be in
      // English, but at least the title comes through localized.
      return {
        type: "general",
        title: isUpdate
          ? t("areas.error.update.title")
          : t("areas.error.create.title"),
        message: errorMessage || t("areas.error.general.message"),
      };
    },
    [t],
  );

  // Close error modal
  const handleCloseErrorModal = useCallback(() => {
    setAreaError(null);
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
          const newArea = await AreaService.createArea({
            name: data.name,
            latitude: draftAreaCenter.latitude,
            longitude: draftAreaCenter.longitude,
            radiusMeters: draftAreaRadius,
            addressText: data.addressText || undefined,
          });
          onAreaSubscribe?.(newArea.id);
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
        const parsedError = parseAreaError(error?.message || "", !!editingArea);
        // Location-related errors (no station coverage / area at this location
        // already exists) cannot be fixed by changing the name — close the
        // sheet and return to the radius-adjust step so user can pick another
        // spot after dismissing the error modal.
        if (
          !editingArea &&
          (parsedError.type === "noStations" ||
            parsedError.type === "duplicate")
        ) {
          setShowCreateAreaSheet(false);
          setIsAdjustingRadius(true);
        }
        setAreaError(parsedError);
      } finally {
        setIsCreatingArea(false);
      }
    },
    [
      draftAreaCenter,
      draftAreaRadius,
      refreshAreas,
      editingArea,
      parseAreaError,
    ],
  );

  // Close Step 2 modal (go back to Step 1)
  const handleCloseCreateArea = useCallback(() => {
    setShowCreateAreaSheet(false);
    setIsAdjustingRadius(true);
  }, []);

  // Handle map press - no longer needed for area creation (now uses center-based approach)
  const handleMapPress = useCallback(
    (event: MapPressEvent) => {
      // Tap to set position is disabled when using center-based approach
      // The circle now follows the map center automatically
    },
    [],
  );

  // Update draft area center when map moves (center-based approach)
  const updateDraftAreaFromMapCenter = useCallback(
    (coordinate: { latitude: number; longitude: number }) => {
      if (isAdjustingRadius) {
        setDraftAreaCenter(coordinate);
      }
    },
    [isAdjustingRadius],
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

  // Navigate to the existing Premium plans screen
  const handleUpgradePremium = useCallback(() => {
    setShowPremiumLimitModal(false);
    router.push("/plans" as any);
  }, [router]);

  return {
    // State
    selectedArea,
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
    isLoadingSearch,
    // Error state
    areaError,

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
    updateDraftAreaFromMapCenter,
    // NEW: Option selection handlers
    handleOptionSelect,
    handleAddressSelected,
    handleCloseCreationOptions,
    handleCloseAddressSearch,
    // Premium limit handlers
    handleClosePremiumLimitModal,
    handleUpgradePremium,
    // Error handlers
    handleCloseErrorModal,
    // Delete Confirmation
    deleteModalVisible,
    isDeletingArea: isDeleting,
    handleCancelDelete,
    handleConfirmDelete,
  };
}
