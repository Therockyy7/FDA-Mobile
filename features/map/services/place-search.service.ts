// features/map/services/place-search.service.ts
// VietMap Autocomplete & Place Detail API calls

import type { PlaceDetail, PlacePrediction } from "../hooks/usePlaceSearch";
import { MapServiceError } from "./map-service-error";

const VIETMAP_API_KEY = process.env.EXPO_PUBLIC_VIETMAP_API_KEY ?? "";

// Danang center for biasing search results
const DANANG_LAT = 16.0544;
const DANANG_LNG = 108.2022;

// VietMap city boundary id for Đà Nẵng — used as a secondary client-side filter.
const DANANG_CITY_ID = 14;

// VietMap's focus.point and boundary.rect params have NO effect on result ranking.
// The only reliable way to prioritize Đà Nẵng is to include it in the query text.
const DANANG_SUFFIX = ", Đà Nẵng";
const DANANG_TERMS = ["đà nẵng", "da nang", "danang"];

// Common province/city keywords — if the user types any of these we treat the
// query as intentionally targeting another location and skip the Đà Nẵng suffix.
const OTHER_PROVINCE_TERMS = [
  "hà nội", "ha noi", "hanoi",
  "hồ chí minh", "ho chi minh", "hcm", "sài gòn", "sai gon",
  "hải phòng", "hai phong",
  "cần thơ", "can tho",
  "huế", "hue",
  "nha trang",
  "đà lạt", "da lat", "dalat",
  "quy nhon", "quy nhơn",
  "vũng tàu", "vung tau",
  "quảng nam", "quang nam",
  "quảng ngãi", "quang ngai",
  "bình định", "binh dinh",
  "phú yên", "phu yen",
  "khánh hòa", "khanh hoa",
  "ninh thuận", "ninh thuan",
  "bình thuận", "binh thuan",
  "gia lai", "kon tum",
  "đắk lắk", "dak lak",
  "đắk nông", "dak nong",
  "lâm đồng", "lam dong",
  "bình phước", "binh phuoc",
  "tây ninh", "tay ninh",
  "bình dương", "binh duong",
  "đồng nai", "dong nai",
  "long an", "tiền giang", "tien giang",
  "bến tre", "ben tre",
  "trà vinh", "tra vinh",
  "vĩnh long", "vinh long",
  "đồng tháp", "dong thap",
  "an giang",
  "kiên giang", "kien giang",
  "hậu giang", "hau giang",
  "sóc trăng", "soc trang",
  "bạc liêu", "bac lieu",
  "cà mau", "ca mau",
  "thanh hóa", "thanh hoa",
  "nghệ an", "nghe an",
  "hà tĩnh", "ha tinh",
  "quảng bình", "quang binh",
  "quảng trị", "quang tri",
];

function hasOtherProvince(input: string): boolean {
  const lower = input.toLowerCase();
  return OTHER_PROVINCE_TERMS.some((t) => lower.includes(t));
}

export interface AutocompleteOptions {
  focusLat?: number;
  focusLng?: number;
  // Pass `false` to search nationwide without Đà Nẵng context injection.
  filterDanang?: boolean;
}

function isInDanang(item: any): boolean {
  const boundaries: Array<{ id: number }> = item.boundaries ?? [];
  return boundaries.some((b) => b.id === DANANG_CITY_ID);
}

function mapToPrediction(item: any): PlacePrediction {
  const name = item.name ?? "";
  const address = item.address ?? "";
  const display = item.display ?? `${name}, ${address}`;
  return {
    placeId: item.ref_id ?? "",
    mainText: name,
    secondaryText: address,
    fullText: display,
  };
}

export class PlaceSearchService {
  static async autocomplete(
    input: string,
    options: AutocompleteOptions = {},
  ): Promise<PlacePrediction[]> {
    const { focusLat = DANANG_LAT, focusLng = DANANG_LNG, filterDanang = true } = options;

    const lower = input.toLowerCase();
    const hasDanang = DANANG_TERMS.some((t) => lower.includes(t));
    const hasOther = hasOtherProvince(input);
    // Apply Đà Nẵng context only when user hasn't specified any city explicitly.
    const applyDanang = filterDanang && !hasDanang && !hasOther;
    const queryText = applyDanang ? `${input}${DANANG_SUFFIX}` : input;

    try {
      const params = new URLSearchParams({
        apikey: VIETMAP_API_KEY,
        text: queryText,
        "focus.point.lat": String(focusLat),
        "focus.point.lon": String(focusLng),
      });

      const res = await fetch(`https://maps.vietmap.vn/api/autocomplete/v3?${params}`);

      if (!res.ok) {
        throw new MapServiceError("VietMap autocomplete request failed", res.status);
      }

      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        return [];
      }

      if (applyDanang) {
        // Sort Đà Nẵng items to the top, keep other provinces below.
        const sorted = [...data].sort((a, b) => {
          const aDN = isInDanang(a) ? 0 : 1;
          const bDN = isInDanang(b) ? 0 : 1;
          return aDN - bDN;
        });
        return sorted.slice(0, 5).map(mapToPrediction);
      }

      return data.slice(0, 5).map(mapToPrediction);
    } catch (error: any) {
      if (error instanceof MapServiceError) throw error;
      throw new MapServiceError(
        error?.message || "Failed to fetch place suggestions",
      );
    }
  }

  static async getPlaceDetail(
    prediction: PlacePrediction,
  ): Promise<PlaceDetail | null> {
    // Coords embedded in placeId for geo_ results
    if (prediction.placeId.startsWith("geo_")) {
      const [lat, lng] = prediction.placeId
        .replace("geo_", "")
        .split(",")
        .map(Number);
      return {
        placeId: prediction.placeId,
        name: prediction.mainText,
        address: prediction.fullText,
        coordinate: { latitude: lat, longitude: lng },
      };
    }

    try {
      const params = new URLSearchParams({
        apikey: VIETMAP_API_KEY,
        refid: prediction.placeId,
      });

      const res = await fetch(`https://maps.vietmap.vn/api/place/v3?${params}`);

      if (!res.ok) {
        throw new MapServiceError("VietMap place detail request failed", res.status);
      }

      const data = await res.json();

      if (data.lat && data.lng) {
        return {
          placeId: prediction.placeId,
          name: data.name || prediction.mainText,
          address: data.display || prediction.fullText,
          coordinate: { latitude: data.lat, longitude: data.lng },
        };
      }

      return null;
    } catch (error: any) {
      if (error instanceof MapServiceError) throw error;
      throw new MapServiceError(
        error?.message || "Failed to fetch place detail",
      );
    }
  }
}
