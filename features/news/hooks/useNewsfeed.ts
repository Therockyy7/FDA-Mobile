// features/news/hooks/useNewsfeed.ts
import { useQuery } from "@tanstack/react-query";
import { newsService } from "../services/news.service";
import { NewsListResponse, NewsRequestParams } from "../types/news-types";

export const useNewsfeed = (
  params?: NewsRequestParams
) => {
  return useQuery<NewsListResponse, Error>({
    queryKey: ["news", "list", params],
    queryFn: () =>
      newsService.getAnnouncements({
        ...(params || {}),
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
      }),
  });
};
