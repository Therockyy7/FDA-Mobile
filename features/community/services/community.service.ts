import { apiClient } from "~/lib/api-client";

export interface Media {
  id: string;
  mediaType: "photo" | "video";
  mediaUrl: string;
  thumbnailUrl: string | null;
  createdAt: string;
}

export interface FloodReport {
  id: string;
  reporterUserId: string;
  latitude: number;
  longitude: number;
  address: string;
  description: string;
  severity: "low" | "medium" | "high";
  trustScore: number;
  score: number;
  status: string;
  confidenceLevel: "low" | "medium" | "high";
  createdAt: string;
  media: Media[];
}

export interface CommunityReportsResponse {
  success: boolean;
  message: string;
  totalCount: number;
  items: FloodReport[];
}

export interface CommunityReportsParams {
  status?: string;
  severity?: string;
  minTrustScore?: number;
  from?: string;
  to?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface UserReportsResponse {
  success: boolean;
  message: string;
  totalCount: number;
  items: FloodReport[];
}

export interface UserInfo {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  status: string;
  createdAt: string;
}

export interface UserInfoResponse {
  success: boolean;
  message: string;
  user: UserInfo;
}

export interface FloodReportResponse {
  success: boolean;
  message: string;
  id: string;
  reporterUserId: string;
  latitude: number;
  longitude: number;
  address: string;
  description: string;
  severity: "low" | "medium" | "high";
  trustScore: number;
  status: string;
  confidenceLevel: "low" | "medium" | "high";
  priority: string;
  createdAt: string;
  updatedAt: string;
  media: Media[];
}

export interface CreateFloodReportResponse {
  success: boolean;
  message: string;
  id: string;
  score: number;
  status: string;
  createdAt: string;
  retryAfterSeconds?: number;
}

export interface CreateFloodReportParams {
  latitude: number;
  longitude: number;
  address?: string;
  description?: string;
  severity: "low" | "medium" | "high";
  photos?: { uri: string; type: string; name: string }[];
  videos?: { uri: string; type: string; name: string }[];
}

export const CommunityService = {
  async getCommunityReports(params: CommunityReportsParams = {}): Promise<CommunityReportsResponse> {
    const response = await apiClient.get<CommunityReportsResponse>(
      "/api/v1/flood-reports/community",
      {
        params: {
          status: "published",
          minTrustScore: 0,
          pageNumber: params.pageNumber ?? 1,
          pageSize: params.pageSize ?? 20,
          ...params,
        },
      }
    );
    return response.data;
  },

  async getFloodReportById(id: string): Promise<FloodReportResponse> {
    const response = await apiClient.get<FloodReportResponse>(
      `/api/v1/flood-reports/${id}`
    );
    return response.data;
  },

  async getUserInfo(userId: string): Promise<UserInfoResponse> {
    const response = await apiClient.get<UserInfoResponse>(
      `/api/v1/users/${userId}`
    );
    return response.data;
  },

  async getUserReports(userId: string): Promise<UserReportsResponse> {
    const response = await apiClient.get<UserReportsResponse>(
      `/api/v1/flood-reports/user/${userId}`
    );
    return response.data;
  },

  async createFloodReport(params: CreateFloodReportParams): Promise<CreateFloodReportResponse> {
    const formData = new FormData();

    formData.append("latitude", params.latitude.toString());
    formData.append("longitude", params.longitude.toString());
    formData.append("severity", params.severity);

    if (params.address) {
      formData.append("address", params.address);
    }
    if (params.description) {
      formData.append("description", params.description);
    }

    // Append photos
    if (params.photos) {
      params.photos.forEach((photo) => {
        formData.append("photos", {
          uri: photo.uri,
          type: photo.type,
          name: photo.name,
        } as any);
      });
    }

    // Append videos
    if (params.videos) {
      params.videos.forEach((video) => {
        formData.append("videos", {
          uri: video.uri,
          type: video.type,
          name: video.name,
        } as any);
      });
    }

    // Let axios auto-set Content-Type with boundary for FormData
    const response = await apiClient.post<CreateFloodReportResponse>(
      "/api/v1/flood-reports",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        transformRequest: (data) => data,
      }
    );
    return response.data;
  },
};
