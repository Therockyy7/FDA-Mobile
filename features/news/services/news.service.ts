// features/news/services/news.service.ts
import { apiClient } from "~/lib/api-client";
import {
  MarkAllReadResponse,
  MarkReadResponse,
  NewsDetailResponse,
  NewsListResponse,
  NewsRequestParams,
} from "../types/news-types";

class NewsService {
  async getAnnouncements(params: NewsRequestParams): Promise<NewsListResponse> {
    const response = await apiClient.get<NewsListResponse>("/api/v1/announcements", {
      params,
    });
    return response.data;
  }

  async getAnnouncementDetail(id: string): Promise<NewsDetailResponse> {
    const response = await apiClient.get<NewsDetailResponse>(`/api/v1/announcements/${id}`);
    return response.data;
  }

  async markAsRead(id: string): Promise<MarkReadResponse> {
    const response = await apiClient.post<MarkReadResponse>(`/api/v1/announcements/${id}/read`);
    return response.data;
  }

  async markAllAsRead(): Promise<MarkAllReadResponse> {
    const response = await apiClient.post<MarkAllReadResponse>("/api/v1/announcements/read-all");
    return response.data;
  }
}

export const newsService = new NewsService();
