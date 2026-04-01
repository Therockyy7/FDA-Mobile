// features/news/hooks/useMarkNewsRead.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { newsService } from "../services/news.service";

export const useMarkNewsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => newsService.markAsRead(id),
    onSuccess: (_, id) => {
      // Refresh the news list to update the badge
      // Alternatively, we could update the cache manually
      queryClient.invalidateQueries({ queryKey: ["news", "list"] });
      // Update detail if cached
      queryClient.invalidateQueries({ queryKey: ["news", "detail", id] });
    },
  });
};

export const useMarkAllNewsRead = () => {
  const queryClient = useQueryClient();

  // Optimistic update could be done, but invalidating is safer
  return useMutation({
    mutationFn: () => newsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news", "list"] });
    },
  });
};
