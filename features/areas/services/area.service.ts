// features/areas/services/area.service.ts
import {
  AdminAreaParams,
  AdminAreaResponse,
} from "~/features/areas/types/admin-area.types";
import type {
  FloodHistoryData,
  FloodHistoryResponse,
  FloodStatisticsData,
  FloodStatisticsResponse,
  FloodTrendsData,
  FloodTrendsResponse,
} from "~/features/areas/types/flood-history.types";
import type {
  Area,
  AreaStatusResponse,
  AreaWithStatus,
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

      // console.log(`🗺️ Loaded ${res.data.areas.length} areas`);
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
  // FE-10A: Single batch call replacing N+1 pattern
  getAreasWithStatus: async (): Promise<AreaWithStatus[]> => {
    try {
      const res = await apiClient.get<{
        success: boolean;
        message: string;
        data: AreaWithStatus[];
      }>("/api/v1/areas/me/status");
      return res.data.data;
    } catch (error) {
      console.error("❌ Failed to fetch areas with status:", error);
      throw error;
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

      // console.log("📍 Area fetched:", area.name);
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
      // console.log("📝 Updating area:", id, request);

      const res = await apiClient.put<{
        success: boolean;
        message: string;
        statusCode: number;
        data: Area;
      }>(`/api/v1/areas/${id}`, request);

      // console.log("✅ Area updated successfully");
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
      // console.log("🗑️ Deleting area:", id);

      await apiClient.delete<{
        success: boolean;
        message: string;
        statusCode: number;
      }>(`/api/v1/areas/${id}`);

      // console.log("✅ Area deleted successfully");
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
      // console.log(
      //   "📤 Creating area with request:",
      //   JSON.stringify(request, null, 2),
      // );

      const res = await apiClient.post<{
        success: boolean;
        message: string;
        statusCode: number;
        data: Area;
      }>("/api/v1/areas/area", request);

      // console.log("✅ Area created successfully:", res.data.data.id);
      return res.data.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.errors ||
        error?.message ||
        "Unknown error";
      const statusCode = error?.response?.status || "N/A";

      // console.error("❌ Failed to create area:");
      // console.error("   Status:", statusCode);
      // console.error("   Message:", JSON.stringify(errorMessage));

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

      const res = await apiClient.get<FloodHistoryResponse>(url);
      return res.data.data;
      // return generateMockFloodHistory(params);
    } catch (error) {
      console.error("❌ Flood history API error:", error);
      throw error;
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
      // console.log("📈 Fetching flood trends:", url);

      const res = await apiClient.get<FloodTrendsResponse>(url);
      return res.data.data;
      // return generateMockFloodTrends(params);
    } catch (error) {
      console.error("❌ Flood trends API error:", error);
      throw error;
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
      // console.log("📉 Fetching flood statistics:", url);

      const res = await apiClient.get<FloodStatisticsResponse>(url);
      return res.data.data;
    } catch (error) {
      console.error("❌ Flood statistics API error:", error);
      throw error;
    }
  },
  // Feat: Get Administrative Area Status (for severity comparison)
  getAdministrativeAreaStatus: async (areaId: string): Promise<{
    administrativeAreaId: string;
    status: "Safe" | "Warning" | "Critical";
    severityLevel: number;
    summary: string;
    evaluatedAt: string;
    administrativeArea: {
      id: string;
      name: string;
      level: string;
      code: string;
    };
  }> => {
    const res = await apiClient.get<{
      success: boolean;
      message: string;
      data: {
        administrativeAreaId: string;
        status: "Safe" | "Warning" | "Critical";
        severityLevel: number;
        summary: string;
        evaluatedAt: string;
        administrativeArea: {
          id: string;
          name: string;
          level: string;
          code: string;
        };
      };
    }>(`/api/v1/administrative-areas/${areaId}/status`);
    return res.data.data;
  },

  // Feat: Get Admin Areas
  getAdminAreas: async (
    params: AdminAreaParams = {},
  ): Promise<AdminAreaResponse> => {
    try {
      const { searchTerm, parentId, pageNumber = 1, pageSize = 100 } = params;

      const queryParts: string[] = [];
      // Always set level to ward
      queryParts.push(`level=ward`);
      if (searchTerm)
        queryParts.push(`searchTerm=${encodeURIComponent(searchTerm)}`);
      if (parentId) queryParts.push(`parentId=${parentId}`);
      queryParts.push(`pageNumber=${pageNumber}`);
      queryParts.push(`pageSize=${pageSize}`);

      const url = `/api/v1/admin/administrative-areas?${queryParts.join("&")}`;
      // console.log("🏛️ Fetching admin areas:", url);

      const res = await apiClient.get<AdminAreaResponse>(url);
      return res.data;
    } catch (error) {
      console.error("❌ Failed to fetch admin areas:", error);
      throw error;
    }
  },
};
