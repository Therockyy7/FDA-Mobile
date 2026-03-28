// features/map/lib/post-adapter.ts
// Transforms community report API response into PostCard-compatible format.

export interface PostMock {
  author: {
    id: string;
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  images: string[];
  videos: string[];
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  content: string;
  location: string;
  [key: string]: unknown;
}

export function getPostMock(fullReport: any): PostMock {
  return {
    ...fullReport,
    author: {
      id: fullReport.reporterUserId,
      name: "Người dùng FDA",
      avatar:
        "https://minervastrategies.com/wp-content/uploads/2016/03/default-avatar.jpg",
      isVerified: false,
    },
    images:
      fullReport.media
        ?.filter((m: any) => m.mediaType === "photo")
        .map((m: any) => m.mediaUrl) || [],
    videos:
      fullReport.media
        ?.filter((m: any) => m.mediaType === "video")
        .map((m: any) => m.mediaUrl) || [],
    likes: fullReport.score || 0,
    comments: 0,
    shares: 0,
    isLiked: false,
    content: fullReport.description,
    location: fullReport.address,
  };
}
