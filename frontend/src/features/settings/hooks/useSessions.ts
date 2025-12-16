import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../api/settingsService';
import type { ActiveSessionResponse } from '@/api-client';
import { toast } from 'sonner';

const SESSIONS_QUERY_KEY = ['activeSessions'];

export const useSessions = () => {
    const queryClient = useQueryClient();

    const sessionsQuery = useQuery<ActiveSessionResponse[]>({
        queryKey: SESSIONS_QUERY_KEY,
        queryFn: settingsService.getActiveSessions,
    });

    const revokeSessionMutation = useMutation({
        mutationFn: (sessionId: number) => settingsService.revokeSession(sessionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
            toast.success('Session revoked successfully');
        },
        onError: () => {
            toast.error('Failed to revoke session');
        },
    });

    const revokeAllOtherMutation = useMutation({
        mutationFn: settingsService.revokeAllOtherSessions,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
            toast.success('All other sessions revoked');
        },
        onError: () => {
            toast.error('Failed to revoke sessions');
        },
    });

    return {
        sessions: sessionsQuery.data ?? [],
        isLoading: sessionsQuery.isLoading,
        revokeSession: revokeSessionMutation.mutate,
        revokeAllOtherSessions: revokeAllOtherMutation.mutate,
        isRevoking: revokeSessionMutation.isPending || revokeAllOtherMutation.isPending,
    };
};
