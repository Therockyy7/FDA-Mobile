// features/community/types.ts
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
};
