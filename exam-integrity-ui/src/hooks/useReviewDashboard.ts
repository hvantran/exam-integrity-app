/** FE-11: polls until no PENDING_ESSAY */
import { useQuery } from '@tanstack/react-query';
import { sessionService } from '../services/sessionService';

export function useReviewDashboard(sessionId: string) {
  return useQuery({
    queryKey: ['review', sessionId],
    queryFn: () => sessionService.getReviewDashboard(sessionId),
    enabled: !!sessionId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 2000;
      const hasPending = data.scores.some(s => s.status === 'PENDING_ESSAY');
      return hasPending ? 2000 : false;
    },
  });
}
