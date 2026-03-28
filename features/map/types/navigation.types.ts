// features/map/types/navigation.types.ts
// Types liên quan đến chỉ đường turn-by-turn
import type MapView from "react-native-maps";
import type { DecodedRoute } from "./safe-route.types";

/** Mức độ thông báo giọng nói khi đến gần điểm rẽ */
export type VoiceLevel = "early" | "approach" | "now";

/** Tham số khởi tạo hook useNavigation */
export interface UseNavigationParams {
  route: DecodedRoute | null;
  mapRef: React.RefObject<MapView | null>;
}
