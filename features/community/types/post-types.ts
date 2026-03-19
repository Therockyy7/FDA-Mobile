// features/community/types/post-types.ts
export type Media = {
  id: string;
  mediaType: "photo" | "video";
  mediaUrl: string;
  thumbnailUrl: string | null;
  createdAt: string;
};

export type Post = {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  createdAt: string;
  content: string;
  imageUrl?: string;
  locationName?: string;
  waterLevelStatus?: "safe" | "warning" | "danger";
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLikedByMe?: boolean;
  // API response fields
  reporterUserId?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  severity?: "low" | "medium" | "high";
  trustScore?: number;
  score?: number;
  status?: string;
  confidenceLevel?: "low" | "medium" | "high";
  media?: Media[];
};

// Transform API response to Post format
export function transformFloodReportToPost(report: {
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
}): Post {
  // Map severity to waterLevelStatus
  const severityToStatus: Record<string, "safe" | "warning" | "danger"> = {
    low: "safe",
    medium: "warning",
    high: "danger",
  };

  // Get first media (image or video)
  const firstMedia = report.media?.[0];
  const imageUrl = firstMedia?.mediaType === "photo" ? firstMedia.mediaUrl : undefined;
  const hasVideo = report.media?.some((m) => m.mediaType === "video");

  // Format createdAt to relative time
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  return {
    id: report.id,
    authorId: report.reporterUserId,
    authorName: "Người dùng ẩn danh", // API doesn't provide author name
    createdAt: formatRelativeTime(report.createdAt),
    content: report.description,
    imageUrl: imageUrl,
    locationName: report.address,
    waterLevelStatus: severityToStatus[report.severity] || "warning",
    likesCount: report.score || 0,
    commentsCount: 0, // Not available in API
    sharesCount: hasVideo ? 1 : 0, // Use as indicator for video
    isLikedByMe: false,
    // Additional fields
    reporterUserId: report.reporterUserId,
    latitude: report.latitude,
    longitude: report.longitude,
    address: report.address,
    severity: report.severity,
    trustScore: report.trustScore,
    score: report.score,
    status: report.status,
    confidenceLevel: report.confidenceLevel,
    media: report.media,
  };
}
