// features/news/hooks/useNewsfeed.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import { newsService } from "../services/news.service";
import { NewsListResponse, NewsRequestParams } from "../types/news-types";

export const useNewsfeed = (
  params?: Omit<NewsRequestParams, "page" | "pageSize">
) => {
  return useInfiniteQuery<NewsListResponse, Error>({
    queryKey: ["news", "list", params],
    queryFn: ({ pageParam = 1 }) =>
      newsService.getAnnouncements({
        ...(params || {}),
        page: pageParam as number,
        pageSize: 10,
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};
