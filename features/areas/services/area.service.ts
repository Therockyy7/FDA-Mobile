// features/areas/services/area.service.ts
import type {
  FloodDataPoint,
  FloodHistoryData,
  FloodHistoryResponse,
  FloodSeverity,
  FloodStatisticsData,
  FloodStatisticsResponse,
  FloodTrendDataPoint,
  FloodTrendsData,
  FloodTrendsResponse,
} from "~/features/areas/types/flood-history.types";
import type {
  Area,
  AreaStatusResponse,
} from "~/features/map/types/map-layers.types";
import { apiClient } from "~/lib/api-client";

export const AreaService = {
  // FeatG33: Get all user's monitored areas
  getAreas: async (): Promise<Area[]> => {
    try {
      const res = await apiClient.get<{
        success: boolean;
        message: string;
        areas: Area[];
        totalCount: number;
      }>("/api/v1/areas/me?pageNumber=1&pageSize=100");

      console.log(`🗺️ Loaded ${res.data.areas.length} areas`);
      return res.data.areas;
    } catch (error) {
      console.error("❌ Failed to fetch areas:", error);
      throw error;
    }
  },

  // FeatG34: Get area flood status
  getAreaStatus: async (areaId: string): Promise<AreaStatusResponse> => {
    try {
      const res = await apiClient.get<{
        success: boolean;
        message: string;
        data: AreaStatusResponse;
      }>(`/api/v1/area/areas/${areaId}/status`);

      return res.data.data;
    } catch (error) {
      console.error(`❌ Failed to fetch status for area ${areaId}:`, error);
      return {
        areaId,
        status: "Unknown",
        severityLevel: 0,
        summary: "Không thể lấy thông tin trạng thái",
        contributingStations: [],
        evaluatedAt: new Date().toISOString(),
      };
    }
  },

  // FeatG35: Get area by ID
  getAreaById: async (id: string): Promise<Area> => {
    try {
      const res = await apiClient.get<{
        success: boolean;
        message: string;
        statusCode: number;
        area?: Area;
        data?: Area;
      }>(`/api/v1/areas/${id}`);

      const data = res.data;
      const area = data.area || data.data;

      if (!area) {
        console.error(
          "❌ Unexpected response structure:",
          JSON.stringify(data, null, 2),
        );
        throw new Error("Area data not found in response");
      }

      console.log("📍 Area fetched:", area.name);
      return area;
    } catch (error: any) {
      console.error(`❌ Failed to fetch area ${id}:`, error?.message);
      throw error;
    }
  },

  // FeatG36: Update area
  updateArea: async (
    id: string,
    request: {
      name: string;
      latitude?: number;
      longitude?: number;
      radiusMeters?: number;
      addressText?: string;
    },
  ): Promise<Area> => {
    try {
      console.log("📝 Updating area:", id, request);

      const res = await apiClient.put<{
        success: boolean;
        message: string;
        statusCode: number;
        data: Area;
      }>(`/api/v1/areas/${id}`, request);

      console.log("✅ Area updated successfully");
      return res.data.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Update failed";
      console.error(`❌ Failed to update area ${id}:`, errorMessage);
      throw new Error(errorMessage);
    }
  },

  // FeatG37: Delete area
  deleteArea: async (id: string): Promise<void> => {
    try {
      console.log("🗑️ Deleting area:", id);

      await apiClient.delete<{
        success: boolean;
        message: string;
        statusCode: number;
      }>(`/api/v1/areas/${id}`);

      console.log("✅ Area deleted successfully");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Delete failed";
      console.error(`❌ Failed to delete area ${id}:`, errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Create area
  createArea: async (request: {
    name: string;
    latitude: number;
    longitude: number;
    radiusMeters: number;
    addressText?: string;
  }): Promise<Area> => {
    try {
      console.log(
        "📤 Creating area with request:",
        JSON.stringify(request, null, 2),
      );

      const res = await apiClient.post<{
        success: boolean;
        message: string;
        statusCode: number;
        data: Area;
      }>("/api/v1/areas/area", request);

      console.log("✅ Area created successfully:", res.data.data.id);
      return res.data.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.errors ||
        error?.message ||
        "Unknown error";
      const statusCode = error?.response?.status || "N/A";

      console.error("❌ Failed to create area:");
      console.error("   Status:", statusCode);
      console.error("   Message:", JSON.stringify(errorMessage));

      const enhancedError = new Error(
        typeof errorMessage === "string"
          ? errorMessage
          : `Server error (${statusCode})`,
      );
      (enhancedError as any).statusCode = statusCode;
      throw enhancedError;
    }
  },

  // FeatG39: Get Flood History
  getFloodHistory: async (params: {
    stationId?: string;
    stationIds?: string[]; // Array of station IDs for Area context
    areaId?: string;
    startDate?: string;
    endDate?: string;
    granularity?: "raw" | "hourly" | "daily";
    limit?: number;
  }): Promise<FloodHistoryData> => {
    try {
      // Build query string manually to avoid URL encoding of dates
      const queryParts: string[] = [];
      if (params.stationId) queryParts.push(`stationId=${params.stationId}`);
      // Add multiple stationIds for Area context
      if (params.stationIds && params.stationIds.length > 0) {
        params.stationIds.forEach((id) => {
          queryParts.push(`stationIds=${id}`);
        });
      }
      if (params.areaId) queryParts.push(`areaId=${params.areaId}`);
      if (params.startDate) queryParts.push(`startDate=${params.startDate}`);
      if (params.endDate) queryParts.push(`endDate=${params.endDate}`);
      if (params.granularity)
        queryParts.push(`granularity=${params.granularity}`);
      if (params.limit) queryParts.push(`limit=${params.limit}`);

      const url = `/api/v1/flood-history?${queryParts.join("&")}`;
      console.log("📊 Fetching flood history:", url);

      const res = await apiClient.get<FloodHistoryResponse>(url);
      return res.data.data;
    } catch {
      console.warn("⚠️ Flood history API unavailable, using mock data");
      return generateMockFloodHistory(params);
    }
  },

  // FeatG40: Get Flood Trends
  getFloodTrends: async (params: {
    stationId?: string;
    areaId?: string;
    period?:
      | "last7days"
      | "last30days"
      | "last90days"
      | "last365days"
      | "custom";
    startDate?: string;
    endDate?: string;
    granularity?: "daily" | "weekly" | "monthly";
    compareWithPrevious?: boolean;
  }): Promise<FloodTrendsData> => {
    try {
      // Build query string manually to avoid URL encoding of dates
      const queryParts: string[] = [];
      if (params.stationId) queryParts.push(`stationId=${params.stationId}`);
      if (params.areaId) queryParts.push(`areaId=${params.areaId}`);
      if (params.period) queryParts.push(`period=${params.period}`);
      // Include startDate/endDate when period is custom
      if (params.startDate) queryParts.push(`startDate=${params.startDate}`);
      if (params.endDate) queryParts.push(`endDate=${params.endDate}`);
      if (params.granularity)
        queryParts.push(`granularity=${params.granularity}`);
      if (params.compareWithPrevious !== undefined) {
        queryParts.push(`compareWithPrevious=${params.compareWithPrevious}`);
      }

      const url = `/api/v1/flood-trends?${queryParts.join("&")}`;
      console.log("📈 Fetching flood trends:", url);

      const res = await apiClient.get<FloodTrendsResponse>(url);
      return res.data.data;
    } catch {
      console.warn("⚠️ Flood trends API unavailable, using mock data");
      return generateMockFloodTrends(params);
    }
  },

  // FeatG41: Get Flood Statistics
  getFloodStatistics: async (params: {
    stationId?: string;
    stationIds?: string[]; // Array of station IDs for Area context
    areaId?: string;
    period?: "last7days" | "last30days" | "last90days";
    includeBreakdown?: boolean;
    includeComparison?: boolean;
  }): Promise<FloodStatisticsData> => {
    try {
      // Build query string manually
      const queryParts: string[] = [];
      if (params.stationId) queryParts.push(`stationId=${params.stationId}`);
      // Add multiple stationIds for Area context
      if (params.stationIds && params.stationIds.length > 0) {
        params.stationIds.forEach((id) => {
          queryParts.push(`stationIds=${id}`);
        });
      }
      if (params.areaId) queryParts.push(`areaId=${params.areaId}`);
      if (params.period) queryParts.push(`period=${params.period}`);
      if (params.includeBreakdown !== undefined) {
        queryParts.push(`includeBreakdown=${params.includeBreakdown}`);
      }
      if (params.includeComparison !== undefined) {
        queryParts.push(`includeComparison=${params.includeComparison}`);
      }

      const url = `/api/v1/flood-statistics?${queryParts.join("&")}`;
      console.log("📉 Fetching flood statistics:", url);

      const res = await apiClient.get<FloodStatisticsResponse>(url);
      return res.data.data;
    } catch {
      console.warn("⚠️ Flood statistics API unavailable, using mock data");
      return generateMockFloodStatistics(params);
    }
  },
};

// ==================== MOCK DATA GENERATORS ====================

function generateMockFloodHistory(params: {
  granularity?: string;
}): FloodHistoryData {
  const now = new Date();
  const dataPoints: FloodDataPoint[] = [];
  const isHourly =
    params.granularity === "hourly" || params.granularity === "raw";
  const count = isHourly ? 24 : 30;

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now);
    if (isHourly) {
      timestamp.setHours(now.getHours() - i);
    } else {
      timestamp.setDate(now.getDate() - i);
    }

    const baseLevel = 0.8 + Math.random() * 1.5;
    const value = Math.round(baseLevel * 100) / 100;

    let severity: FloodSeverity = "safe";
    if (value > 2.5) severity = "critical";
    else if (value > 2.0) severity = "warning";
    else if (value > 1.5) severity = "caution";

    dataPoints.push({
      timestamp: timestamp.toISOString(),
      value: value * 100, // in cm
      valueMeters: value,
      qualityFlag: "ok",
      severity,
    });
  }

  return {
    stationId: "mock-station-001",
    stationName: "Trạm đo mực nước",
    stationCode: "ST_MOCK_01",
    dataPoints,
    metadata: {
      startDate: dataPoints[0]?.timestamp || now.toISOString(),
      endDate:
        dataPoints[dataPoints.length - 1]?.timestamp || now.toISOString(),
      granularity: params.granularity || "hourly",
      totalDataPoints: dataPoints.length,
      missingIntervals: 0,
      lastUpdated: now.toISOString(),
    },
  };
}

function generateMockFloodTrends(params: {
  stationId?: string;
  areaId?: string;
  period?: string;
}): FloodTrendsData {
  const now = new Date();
  const dataPoints: FloodTrendDataPoint[] = [];
  const days =
    params.period === "last7days"
      ? 7
      : params.period === "last90days"
        ? 90
        : 30;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);

    const maxLevel = 1.0 + Math.random() * 2.0;
    const minLevel = 0.3 + Math.random() * 0.5;
    const avgLevel = (maxLevel + minLevel) / 2;
    const floodHours = maxLevel > 2.0 ? Math.floor(Math.random() * 6) : 0;

    let peakSeverity: FloodSeverity = "safe";
    if (maxLevel > 2.5) peakSeverity = "critical";
    else if (maxLevel > 2.0) peakSeverity = "warning";
    else if (maxLevel > 1.5) peakSeverity = "caution";

    dataPoints.push({
      period: date.toISOString().split("T")[0],
      periodStart: new Date(date.setHours(0, 0, 0, 0)).toISOString(),
      periodEnd: new Date(date.setHours(23, 59, 59, 999)).toISOString(),
      maxLevel: Math.round(maxLevel * 100) / 100,
      minLevel: Math.round(minLevel * 100) / 100,
      avgLevel: Math.round(avgLevel * 100) / 100,
      readingCount: 288,
      floodHours,
      rainfallTotal: Math.round(Math.random() * 50 * 10) / 10,
      peakSeverity,
    });
  }

  const totalFloodHours = dataPoints.reduce((sum, p) => sum + p.floodHours, 0);
  const avgWaterLevel =
    dataPoints.reduce((sum, p) => sum + p.avgLevel, 0) / dataPoints.length;
  const maxWaterLevel = Math.max(...dataPoints.map((p) => p.maxLevel));

  return {
    stationId: params.stationId || params.areaId || "mock-station-001",
    stationName: "Trạm đo mực nước",
    period: params.period || "last30days",
    granularity: "daily",
    dataPoints,
    comparison: {
      previousPeriodStart: new Date(
        now.getTime() - days * 2 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      previousPeriodEnd: new Date(
        now.getTime() - days * 24 * 60 * 60 * 1000,
      ).toISOString(),
      avgLevelChange: Math.round((Math.random() - 0.5) * 40),
      floodHoursChange: Math.round((Math.random() - 0.5) * 60),
      peakLevelChange: Math.round((Math.random() - 0.5) * 30),
    },
    summary: {
      totalFloodHours,
      avgWaterLevel: Math.round(avgWaterLevel * 100) / 100,
      maxWaterLevel: Math.round(maxWaterLevel * 100) / 100,
      daysWithFlooding: dataPoints.filter((p) => p.floodHours > 0).length,
      mostAffectedDay: dataPoints.find((p) => p.maxLevel === maxWaterLevel)
        ?.period,
    },
  };
}

function generateMockFloodStatistics(params: {
  stationId?: string;
  period?: string;
}): FloodStatisticsData {
  const now = new Date();
  const days =
    params.period === "last7days"
      ? 7
      : params.period === "last90days"
        ? 90
        : 30;

  return {
    stationId: params.stationId || "mock-station-001",
    stationName: "Trạm đo mực nước",
    stationCode: "ST_MOCK_01",
    periodStart: new Date(
      now.getTime() - days * 24 * 60 * 60 * 1000,
    ).toISOString(),
    periodEnd: now.toISOString(),
    summary: {
      maxWaterLevel: 2.5 + Math.random() * 0.5,
      minWaterLevel: 0.3 + Math.random() * 0.2,
      avgWaterLevel: 1.2 + Math.random() * 0.3,
      totalFloodHours: Math.floor(Math.random() * 50) + 10,
      totalReadings: days * 288,
      missingIntervals: Math.floor(Math.random() * 5),
    },
    severityBreakdown: {
      hoursSafe: Math.floor(days * 20),
      hoursCaution: Math.floor(days * 2.5),
      hoursWarning: Math.floor(days * 1.2),
      hoursCritical: Math.floor(days * 0.3),
    },
    comparison: {
      avgLevelChange: Math.round((Math.random() - 0.5) * 30),
      floodHoursChange: Math.round((Math.random() - 0.5) * 50),
    },
    dataQuality: {
      completeness: 99.5 + Math.random() * 0.5,
      missingIntervals: [],
    },
  };
}
