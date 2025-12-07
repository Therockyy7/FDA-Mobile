import { useQuery } from '@tanstack/react-query';
import { NotesService } from '../../notes/services/notes.service';

export function useUserStatsQuery() {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: () => NotesService.getUserStats(),
    select: (data) => data.data,
  });
}