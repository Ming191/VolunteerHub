import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../api/settingsService';
import type { UpdateUserSettingsRequest, UserSettingsResponse } from '@/api-client';
import { toast } from 'sonner';
import { useState, useCallback } from 'react';

const SETTINGS_QUERY_KEY = ['userSettings'];

export const useSettings = () => {
    const queryClient = useQueryClient();
    const [pendingUpdates, setPendingUpdates] = useState<UpdateUserSettingsRequest>({});
    const [hasChanges, setHasChanges] = useState(false);

    const settingsQuery = useQuery<UserSettingsResponse>({
        queryKey: SETTINGS_QUERY_KEY,
        queryFn: settingsService.getSettings,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const updateMutation = useMutation({
        mutationFn: (request: UpdateUserSettingsRequest) =>
            settingsService.updateSettings(request),
        onSuccess: (data) => {
            queryClient.setQueryData(SETTINGS_QUERY_KEY, data);
            setPendingUpdates({});
            setHasChanges(false);
            toast.success('Settings saved successfully');
        },
        onError: (error: any) => {
            // Refetch on error to get latest state
            queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });

            const errorMessage = error?.response?.data?.message || 'Failed to save settings';
            toast.error(errorMessage);
        },
    });

    const updateSettings = useCallback((
        field: keyof UpdateUserSettingsRequest,
        value: UpdateUserSettingsRequest[keyof UpdateUserSettingsRequest]
    ) => {
        // Optimistically update UI
        queryClient.setQueryData<UserSettingsResponse>(SETTINGS_QUERY_KEY, (old) => {
            if (!old) return old;
            return { ...old, [field]: value };
        });

        // Accumulate updates
        setPendingUpdates((prev) => ({
            ...prev,
            [field]: value,
        }));
        setHasChanges(true);
    }, [queryClient]);

    const saveSettings = useCallback(() => {
        if (updateMutation.isPending) {
            return;
        }
        if (Object.keys(pendingUpdates).length === 0) {
            toast.info('No changes to save');
            return;
        }
        updateMutation.mutate(pendingUpdates);
    }, [pendingUpdates, updateMutation, updateMutation.isPending]);

    const discardChanges = useCallback(() => {
        setPendingUpdates({});
        setHasChanges(false);
        // Reset to original values
        queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
        toast.info('Changes discarded');
    }, [queryClient]);
    return {
        settings: settingsQuery.data,
        isLoading: settingsQuery.isLoading,
        isError: settingsQuery.isError,
        updateSettings,
        saveSettings,
        discardChanges,
        hasChanges,
        isSaving: updateMutation.isPending,
    };
};
