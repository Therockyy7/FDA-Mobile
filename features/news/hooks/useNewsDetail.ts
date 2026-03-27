// features/news/hooks/useNewsDetail.ts
import { useQuery } from "@tanstack/react-query";
import { newsService } from "../services/news.service";
import { NewsDetailResponse } from "../types/news-types";

export const useNewsDetail = (id: string, enabled: boolean = true) => {
  return useQuery<NewsDetailResponse, Error>({
    queryKey: ["news", "detail", id],
    queryFn: () => newsService.getAnnouncementDetail(id),
    enabled: enabled && !!id,
  });
};
