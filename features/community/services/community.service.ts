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

export interface UpdateFloodReportParams {
  address?: string;
  description?: string;
  severity?: "low" | "medium" | "high";
  mediaFilesToAdd?: { uri: string; type: string; name: string }[];
  mediaToDelete?: string[];
}

export interface DeleteFloodReportResponse {
  success: boolean;
  message: string;
}

export interface VoteFloodReportResponse {
  success: boolean;
  message: string;
  newScore: number;
  userVote: number;
}

export type VoteType = 1 | -1;

export interface NearbyFloodReportsParams {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  hours: number;
}

export interface NearbyFloodReport {
  id: string;
  latitude: number;
  longitude: number;
  severity: "low" | "medium" | "high";
  createdAt: string;
  distanceMeters: number;
}

export interface NearbyFloodReportsResponse {
  success: boolean;
  message: string;
  count: number;
  consensusLevel: string;
  consensusMessage: string;
  reports: NearbyFloodReport[];
}

export const CommunityService = {
  async getNearbyFloodReports(params: NearbyFloodReportsParams): Promise<NearbyFloodReportsResponse> {
    const response = await apiClient.post<NearbyFloodReportsResponse>(
      "/api/v1/flood-reports/nearby",
      params
    );
    return response.data;
  },

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

  async updateFloodReport(id: string, params: UpdateFloodReportParams): Promise<CreateFloodReportResponse> {
    const formData = new FormData();

    if (params.address !== undefined) {
      formData.append("address", params.address);
    }
    if (params.description !== undefined) {
      formData.append("description", params.description);
    }
    if (params.severity !== undefined) {
      formData.append("severity", params.severity);
    }

    // Append new media files
    if (params.mediaFilesToAdd) {
      params.mediaFilesToAdd.forEach((media) => {
        formData.append("mediaFilesToAdd", {
          uri: media.uri,
          type: media.type,
          name: media.name,
        } as any);
      });
    }

    // Append media IDs to delete
    if (params.mediaToDelete) {
      params.mediaToDelete.forEach((mediaId) => {
        formData.append("mediaToDelete", mediaId);
      });
    }

    const response = await apiClient.put<CreateFloodReportResponse>(
      `/api/v1/flood-reports/${id}`,
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

  async deleteFloodReport(id: string): Promise<DeleteFloodReportResponse> {
    const response = await apiClient.delete<DeleteFloodReportResponse>(
      `/api/v1/flood-reports/${id}`
    );
    return response.data;
  },

  async voteFloodReport(id: string, voteType: VoteType): Promise<VoteFloodReportResponse> {
    try {
      const response = await apiClient.post<VoteFloodReportResponse>(
        `/api/v1/flood-reports/${id}/vote`,
        { voteType }
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.error("API response error:", JSON.stringify(error.response.data, null, 2));
      } else {
        console.error("API request error:", error.message);
      }
      throw error;
    }
  },

  async createFloodReport(
    params: CreateFloodReportParams,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<CreateFloodReportResponse> {
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
        timeout: 300000, // 5 minutes timeout for large media uploads
        onUploadProgress,
        transformRequest: (data) => data,
      }
    );
    return response.data;
  },
};
