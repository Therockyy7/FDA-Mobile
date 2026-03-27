// features/news/types/news-types.ts

export type NewsPriority = "low" | "normal" | "high" | "urgent";

export interface AnnouncementItem {
  id: string;
  title: string;
  summary: string;
  imageUrl?: string;
  priority: NewsPriority;
  publishedAt: string; // ISO 8601
  viewCount: number;
  isRead: boolean | null;
}

export interface AnnouncementDetail extends AnnouncementItem {
  content: string; // HTML string
  attachments?: string; // JSON string array of URLs
  createdAt: string; // ISO 8601
  authorName: string;
  deliveryCount: number;
  readCount: number;
}

export interface NewsRequestParams {
  priority?: NewsPriority;
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
  search?: string;
  page: number;
  pageSize: number;
}

export interface NewsListResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: AnnouncementItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface NewsDetailResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: AnnouncementDetail;
}

export interface MarkAllReadResponse {
  success: boolean;
  message: string;
  statusCode: number;
  markedCount: number;
}

export interface MarkReadResponse {
  success: boolean;
  message: string;
  statusCode: number;
}
