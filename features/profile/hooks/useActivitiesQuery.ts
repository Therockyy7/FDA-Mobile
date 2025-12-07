import { useQuery } from '@tanstack/react-query';
import { ActivityService } from '../services/activity.service';

const ACTIVITIES_QUERY_KEY = 'activities';

export function useActivitiesQuery(limit: number = 10) {
  return useQuery({
    queryKey: [ACTIVITIES_QUERY_KEY, limit],
    queryFn: () => ActivityService.getRecentActivities(limit),
    select: (data) => data.data || [],
  });
}