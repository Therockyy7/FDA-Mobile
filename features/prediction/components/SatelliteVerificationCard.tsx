import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Polygon, PROVIDER_GOOGLE } from "react-native-maps";
import { Text } from "~/components/ui/text";
import { SHADOW } from "~/lib/design-tokens";
import { useSatelliteFloodStore } from "~/features/map/stores/useSatelliteFloodStore";
import { useSatelliteAnalysis } from "../hooks/useSatelliteAnalysis";
import type {
  IndividualSatelliteResult,
  SatelliteAnalysisResponse,
  SatelliteBbox,
} from "../types/satellite.types";
import { ewkbToMultiLatLngArrays, pointInPolygon } from "~/features/map/lib/ewkb-parser";

interface Props {
  areaId: string;
  areaName?: string;
  /** EWKB hex geometry of the admin area — used to clip satellite flood polygons */
  areaGeometry?: string | null;
}

// ─── Helper: format acquisition date ─────────────────────────────────────────
function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// ─── Helper: cloud cover color ────────────────────────────────────────────────
function cloudColor(pct: number): string {
  if (pct < 0.1) return "#16A34A";
  if (pct < 0.3) return "#CA8A04";
  return "#DC2626";
}

// ─── Helpers for GeoJSON rendering ──────────────────────────────────────────

function lngLatToLatLng(coord: number[]): {
  latitude: number;
  longitude: number;
} {
  return { longitude: coord[0], latitude: coord[1] };
}

function extractRings(
  feature: any,
): { latitude: number; longitude: number }[][] {
  const geom = feature.geometry;
  if (!geom) return [];

  if (geom.type === "Polygon") {
    return geom.coordinates.map((ring: any) => ring.map(lngLatToLatLng));
  }

  if (geom.type === "MultiPolygon") {
    const multiCoords = geom.coordinates;
    return multiCoords.flatMap((poly: any) =>
      poly.map((ring: any) => ring.map(lngLatToLatLng)),
    );
  }

  return [];
}

// ─── Individual platform result sub-card ─────────────────────────────────────
function PlatformResultCard({
  item,
  bbox,
  onViewMap,
  areaGeometry,
}: {
  item: IndividualSatelliteResult;
  bbox: SatelliteBbox | undefined;
  onViewMap: () => void;
  areaGeometry?: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const bg = "#F8FAFC";
  const border = "#E2E8F0";
  const text = "#0F172A";
  const muted = "#64748B";

  const isSAR = item.platform === "Sentinel-1";
  const accent = isSAR ? "#8B5CF6" : "#0EA5E9";
  const accentBg = isSAR ? "rgba(139,92,246,0.12)" : "rgba(14,165,233,0.12)";
  const platformLabel = isSAR
    ? "Sentinel-1 (Radar SAR)"
    : "Sentinel-2 (Optical)";
  const data = item.result?.data;

  // Parse clip boundary for mini map
  const boundaryPolygons = useMemo(() => {
    if (!areaGeometry) return null;
    try {
      const polys = ewkbToMultiLatLngArrays(areaGeometry);
      return polys.length > 0 ? polys : null;
    } catch {
      return null;
    }
  }, [areaGeometry]);

  const polygons = useMemo(() => {
    if (!data?.geojson?.features) return [];
    const result: {
      key: string;
      coords: { latitude: number; longitude: number }[];
      isHole: boolean;
    }[] = [];
    data.geojson.features.forEach((feature: any, fi: number) => {
      const rings = extractRings(feature);
      rings.forEach((ring, ri) => {
        if (ring.length < 3) return;

        // ── CLIP: Skip flood polygons outside the admin area boundary ──
        if (boundaryPolygons && ri === 0) {
          const center = {
            latitude: ring.reduce((s, c) => s + c.latitude, 0) / ring.length,
            longitude: ring.reduce((s, c) => s + c.longitude, 0) / ring.length,
          };
          let inside = false;
          for (const poly of boundaryPolygons) {
            if (pointInPolygon(center, poly)) {
              inside = true;
              break;
            }
          }
          if (!inside) return;
        }

        result.push({
          key: `${fi}-${ri}`,
          coords: ring,
          isHole: ri > 0,
        });
      });
    });
    return result;
  }, [data, boundaryPolygons]);

  const region = useMemo(() => {
    if (polygons.length > 0) {
      let minLat = 90,
        maxLat = -90,
        minLon = 180,
        maxLon = -180;
      polygons.forEach((p) => {
        p.coords.forEach((c) => {
          if (c.latitude < minLat) minLat = c.latitude;
          if (c.latitude > maxLat) maxLat = c.latitude;
          if (c.longitude < minLon) minLon = c.longitude;
          if (c.longitude > maxLon) maxLon = c.longitude;
        });
      });
      // Add minimal padding (~15%)
      const latDelta = Math.max(maxLat - minLat, 0.001);
      const lonDelta = Math.max(maxLon - minLon, 0.001);
      return {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLon + maxLon) / 2,
        latitudeDelta: latDelta * 1.15,
        longitudeDelta: lonDelta * 1.15,
      };
    }
    return bbox
      ? {
          latitude: (bbox.min_lat + bbox.max_lat) / 2,
          longitude: (bbox.min_lon + bbox.max_lon) / 2,
          latitudeDelta: Math.abs(bbox.max_lat - bbox.min_lat) + 0.01,
          longitudeDelta: Math.abs(bbox.max_lon - bbox.min_lon) + 0.01,
        }
      : undefined;
  }, [polygons, bbox]);

  if (!data) {
    return (
      <View
        style={{
          backgroundColor: bg,
          borderRadius: 12,
          padding: 12,
          borderWidth: 1,
          borderColor: border,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
        <Text style={{ fontSize: 12, color: "#EF4444", flex: 1 }}>
          {item.platform}: {item.result?.error || "Không có dữ liệu"}
        </Text>
      </View>
    );
  }

  const meta = data.satellite_metadata;
  const stats = data.filter_stats;
  const visuals = data.visuals;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 350 }}
    >
      <View
        style={{
          backgroundColor: bg,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: border,
          overflow: "hidden",
        }}
      >
        {/* Thumbnail Map */}
        {region ? (
          <View style={{ position: "relative" }}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={{ width: "100%", height: 160 }}
              initialRegion={region}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
              mapType="satellite"
            >
              {polygons.map((p) => (
                <Polygon
                  key={p.key}
                  coordinates={p.coords}
                  fillColor={p.isHole ? "rgba(0,0,0,0)" : accent + "55"}
                  strokeColor={accent + "CC"}
                  strokeWidth={p.isHole ? 0 : 1}
                />
              ))}
            </MapView>
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.7)"]}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 80,
                justifyContent: "flex-end",
                padding: 10,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#EF4444",
                  }}
                />
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: "#FFFFFF",
                  }}
                >
                  Bản đồ ngập lụt · {data.water_area_km2.toFixed(2)} km²
                </Text>
              </View>
            </LinearGradient>
            {/* Platform tag */}
            <View
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                backgroundColor: accentBg,
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderWidth: 1,
                borderColor: accent + "50",
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backdropFilter: "blur(4px)",
              }}
            >
              <Ionicons
                name={isSAR ? "radio-outline" : "eye-outline"}
                size={10}
                color={accent}
              />
              <Text style={{ fontSize: 11, fontWeight: "800", color: accent }}>
                {isSAR ? "SAR RADAR" : "OPTICAL"}
              </Text>
            </View>
          </View>
        ) : (
          <View
            style={{
              height: 60,
              backgroundColor: accentBg,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
            }}
          >
            <Ionicons name="image-outline" size={20} color={muted} />
            <Text style={{ fontSize: 12, color: muted }}>
              Không có ảnh thumbnail
            </Text>
          </View>
        )}

        <View style={{ padding: 12 }}>
          {/* Platform header row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "800",
                  color: text,
                  marginBottom: 2,
                }}
              >
                {platformLabel}
              </Text>
              <Text style={{ fontSize: 10, color: muted }}>
                {formatDate(meta.acquisition_date)}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: accentBg,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "900", color: accent }}>
                {data.water_area_km2.toFixed(2)}
              </Text>
              <Text style={{ fontSize: 11, fontWeight: "700", color: accent }}>
                km² FLOOD
              </Text>
            </View>
          </View>

          {/* Metadata pills */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 10,
            }}
          >
            {/* Cloud cover (Sentinel-2 only) */}
            {!isSAR && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: "#F1F5F9",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                }}
              >
                <Ionicons
                  name="cloud-outline"
                  size={11}
                  color={cloudColor(meta.cloud_cover)}
                />
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "700",
                    color: cloudColor(meta.cloud_cover),
                  }}
                >
                  {(meta.cloud_cover * 100).toFixed(1)}% mây
                </Text>
              </View>
            )}
            {/* Polarization (Sentinel-1 only) */}
            {isSAR && meta.polarization && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: "#F1F5F9",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                }}
              >
                <Ionicons name="funnel-outline" size={11} color={accent} />
                <Text
                  style={{ fontSize: 10, fontWeight: "700", color: accent }}
                >
                  {meta.polarization} · {meta.instrument_mode}
                </Text>
              </View>
            )}
            {/* Permanent water */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor: "#F1F5F9",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
              }}
            >
              <Ionicons name="water-outline" size={11} color="#0EA5E9" />
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  color: "#334155",
                }}
              >
                {stats.permanent_water_km2.toFixed(2)} km² nước thường trú
              </Text>
            </View>
            {/* Slope removed */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor: "#F1F5F9",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
              }}
            >
              <Ionicons name="trending-up-outline" size={11} color="#F59E0B" />
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  color: "#334155",
                }}
              >
                {stats.slope_removed_pixels} px dốc loại bỏ
              </Text>
            </View>
          </View>

          {/* Expandable details */}
          <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
            <TouchableOpacity
              onPress={onViewMap}
              style={{
                flex: 1,
                backgroundColor: accentBg,
                borderRadius: 10,
                paddingVertical: 10,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 6,
                borderWidth: 1,
                borderColor: accent + "30",
              }}
            >
              <Ionicons name="map-outline" size={14} color={accent} />
              <Text style={{ fontSize: 13, fontWeight: "700", color: accent }}>
                Xem trên bản đồ
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setExpanded(!expanded)}
              style={{
                backgroundColor: "#F1F5F9",
                borderRadius: 10,
                paddingHorizontal: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                borderWidth: 1,
                borderColor: border,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: muted,
                }}
              >
                Chi tiết
              </Text>
              <Ionicons
                name={expanded ? "chevron-up" : "chevron-down"}
                size={14}
                color={muted}
              />
            </TouchableOpacity>
          </View>

          {expanded && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: "timing", duration: 200 }}
            >
              <View style={{ marginTop: 10, gap: 6 }}>
                {/* Stats grid */}
                <View style={{ flexDirection: "row", gap: 6 }}>
                  {[
                    {
                      label: "Diện tích gốc",
                      value: `${(stats.original_area_km2 / 1e9).toFixed(2)}B km²`,
                      icon: "expand-outline" as const,
                    },
                    {
                      label: "Sau lọc",
                      value: `${stats.filtered_area_km2.toFixed(2)} km²`,
                      icon: "funnel-outline" as const,
                    },
                    {
                      label: "Giảm",
                      value: `${stats.reduction_pct.toFixed(0)}%`,
                      icon: "arrow-down-outline" as const,
                    },
                  ].map((s) => (
                    <View
                      key={s.label}
                      style={{
                        flex: 1,
                        backgroundColor: "#F1F5F9",
                        borderRadius: 8,
                        padding: 8,
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Ionicons name={s.icon} size={13} color={muted} />
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "800",
                          color: text,
                          textAlign: "center",
                        }}
                      >
                        {s.value}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "600",
                          color: muted,
                          textAlign: "center",
                        }}
                      >
                        {s.label}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Scene ID */}
                {meta.system_index && meta.system_index !== "unknown" && (
                  <View
                    style={{
                      backgroundColor: "#F1F5F9",
                      borderRadius: 8,
                      padding: 8,
                    }}
                  >
                    <Text
                      style={{ fontSize: 11, color: muted, marginBottom: 2 }}
                    >
                      SCENE ID
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "600",
                        color: text,
                        fontFamily: "monospace",
                      }}
                      numberOfLines={2}
                    >
                      {meta.system_index}
                    </Text>
                  </View>
                )}

                {/* Links */}
                <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
                  {visuals.geojson_url && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(visuals.geojson_url!)}
                      style={{
                        flex: 1,
                        backgroundColor: accentBg,
                        borderRadius: 10,
                        paddingVertical: 8,
                        alignItems: "center",
                        flexDirection: "row",
                        justifyContent: "center",
                        gap: 5,
                        borderWidth: 1,
                        borderColor: accent + "30",
                      }}
                    >
                      <Ionicons name="map-outline" size={12} color={accent} />
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color: accent,
                        }}
                      >
                        GeoJSON
                      </Text>
                    </TouchableOpacity>
                  )}
                  {visuals.raw_satellite_tif && (
                    <TouchableOpacity
                      onPress={() =>
                        Linking.openURL(visuals.raw_satellite_tif!)
                      }
                      style={{
                        flex: 1,
                        backgroundColor: "#F1F5F9",
                        borderRadius: 10,
                        paddingVertical: 8,
                        alignItems: "center",
                        flexDirection: "row",
                        justifyContent: "center",
                        gap: 5,
                        borderWidth: 1,
                        borderColor: border,
                      }}
                    >
                      <Ionicons
                        name="document-outline"
                        size={12}
                        color={muted}
                      />
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color: muted,
                        }}
                      >
                        Raw TIF
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </MotiView>
          )}
        </View>
      </View>
    </MotiView>
  );
}

// ─── Main exported component ──────────────────────────────────────────────────
export function SatelliteVerificationCard({ areaId, areaName, areaGeometry }: Props) {
  const router = useRouter();
  const { data, state, error, elapsedSeconds, runAnalysis, reset } =
    useSatelliteAnalysis(areaId);
  const { visible: mapLayerVisible, toggleVisible } = useSatelliteFloodStore();

  const [useFusion, setUseFusion] = useState(true);
  const [useBbox, setUseBbox] = useState(true);

  const bg = "#FFFFFF";
  const border = "#E2E8F0";
  const text = "#0F172A";
  const muted = "#64748B";
  const sub = "#F8FAFC";

  const isIdle = state === "idle";
  const isLoading = state === "loading";
  const isSuccess = state === "success";
  const isError = state === "error";

  const handleRun = () => {
    runAnalysis(useBbox, useFusion);
  };

  // ── Idle / Config UI ──
  const renderIdle = () => (
    <View style={{ gap: 16 }}>
      {/* Science blurb */}
      {/* <View
        style={{
          backgroundColor: "rgba(168,85,247,0.08)",
          borderRadius: 14,
          padding: 14,
          borderLeftWidth: 3,
          borderLeftColor: "#A855F7",
          flexDirection: "row",
          gap: 10,
        }}
      >
        <Ionicons
          name="telescope-outline"
          size={18}
          color="#A855F7"
          style={{ marginTop: 2 }}
        />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "800",
              color: "#7C3AED",
              marginBottom: 4,
            }}
          >
            NASA Prithvi Foundation Model
          </Text>
          <Text
            style={{
              fontSize: 11,
              color: "#6D28D9",
              lineHeight: 17,
            }}
          >
            Mô hình Vision Transformer tiên tiến của NASA/IBM được huấn luyện
            trên hàng trăm TB dữ liệu địa không gian. Phát hiện ngập lụt từ ảnh
            Sentinel-1 (radar, xuyên mây) và Sentinel-2 (quang học).
          </Text>
        </View>
      </View> */}

      {/* Options */}
      <View style={{ gap: 10 }}>
        <Text
          style={{
            fontSize: 11,
            fontWeight: "700",
            color: muted,
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          Cấu hình phân tích
        </Text>

        {/* Fusion toggle */}
        <TouchableOpacity
          onPress={() => setUseFusion(!useFusion)}
          activeOpacity={0.7}
          style={{
            backgroundColor: sub,
            borderRadius: 12,
            padding: 12,
            borderWidth: 1,
            borderColor: useFusion ? "#A855F7" + "50" : border,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: useFusion
                ? "rgba(168,85,247,0.15)"
                : "#F1F5F9",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="layers-outline"
              size={18}
              color={useFusion ? "#A855F7" : muted}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: useFusion ? ("#7C3AED") : text,
                marginBottom: 2,
              }}
            >
              Chế độ Fusion (Khuyến nghị)
            </Text>
            <Text style={{ fontSize: 11, color: muted, lineHeight: 16 }}>
              Kết hợp S1 + S2 → độ chính xác tối đa. Mất ~60–90 giây.
            </Text>
          </View>
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: useFusion ? "#A855F7" : border,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {useFusion && (
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
            )}
          </View>
        </TouchableOpacity>

        {/* Bbox toggle */}
        <TouchableOpacity
          onPress={() => setUseBbox(!useBbox)}
          activeOpacity={0.7}
          style={{
            backgroundColor: sub,
            borderRadius: 12,
            padding: 12,
            borderWidth: 1,
            borderColor: useBbox ? "#0EA5E9" + "50" : border,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: useBbox
                ? "rgba(14,165,233,0.15)"
                : "#F1F5F9",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="scan-outline"
              size={18}
              color={useBbox ? "#0EA5E9" : muted}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: useBbox ? ("#0284C7") : text,
                marginBottom: 2,
              }}
            >
              Vùng Quận/Huyện (bbox)
            </Text>
            <Text style={{ fontSize: 11, color: muted, lineHeight: 16 }}>
              {useBbox
                ? "Giới hạn theo ranh giới quận — nhanh hơn, chi tiết hơn."
                : "Toàn vùng thành phố — phạm vi rộng hơn, chậm hơn."}
            </Text>
          </View>
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: useBbox ? "#0EA5E9" : border,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {useBbox && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
          </View>
        </TouchableOpacity>
      </View>

      {/* Run button */}
      <TouchableOpacity onPress={handleRun} activeOpacity={0.8}>
        <LinearGradient
          colors={["#7C3AED", "#A855F7", "#C084FC"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            borderRadius: 16,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            shadowColor: "#A855F7",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <Ionicons name="planet-outline" size={20} color="#FFFFFF" />
          <Text
            style={{
              fontSize: 15,
              fontWeight: "900",
              color: "#FFFFFF",
              letterSpacing: 0.3,
            }}
          >
            Phân tích vệ tinh Prithvi
          </Text>
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 3,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: "700", color: "#FFFFFF" }}>
              {useFusion ? "S1 + S2" : "S2 only"}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // ── Loading UI ──
  const renderLoading = () => (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: "timing", duration: 300 }}
    >
      <View
        style={{
          backgroundColor: "rgba(168,85,247,0.06)",
          borderRadius: 20,
          padding: 24,
          alignItems: "center",
          gap: 16,
          borderWidth: 1,
          borderColor: "#A855F7" + "30",
          borderStyle: "dashed",
        }}
      >
        <View style={{ position: "relative", width: 72, height: 72 }}>
          <ActivityIndicator
            size="large"
            color="#A855F7"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: "rgba(168,85,247,0.1)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="planet-outline" size={28} color="#A855F7" />
          </View>
        </View>

        <View style={{ alignItems: "center", gap: 6 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "800",
              color: "#7C3AED",
            }}
          >
            Đang xử lý ảnh vệ tinh
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: muted,
              textAlign: "center",
              lineHeight: 18,
            }}
          >
            AI Prithvi đang phân tích ảnh Sentinel từ không gian.{"\n"}
            Quá trình này có thể mất 60–120 giây.
          </Text>
        </View>

        {/* Elapsed time */}
        <View
          style={{
            backgroundColor: "#F3E8FF",
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Ionicons name="time-outline" size={14} color="#A855F7" />
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: "#7C3AED",
            }}
          >
            {elapsedSeconds}s đã trôi qua
          </Text>
        </View>

        {/* Steps indicator */}
        <View style={{ gap: 8, width: "100%" }}>
          {[
            {
              label: "Tải ảnh từ vệ tinh Copernicus",
              done: elapsedSeconds >= 5,
            },
            { label: "Chạy mô hình Prithvi ViT", done: elapsedSeconds >= 30 },
            {
              label: "Lọc địa hình & nước thường trú",
              done: elapsedSeconds >= 60,
            },
            { label: "Xuất GeoJSON & thumbnail", done: elapsedSeconds >= 80 },
          ].map((step, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: step.done
                    ? "#A855F7"
                    : "#E9D5FF",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {step.done ? (
                  <Ionicons name="checkmark" size={11} color="#FFFFFF" />
                ) : (
                  <ActivityIndicator size="small" color="#A855F7" />
                )}
              </View>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: step.done ? "700" : "500",
                  color: step.done ? ("#7C3AED") : muted,
                  flex: 1,
                }}
              >
                {step.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </MotiView>
  );

  // ── Error UI ──
  const renderError = () => (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 20 }}
    >
      <View
        style={{
          backgroundColor: "#FFF1F2",
          borderRadius: 16,
          padding: 20,
          alignItems: "center",
          gap: 12,
          borderWidth: 1,
          borderColor: "#EF444430",
        }}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 20,
            backgroundColor: "#FEE2E2",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="alert-circle-outline" size={28} color="#EF4444" />
        </View>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "800",
            color: "#EF4444",
            textAlign: "center",
          }}
        >
          Phân tích thất bại
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: "#B91C1C",
            textAlign: "center",
            lineHeight: 18,
          }}
        >
          {error}
        </Text>
        <TouchableOpacity
          onPress={reset}
          style={{
            backgroundColor: "#EF4444",
            borderRadius: 12,
            paddingHorizontal: 24,
            paddingVertical: 10,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Ionicons name="refresh" size={14} color="#FFFFFF" />
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#FFFFFF" }}>
            Thử lại
          </Text>
        </TouchableOpacity>
      </View>
    </MotiView>
  );

  // ── Success UI ──
  const renderSuccess = (result: SatelliteAnalysisResponse) => {
    if (result.status === "no_flood_detected") {
      return (
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 14 }}
        >
          <View
            style={{
              backgroundColor: "#ECFDF5",
              borderRadius: 16,
              padding: 24,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "#D1FAE5",
              gap: 12,
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: "#D1FAE5",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="leaf-outline" size={28} color="#10B981" />
            </View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "800",
                color: text,
                textAlign: "center",
              }}
            >
              An toàn · Không phát hiện ngập lụt
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: muted,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              Dữ liệu vệ tinh mới nhất xác nhận không có bất thường về độ ẩm
              hoặc ngập úng tại khu vực này.
            </Text>

            <TouchableOpacity onPress={handleRun} style={{ marginTop: 8 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  backgroundColor: "#E2E8F0",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                }}
              >
                <Ionicons name="refresh-outline" size={14} color={muted} />
                <Text style={{ fontSize: 12, fontWeight: "600", color: muted }}>
                  Quét lại
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </MotiView>
      );
    }

    return (
      <MotiView
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 400 }}
      >
        <View style={{ gap: 14 }}>
          {/* Summary hero */}
          <LinearGradient
            colors={["#4C1D95", "#7C3AED", "#9333EA"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 20,
              padding: 18,
              shadowColor: "#7C3AED",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.35,
              shadowRadius: 16,
              elevation: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 14,
                gap: 10,
              }}
            >
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="planet" size={22} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 14, fontWeight: "900", color: "#FFFFFF" }}
                >
                  Kết quả Phân tích Vệ tinh
                </Text>
                {result.fusion_mode && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 5,
                      marginTop: 3,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "rgba(255,255,255,0.25)",
                        borderRadius: 6,
                        paddingHorizontal: 7,
                        paddingVertical: 2,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "800",
                          color: "#FFFFFF",
                        }}
                      >
                        FUSION MODE
                      </Text>
                    </View>
                    <Text
                      style={{ fontSize: 10, color: "rgba(255,255,255,0.8)" }}
                    >
                      {result.fusion_method?.split("(")[0].trim()}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Combined flood area */}
            <View style={{ alignItems: "center", marginBottom: 14 }}>
              <Text
                style={{ fontSize: 48, fontWeight: "900", color: "#FFFFFF" }}
              >
                {result.combined_water_area_km2.toFixed(2)}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: "rgba(255,255,255,0.8)",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                km² diện tích ngập lụt phát hiện
              </Text>
            </View>

            {/* Source badges */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {result.sources_used.map((src) => (
                <View
                  key={src}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <Ionicons
                    name={
                      src.includes("Sentinel-1")
                        ? "radio-outline"
                        : "eye-outline"
                    }
                    size={11}
                    color="#FFFFFF"
                  />
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "700",
                      color: "#FFFFFF",
                    }}
                  >
                    {src}
                  </Text>
                </View>
              ))}
            </View>
          </LinearGradient>

          {/* BBox info */}
          <View
            style={{
              backgroundColor: sub,
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: border,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Ionicons name="location-outline" size={16} color={muted} />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: text,
                  marginBottom: 2,
                }}
              >
                Vùng phân tích · {result.level}
              </Text>
              <Text style={{ fontSize: 10, color: muted }}>
                {result.bbox.min_lon.toFixed(4)}°E–
                {result.bbox.max_lon.toFixed(4)}°E,{" "}
                {result.bbox.min_lat.toFixed(4)}°N–
                {result.bbox.max_lat.toFixed(4)}°N
              </Text>
            </View>
            <View
              style={{
                backgroundColor: "#F1F5F9",
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: "700", color: muted }}>
                {result.bbox_source.split("_").join(" ")}
              </Text>
            </View>
          </View>

          {/* 🗺️ View on Map CTA */}
          {/* <TouchableOpacity
          onPress={() => {
            const layers = result.individual_results
              .filter((item) => item.result?.data?.geojson?.features?.length)
              .map((item) => ({
                id: `${item.platform}-${Date.now()}`,
                platform: item.platform,
                waterAreaKm2: item.result!.data.water_area_km2,
                geojson: item.result!.data.geojson,
                timestamp: item.result!.data.timestamp,
                color: item.platform === "Sentinel-1" ? "#8B5CF6" : "#0EA5E9",
              }));
              
            if (layers.length > 0) {
              useSatelliteFloodStore.getState().setLayers(layers as any, result.bbox);
            } else {
              useSatelliteFloodStore.getState().clear();
            }

            const b = result.bbox;
            const bboxStr = `${b.min_lon},${b.min_lat},${b.max_lon},${b.max_lat}`;
            router.push(`/(tabs)/map?satelliteBbox=${bboxStr}&returnToPrediction=${areaId}` as any);
            
            // Ensure the map layer is visible
            if (!mapLayerVisible) toggleVisible();
          }}
          activeOpacity={0.85}
          style={{ marginBottom: 4 }}
        >
          <LinearGradient
            colors={["#0F172A", "#1E293B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: 14,
              paddingVertical: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              borderWidth: 1,
              borderColor: "#475569",
            }}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                backgroundColor: "rgba(16,185,129,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="map" size={16} color="#10B981" />
            </View>
            <Text style={{ fontSize: 14, fontWeight: "800", color: "#FFFFFF" }}>
              Xem vùng ngập trên Bản đồ
            </Text>
            <View
              style={{
                backgroundColor: "rgba(16,185,129,0.15)",
                borderRadius: 6,
                paddingHorizontal: 7,
                paddingVertical: 2,
                borderWidth: 1,
                borderColor: "rgba(16,185,129,0.3)",
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "800", color: "#10B981" }}>
                LIVE
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity> */}

          {/* Individual platform results */}
          <View style={{ gap: 10 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: muted,
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              Kết quả từng nguồn vệ tinh
            </Text>
            {result.individual_results.map((item) => (
              <PlatformResultCard
                key={item.platform}
                item={item}
                bbox={result.bbox}
                areaGeometry={areaGeometry}
                onViewMap={() => {
                  if (item.result?.data?.geojson?.features?.length) {
                    const layer = {
                      id: `${item.platform}-${Date.now()}`,
                      platform: item.platform,
                      waterAreaKm2: item.result.data.water_area_km2,
                      geojson: item.result.data.geojson,
                      timestamp: item.result.data.timestamp,
                      color:
                        item.platform === "Sentinel-1" ? "#8B5CF6" : "#0EA5E9",
                    };
                    // Stage layers silently — map will commit (make visible) them
                    // only AFTER animateToRegion finishes to avoid JS thread lag.
                    useSatelliteFloodStore
                      .getState()
                      .setPendingLayers([layer as any], result.bbox, areaGeometry ?? null);
                  } else {
                    useSatelliteFloodStore.getState().clear();
                  }

                  const b = result.bbox;
                  const bboxStr = `${b.min_lon},${b.min_lat},${b.max_lon},${b.max_lat}`;
                  router.push(
                    `/(tabs)/map?satelliteBbox=${bboxStr}&returnToPrediction=${areaId}` as any,
                  );
                  if (!mapLayerVisible) toggleVisible();
                }}
              />
            ))}
          </View>

          {/* Reset / Re-run */}
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              onPress={reset}
              style={{
                flex: 1,
                backgroundColor: "#F1F5F9",
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 6,
                borderWidth: 1,
                borderColor: border,
              }}
            >
              <Ionicons name="arrow-back-outline" size={14} color={muted} />
              <Text style={{ fontSize: 13, fontWeight: "700", color: muted }}>
                Cài đặt lại
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleRun}
              style={{
                flex: 2,
                backgroundColor: "rgba(168,85,247,0.12)",
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 6,
                borderWidth: 1,
                borderColor: "#A855F740",
              }}
            >
              <Ionicons name="refresh-outline" size={14} color="#A855F7" />
              <Text
                style={{ fontSize: 13, fontWeight: "700", color: "#A855F7" }}
              >
                Phân tích lại
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </MotiView>
    );
  };

  // ─── Root card ───────────────────────────────────────────────────────────
  return (
    <View
      testID="prediction-satellite-card"
      className="bg-white dark:bg-slate-800 rounded-[20px]"
      style={{ padding: 16, ...SHADOW.md }}
    >
      {/* Header */}
      <View
        testID="prediction-satellite-header"
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 16,
          gap: 10,
        }}
      >
        <LinearGradient
          colors={["#7C3AED", "#A855F7"]}
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="planet-outline" size={20} color="#FFFFFF" />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "800",
              color: text,
              marginBottom: 1,
            }}
          >
            AI Satellite Verification
          </Text>
          <Text style={{ fontSize: 11, color: muted }}>
            Prithvi · Sentinel-1/2 · Flood Mapping
          </Text>
        </View>

        {isSuccess && (
          <TouchableOpacity
            onPress={toggleVisible}
            activeOpacity={0.7}
            style={{
              backgroundColor: mapLayerVisible
                ? "rgba(16,185,129,0.12)"
                : "rgba(100,116,139,0.12)",
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 4,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              borderWidth: 1,
              borderColor: mapLayerVisible
                ? "rgba(16,185,129,0.3)"
                : "rgba(100,116,139,0.3)",
            }}
          >
            <Ionicons
              name={mapLayerVisible ? "eye" : "eye-off"}
              size={11}
              color={mapLayerVisible ? "#10B981" : muted}
            />
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                color: mapLayerVisible ? "#10B981" : muted,
              }}
            >
              {mapLayerVisible ? "LIVE" : "ẨN"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Dynamic content */}
      <View testID={`prediction-satellite-content-${state}`}>
        {isIdle && renderIdle()}
        {isLoading && renderLoading()}
        {isError && renderError()}
        {isSuccess && data && renderSuccess(data)}
      </View>
    </View>
  );
}
