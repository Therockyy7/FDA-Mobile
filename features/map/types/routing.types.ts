// features/map/types/routing.types.ts
// Types liên quan đến tìm đường và nhập điểm đi/đến

import type { LatLng } from "./safe-route.types";

/** Phương tiện di chuyển */
export type TransportMode = "car" | "motorbike" | "bicycle" | "walk";

/** Trạng thái đang chọn điểm trên bản đồ */
export type PickingTarget = "origin" | "destination" | null;

/** VietMap Autocomplete place prediction */
export interface PlacePrediction {
  placeId: string;
  mainText: string;
  secondaryText: string;
  fullText: string;
}

/** VietMap place detail */
export interface PlaceDetail {
  placeId: string;
  name: string;
  address: string;
  coordinate: LatLng;
}

/** Props cho RouteDirectionPanel */
export interface RouteDirectionPanelProps {
  visible: boolean;
  onClose: () => void;

  // Origin
  originText: string;
  onOriginChange: (value: string) => void;
  isUsingGPSOrigin: boolean;
  onUseGPSAsOrigin: () => void;
  onPickOriginOnMap: () => void;
  hasOriginCoord: boolean;
  onOriginPlaceSelected?: (coord: LatLng, label: string) => void;

  // Destination
  destinationText: string;
  onDestinationChange: (value: string) => void;
  isUsingGPSDest: boolean;
  onUseGPSAsDest: () => void;
  onPickDestinationOnMap: () => void;
  hasDestinationCoord: boolean;
  onDestinationPlaceSelected?: (coord: LatLng, label: string) => void;

  // Swap
  onSwap: () => void;

  // Transport
  transportMode: TransportMode;
  onModeChange: (mode: TransportMode) => void;

  // Action
  onFindRoute: () => void;
  isLoading?: boolean;
  error?: string | null;
}
